import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { findUserWorkspaces } from '../../modules/workspace/workspace.repository.js';

export async function notificationHandler(socket: Socket): Promise<void> {
  try {
    // 1. read JWT from handshake
    const token = socket.handshake.auth['token'] as string | undefined;

    if (!token) {
      socket.emit('error', { message: 'Authentication token missing' });
      socket.disconnect();
      return;
    }

    // 2. verify token
    let userId: string;
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      userId = payload.userId;
    } catch {
      socket.emit('error', { message: 'Invalid or expired token' });
      socket.disconnect();
      return;
    }

    // 3. attach userId to socket for later use
    socket.data.userId = userId;

    // 4. join personal room
    await socket.join(`user:${userId}`);

    // 5. join all workspace rooms this user belongs to
    const workspaces = await findUserWorkspaces(userId);
    for (const workspace of workspaces) {
      await socket.join(`workspace:${workspace._id.toString()}`);
    }

    console.log(`Socket connected: ${socket.id} | user: ${userId}`);

    // 6. handle manual workspace join (when user creates/joins a new workspace)
    socket.on('join_workspace', async (workspaceId: string) => {
      await socket.join(`workspace:${workspaceId}`);
      console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
    });

    // 7. handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} | user: ${userId}`);
      // socket.io auto-removes from all rooms — no cleanup needed
    });

  } catch (err) {
    console.error('Socket connection error:', err);
    socket.disconnect();
  }
}