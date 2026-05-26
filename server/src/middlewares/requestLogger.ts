import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'http';
import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: () => randomUUID(),
  customLogLevel: (_req: IncomingMessage, res: ServerResponse) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req: IncomingMessage & { id: string; method: string; url: string }) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res: ServerResponse) => ({
      statusCode: res.statusCode,
    }),
  },
});