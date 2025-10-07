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
      // Build the data object based on what the schema expects
      const dataToValidate: Partial<Record<ValidationTarget, unknown>> = {};

      // Check if schema expects nested structure (body/query/params keys)
      const schemaShape = (schema as { shape?: Record<string, unknown> }).shape;
      const hasNestedStructure = schemaShape &&
        (schemaShape.body || schemaShape.query || schemaShape.params);

      if (hasNestedStructure) {
        // Schema expects full request structure
        if (schemaShape.body) dataToValidate.body = req.body;
        if (schemaShape.query) dataToValidate.query = req.query;
        if (schemaShape.params) dataToValidate.params = req.params;

        const validated = schema.parse(dataToValidate);

        // Update req with validated data
        if (validated && typeof validated === 'object') {
          const validatedObj = validated as Record<string, unknown>;
          if ('body' in validatedObj && validatedObj.body) req.body = validatedObj.body;
          if ('params' in validatedObj && validatedObj.params) {
            req.params = validatedObj.params as Record<string, string>;
          }
          // Don't update query as it's read-only
        }
      } else {
        // Schema validates specific target directly
        const data = req[target];
        const validated = schema.parse(data);

        // Only update if not query (read-only)
        if (target !== 'query') {
          req[target] = validated;
        }
      }

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
