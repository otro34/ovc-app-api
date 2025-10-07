import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../utils/errors';
import { errorResponse } from '../utils/apiResponse';
import logger from '../config/logger';
import { ZodError } from 'zod';

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Log the error
  logger.error('Error handler caught:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    errorResponse(res, err.toApiError(), err.message, err.statusCode);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    errorResponse(
      res,
      {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details,
      },
      'Validation error',
      400
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(
      res,
      {
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid token',
      },
      'Invalid token',
      401
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(
      res,
      {
        code: ErrorCode.TOKEN_EXPIRED,
        message: 'Token expired',
      },
      'Token expired',
      401
    );
    return;
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';

  errorResponse(
    res,
    {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      ...(isDevelopment && { details: err.stack }),
    },
    err.message || 'Internal server error',
    500
  );
}

/**
 * Async error wrapper to catch promise rejections
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  errorResponse(
    res,
    {
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Route ${req.method} ${req.url} not found`,
    },
    'Route not found',
    404
  );
}
