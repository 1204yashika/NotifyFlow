import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { registerTaskEventHandlers } from './events/handlers/task.events.js';
import { registerWorkspaceEventHandlers } from './events/handlers/workspace.events.js';
import { startEmailWorker } from './queues/index.js';

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
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    httpServer.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
};

start();