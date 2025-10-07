import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/apiResponse';
import { ErrorCode } from '../utils/errors';

/**
 * Validation target
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation middleware factory
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const validated = schema.parse(data);
      req[target] = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.path.length > 0 ? getNestedValue(req[target], err.path) : undefined,
        }));

        errorResponse(
          res,
          {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details,
          },
          'Request validation failed',
          400
        );
        return;
      }

      // Unexpected error
      next(error);
    }
  };
}

/**
 * Helper to get nested value from object
 */
function getNestedValue(obj: unknown, path: PropertyKey[]): unknown {
  if (!obj || typeof obj !== 'object') return undefined;

  let current: unknown = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<PropertyKey, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}
