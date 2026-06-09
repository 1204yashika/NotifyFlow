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

app.set('etag', false); // prevent 304s on dynamic API responses

app.use('/api/docs', (_req, _res, next) => next(), helmet({ contentSecurityPolicy: false }));
app.use(helmet());
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server / curl
    const allowed = [
      env.CLIENT_URL,
      /^https:\/\/notify-flow-.*\.vercel\.app$/,
    ];
    const ok = allowed.some((rule) =>
      typeof rule === 'string' ? rule === origin : rule.test(origin)
    );
    callback(ok ? null : new Error(`CORS: origin ${origin} not allowed`), ok);
  },
  credentials: true,
}));
app.use(requestLogger);
app.use(express.json());

setupSwagger(app);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is up', uptime: Math.floor(process.uptime()) });
});

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/workspaces', workspaceRouter);
app.use('/api/v1/workspaces/:workspaceId/tasks', taskRouter);
app.use('/api/v1/workspaces/:workspaceId/attachments', attachmentRouter);
app.use('/api/v1/users', userRouter);
app.use(errorHandler);

export default app;
