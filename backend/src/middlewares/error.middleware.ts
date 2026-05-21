import { Application, Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error]:', err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Return validation error format for Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  res.status(status).json({
    success: false,
    message
  });
};
