import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';
import { ConflictError, NotFoundError, AuthenticationError } from '../middleware/errorHandler';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.timezone
    );

    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      next(new ConflictError('User with this email already exists'));
    } else {
      next(error);
    }
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData.email, validatedData.password);

    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid email or password')) {
      next(new AuthenticationError('Invalid email or password'));
    } else {
      next(error);
    }
  }
});

router.get('/me', verifyToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AuthenticationError('User ID not found in token');
    }

    const user = await authService.getProfile(req.userId);

    res.status(200).json({
      message: 'Profile fetched successfully',
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('User not found')) {
      next(new NotFoundError('User not found'));
    } else {
      next(error);
    }
  }
});

export default router;
