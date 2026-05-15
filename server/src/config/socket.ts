import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { env } from './env.js';
import { logger } from './logger.js';
import { registerSocketHandlers } from '../sockets/index.js';

let io: Server;

export function initSocket(httpServer: HTTPServer): void {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  registerSocketHandlers(io);
  logger.info('Socket.io initialized');
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized — call initSocket first');
  return io;
}