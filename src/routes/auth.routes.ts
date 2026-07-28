import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', protect, AuthController.getMe);
router.post('/change-password', protect, AuthController.changePassword);

export default router;
