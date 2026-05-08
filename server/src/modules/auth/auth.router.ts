import { Router } from 'express';
import { loginController, logoutController, refreshController, registerController } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { validateBody } from '../../middlewares/validateBody.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

router.post('/register', validateBody(registerSchema), registerController);
router.post('/login', validateBody(loginSchema), loginController);
router.post('/refresh', refreshController);
router.post('/logout', authenticate, logoutController);
router.post('/check', authenticate, (req, res)=>{
	res.status(200).json(new ApiResponse(200, 'Checked successfully', null));
})

export default router;
