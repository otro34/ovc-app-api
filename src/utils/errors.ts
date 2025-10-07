/**
 * Standard error codes for the API
 */
export enum ErrorCode {
  // Authentication & Authorization (1xxx)
  AUTHENTICATION_FAILED = 'AUTH_1001',
  INVALID_TOKEN = 'AUTH_1002',
  TOKEN_EXPIRED = 'AUTH_1003',
  UNAUTHORIZED = 'AUTH_1004',
  FORBIDDEN = 'AUTH_1005',
  INVALID_CREDENTIALS = 'AUTH_1006',

  // Validation (2xxx)
  VALIDATION_ERROR = 'VAL_2001',
  INVALID_INPUT = 'VAL_2002',
  MISSING_REQUIRED_FIELD = 'VAL_2003',
  INVALID_FORMAT = 'VAL_2004',
  INVALID_LENGTH = 'VAL_2005',

  // Resource Not Found (3xxx)
  RESOURCE_NOT_FOUND = 'RES_3001',
  USER_NOT_FOUND = 'RES_3002',
  CLIENT_NOT_FOUND = 'RES_3003',
  CONTRACT_NOT_FOUND = 'RES_3004',
  PURCHASE_ORDER_NOT_FOUND = 'RES_3005',

  // Business Logic (4xxx)
  BUSINESS_RULE_VIOLATION = 'BIZ_4001',
  DUPLICATE_RESOURCE = 'BIZ_4002',
  RESOURCE_IN_USE = 'BIZ_4003',
  INSUFFICIENT_VOLUME = 'BIZ_4004',
  INVALID_STATE_TRANSITION = 'BIZ_4005',

  // File System (5xxx)
  FILE_READ_ERROR = 'FILE_5001',
  FILE_WRITE_ERROR = 'FILE_5002',
  FILE_NOT_FOUND = 'FILE_5003',
  FILE_CORRUPTED = 'FILE_5004',
  BACKUP_FAILED = 'FILE_5005',

  // System (6xxx)
  INTERNAL_SERVER_ERROR = 'SYS_6001',
  SERVICE_UNAVAILABLE = 'SYS_6002',
  RATE_LIMIT_EXCEEDED = 'SYS_6003',
  CONFIGURATION_ERROR = 'SYS_6004',

  // Registration & User Management (7xxx)
  REGISTRATION_FAILED = 'USER_7001',
  PASSWORD_CHANGE_FAILED = 'USER_7002',
  USERNAME_EXISTS = 'USER_7003',
  EMAIL_EXISTS = 'USER_7004',
  WEAK_PASSWORD = 'USER_7005'
}

/**
 * HTTP Status codes mapping
 */
export const ErrorStatusMap: Record<ErrorCode, number> = {
  // Authentication & Authorization
  [ErrorCode.AUTHENTICATION_FAILED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,

  // Validation
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.INVALID_LENGTH]: 400,

  // Resource Not Found
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.CLIENT_NOT_FOUND]: 404,
  [ErrorCode.CONTRACT_NOT_FOUND]: 404,
  [ErrorCode.PURCHASE_ORDER_NOT_FOUND]: 404,

  // Business Logic
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 422,
  [ErrorCode.DUPLICATE_RESOURCE]: 409,
  [ErrorCode.RESOURCE_IN_USE]: 409,
  [ErrorCode.INSUFFICIENT_VOLUME]: 422,
  [ErrorCode.INVALID_STATE_TRANSITION]: 422,

  // File System
  [ErrorCode.FILE_READ_ERROR]: 500,
  [ErrorCode.FILE_WRITE_ERROR]: 500,
  [ErrorCode.FILE_NOT_FOUND]: 500,
  [ErrorCode.FILE_CORRUPTED]: 500,
  [ErrorCode.BACKUP_FAILED]: 500,

  // System
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.CONFIGURATION_ERROR]: 500,

  // Registration & User Management
  [ErrorCode.REGISTRATION_FAILED]: 400,
  [ErrorCode.PASSWORD_CHANGE_FAILED]: 400,
  [ErrorCode.USERNAME_EXISTS]: 409,
  [ErrorCode.EMAIL_EXISTS]: 409,
  [ErrorCode.WEAK_PASSWORD]: 400
};

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    details?: unknown,
    statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode || ErrorStatusMap[code] || 500;
    this.details = details;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert to API error format
   */
  toApiError() {
    const apiError: { code: ErrorCode; message: string; details?: unknown } = {
      code: this.code,
      message: this.message
    };

    if (this.details) {
      apiError.details = this.details;
    }

    return apiError;
  }
}

/**
 * Factory functions for common errors
 */
export class ErrorFactory {
  static authenticationFailed(message = 'Authentication failed'): AppError {
    return new AppError(ErrorCode.AUTHENTICATION_FAILED, message);
  }

  static unauthorized(message = 'Unauthorized access'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden access'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message);
  }

  static validationError(message: string, details?: unknown): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, details);
  }

  static notFound(resource: string, id?: string): AppError {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    return new AppError(ErrorCode.RESOURCE_NOT_FOUND, message);
  }

  static userNotFound(username?: string): AppError {
    const message = username
      ? `User '${username}' not found`
      : 'User not found';
    return new AppError(ErrorCode.USER_NOT_FOUND, message);
  }

  static duplicateResource(resource: string, field: string): AppError {
    return new AppError(
      ErrorCode.DUPLICATE_RESOURCE,
      `${resource} with this ${field} already exists`
    );
  }

  static resourceInUse(resource: string, reason: string): AppError {
    return new AppError(
      ErrorCode.RESOURCE_IN_USE,
      `Cannot delete ${resource}: ${reason}`
    );
  }

  static businessRuleViolation(message: string): AppError {
    return new AppError(ErrorCode.BUSINESS_RULE_VIOLATION, message);
  }

  static internalError(message = 'Internal server error', details?: unknown): AppError {
    return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, details);
  }
}
