import { Router } from 'express';
import type { Request, Response } from 'express';

import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json(
    new ApiResponse(200, 'Server is healthy', {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  );
});

export default router;



