import { EventEmitter } from 'events';
import type { AppEvent } from './events.js';

type EventPayloads = {
    'task:created':              { taskId: string; workspaceId: string; actorId: string; data: unknown };
    'task:updated':              { taskId: string; workspaceId: string; actorId: string; data: unknown };
    'task:deleted':              { taskId: string; workspaceId: string; actorId: string; data: unknown };
    'workspace:member_invited':  { workspaceId: string; userId: string; actorId: string; data: unknown };
    'workspace:member_removed':  { workspaceId: string; userId: string; actorId: string; data: unknown };
    'user:mentioned':            { taskId: string; mentionedUserId: string; byUserId: string };
};

class AppEventEmitter extends EventEmitter {
    emit<E extends AppEvent>(event: E, payload: EventPayloads[E]): boolean {
        return super.emit(event, payload);
    }

    on<E extends AppEvent>(event: E, listener: (payload: EventPayloads[E]) => void): this {
        return super.on(event, listener);
    }

    off<E extends AppEvent>(event: E, listener: (payload: EventPayloads[E]) => void): this {
        return super.off(event, listener);
    }

    once<E extends AppEvent>(event: E, listener: (payload: EventPayloads[E]) => void): this {
        return super.once(event, listener);
    }
}

export const appEvents = new AppEventEmitter({ captureRejections: true });
