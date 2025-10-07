import { Response } from 'express';

/**
 * Standard API Response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
  error?: ApiError;
  meta?: PaginationMeta;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && { meta }),
  };

  res.status(statusCode).json(response);
}

/**
 * Error response helper
 */
export function errorResponse(
  res: Response,
  error: ApiError,
  message = 'Error',
  statusCode = 400
): void {
  const response: ApiResponse = {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Created response helper (201)
 */
export function createdResponse<T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): void {
  successResponse(res, data, message, 201);
}

/**
 * No content response helper (204)
 */
export function noContentResponse(res: Response): void {
  res.status(204).send();
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = 'Success'
): void {
  const totalPages = Math.ceil(total / limit);
  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  successResponse(res, data, message, 200, meta);
}
