import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues
        .map((i: { message: string }) => i.message)
        .join(', ');
      return next(new ApiError(400, message));
    }

    (req as any).validatedQuery = result.data;
    next();
  };
}
