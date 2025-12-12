import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST /auth/register - Register a new user
router.post('/register', authController.register.bind(authController));

// POST /auth/login - Login user
router.post('/login', authController.login.bind(authController));

export { router as authRouter };
