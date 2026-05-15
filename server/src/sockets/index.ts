import type { Server } from 'socket.io';
import { notificationHandler } from './handlers/notification.handler.js';

export function registerSocketHandlers(io: Server): void {
  io.on('connection', notificationHandler);
}