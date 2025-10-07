import { AppError, ErrorCode, ErrorFactory, ErrorStatusMap } from './errors';

describe('Error Utilities', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid input',
        { field: 'username' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AppError');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'username' });
    });

    it('should use mapped status code from ErrorStatusMap', () => {
      const error = new AppError(ErrorCode.USER_NOT_FOUND, 'User not found');

      expect(error.statusCode).toBe(ErrorStatusMap[ErrorCode.USER_NOT_FOUND]);
    });

    it('should allow custom status code override', () => {
      const error = new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Custom error',
        undefined,
        503
      );

      expect(error.statusCode).toBe(503);
    });

    it('should convert to API error format', () => {
      const error = new AppError(
        ErrorCode.UNAUTHORIZED,
        'Access denied',
        { reason: 'token expired' }
      );

      const apiError = error.toApiError();

      expect(apiError).toEqual({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Access denied',
        details: { reason: 'token expired' }
      });
    });

    it('should not include details in API error if not provided', () => {
      const error = new AppError(ErrorCode.FORBIDDEN, 'Forbidden');

      const apiError = error.toApiError();

      expect(apiError).toEqual({
        code: ErrorCode.FORBIDDEN,
        message: 'Forbidden'
      });
      expect(apiError.details).toBeUndefined();
    });
  });

  describe('ErrorFactory', () => {
    describe('authenticationFailed', () => {
      it('should create authentication failed error', () => {
        const error = ErrorFactory.authenticationFailed();

        expect(error.code).toBe(ErrorCode.AUTHENTICATION_FAILED);
        expect(error.message).toBe('Authentication failed');
        expect(error.statusCode).toBe(401);
      });

      it('should accept custom message', () => {
        const error = ErrorFactory.authenticationFailed('Invalid token');

        expect(error.message).toBe('Invalid token');
      });
    });

    describe('unauthorized', () => {
      it('should create unauthorized error', () => {
        const error = ErrorFactory.unauthorized();

        expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
        expect(error.message).toBe('Unauthorized access');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('forbidden', () => {
      it('should create forbidden error', () => {
        const error = ErrorFactory.forbidden();

        expect(error.code).toBe(ErrorCode.FORBIDDEN);
        expect(error.message).toBe('Forbidden access');
        expect(error.statusCode).toBe(403);
      });
    });

    describe('validationError', () => {
      it('should create validation error with details', () => {
        const details = { field: 'email', issue: 'invalid format' };
        const error = ErrorFactory.validationError('Validation failed', details);

        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.message).toBe('Validation failed');
        expect(error.details).toEqual(details);
        expect(error.statusCode).toBe(400);
      });
    });

    describe('notFound', () => {
      it('should create not found error with resource and id', () => {
        const error = ErrorFactory.notFound('User', '123');

        expect(error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
        expect(error.message).toBe("User with id '123' not found");
        expect(error.statusCode).toBe(404);
      });

      it('should create not found error without id', () => {
        const error = ErrorFactory.notFound('User');

        expect(error.message).toBe('User not found');
      });
    });

    describe('userNotFound', () => {
      it('should create user not found error with username', () => {
        const error = ErrorFactory.userNotFound('john');

        expect(error.code).toBe(ErrorCode.USER_NOT_FOUND);
        expect(error.message).toBe("User 'john' not found");
        expect(error.statusCode).toBe(404);
      });

      it('should create user not found error without username', () => {
        const error = ErrorFactory.userNotFound();

        expect(error.message).toBe('User not found');
      });
    });

    describe('duplicateResource', () => {
      it('should create duplicate resource error', () => {
        const error = ErrorFactory.duplicateResource('User', 'username');

        expect(error.code).toBe(ErrorCode.DUPLICATE_RESOURCE);
        expect(error.message).toBe('User with this username already exists');
        expect(error.statusCode).toBe(409);
      });
    });

    describe('resourceInUse', () => {
      it('should create resource in use error', () => {
        const error = ErrorFactory.resourceInUse('Client', 'has active contracts');

        expect(error.code).toBe(ErrorCode.RESOURCE_IN_USE);
        expect(error.message).toBe('Cannot delete Client: has active contracts');
        expect(error.statusCode).toBe(409);
      });
    });

    describe('businessRuleViolation', () => {
      it('should create business rule violation error', () => {
        const error = ErrorFactory.businessRuleViolation('Cannot exceed pending volume');

        expect(error.code).toBe(ErrorCode.BUSINESS_RULE_VIOLATION);
        expect(error.message).toBe('Cannot exceed pending volume');
        expect(error.statusCode).toBe(422);
      });
    });

    describe('internalError', () => {
      it('should create internal error', () => {
        const error = ErrorFactory.internalError();

        expect(error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
        expect(error.message).toBe('Internal server error');
        expect(error.statusCode).toBe(500);
      });

      it('should include details', () => {
        const details = { stack: 'error stack trace' };
        const error = ErrorFactory.internalError('Database error', details);

        expect(error.message).toBe('Database error');
        expect(error.details).toEqual(details);
      });
    });
  });
});
