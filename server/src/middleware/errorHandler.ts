import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
}

export class ValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message: string = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (
  error: Error | ZodError | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', error);
  }

  if (error instanceof ZodError) {
    const messages = error.issues.map((err: unknown) => {
      const issue = err as { path: (string | number)[]; message: string };
      return {
        field: issue.path.join('.'),
        message: issue.message,
      };
    });
    res.status(400).json({
      error: 'Validation failed',
      details: messages,
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  if (error instanceof AuthorizationError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  if (error instanceof ConflictError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  const statusCode = (error as ApiError).statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
  });
};
