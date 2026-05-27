import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestLogger } from './middlewares/requestLogger.js';
import { env } from './config/env.js';
import healthRouter from './modules/health/health.router.js';
import authRouter from './modules/auth/auth.router.js';
import workspaceRouter from './modules/workspace/workspace.router.js';
import taskRouter from './modules/task/task.router.js'
import attachmentRouter from './modules/attachment/attachment.router.js'
import { errorHandler } from './middlewares/errorHandler.js';
import { setupSwagger } from './docs/swagger.js';
import userRouter from './modules/user/user.router.js';

const app = express();

app.use('/api/docs', (_req, _res, next) => next(), helmet({ contentSecurityPolicy: false }));
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(requestLogger);
app.use(express.json());

setupSwagger(app);

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/workspaces', workspaceRouter);
app.use('/api/v1/workspaces/:workspaceId/tasks', taskRouter);
app.use('/api/v1/workspaces/:workspaceId/attachments', attachmentRouter);
app.use('/api/v1/users', userRouter);
app.use(errorHandler);

export default app;
