import 'express';
import type { IWorkspace } from '../modules/workspace/workspace.model.js';

declare module 'express' {
  interface Request {
    user?: { userId: string };
    workspace?: IWorkspace;
  }
}
