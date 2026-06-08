import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initSocket } from './config/socket.js';
import { registerTaskEventHandlers } from './events/handlers/task.events.js';
import { registerWorkspaceEventHandlers } from './events/handlers/workspace.events.js';
import { startEmailWorker } from './queues/index.js';
import mongoose from 'mongoose';
import redis from './config/redis.js';

const start = async () => {
  await connectDB();

  // register event handlers
  registerTaskEventHandlers();
  registerWorkspaceEventHandlers();

  startEmailWorker();

  // create HTTP server from Express app
  const httpServer = createServer(app);

  // attach Socket.io to the SAME HTTP server
  initSocket(httpServer);

  // now listen on httpServer instead of app
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);

    httpServer.close(async () => {
      await mongoose.connection.close();
      await redis.quit();
      logger.info('Server shut down cleanly');
      process.exit(1);
    });

    // force kill after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('max requests limit exceeded') || message.includes('Connection is closed')) {
      logger.warn({ err }, 'Redis unavailable — ignoring unhandled rejection, server stays up');
      return;
    }
    logger.error({ err }, 'Unhandled Rejection');
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught Exception');
    process.exit(1);
  });
};

start();