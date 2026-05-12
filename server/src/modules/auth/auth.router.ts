import { Router } from 'express';
import { loginController, logoutController, refreshController, registerController } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { validateBody } from '../../middlewares/validateBody.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { rateLimiter } from '../../middlewares/rateLimiter.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

router.post('/register', rateLimiter(10, 15 * 60), validateBody(registerSchema), registerController);
router.post('/login', rateLimiter(10, 15 * 60), validateBody(loginSchema), loginController);
router.post('/refresh', refreshController);
router.post('/logout', authenticate, logoutController);

export default router;
