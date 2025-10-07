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
 * Paginated response helper (overload 1 - accepts paginated data object)
 */
export function paginatedResponse<T>(
  res: Response,
  paginatedData: { items: T[]; pagination: PaginationMeta },
  message?: string
): void;

/**
 * Paginated response helper (overload 2 - accepts individual parameters)
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): void;

/**
 * Paginated response helper implementation
 */
export function paginatedResponse<T>(
  res: Response,
  dataOrPaginated: T[] | { items: T[]; pagination: PaginationMeta },
  pageOrMessage?: number | string,
  limit?: number,
  total?: number,
  message = 'Success'
): void {
  let data: T[];
  let meta: PaginationMeta;

  // Check if first parameter is paginated data object
  if (
    typeof dataOrPaginated === 'object' &&
    'items' in dataOrPaginated &&
    'pagination' in dataOrPaginated
  ) {
    data = dataOrPaginated.items;
    meta = dataOrPaginated.pagination;
    message = (pageOrMessage as string) || message;
  } else {
    // Traditional parameters
    data = dataOrPaginated as T[];
    const page = pageOrMessage as number;
    const totalPages = Math.ceil(total! / limit!);
    meta = {
      page,
      limit: limit!,
      total: total!,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  successResponse(res, data, message, 200, meta);
}
