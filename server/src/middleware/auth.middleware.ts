import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticationError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export const verifyToken = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const payload = authService.verifyToken(token);

    if (!payload) {
      throw new AuthenticationError('Invalid or expired token');
    }

    req.userId = payload.userId;
    req.email = payload.email;
    next();
  } catch (error) {
    next(error);
  }
};
