import { Router } from 'express';
import mongoose from 'mongoose';
import redis from '../../config/redis.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

router.get('/', async (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'ok' : 'error';

  let redisStatus = 'ok';
  try {
    await redis.ping();
  } catch {
    redisStatus = 'error';
  }

  const status = mongoStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded';

  res.status(status === 'ok' ? 200 : 503).json(
    new ApiResponse(status === 'ok' ? 200 : 503, 'Health check', {
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
    })
  );
});

export default router;