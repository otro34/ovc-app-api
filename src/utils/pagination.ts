import { Request } from 'express';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  MIN_PAGE: 1,
};

/**
 * Extract and validate pagination parameters from request
 */
export function getPaginationParams(req: Request): PaginationParams {
  const page = Math.max(
    parseInt(req.query.page as string, 10) || PAGINATION_CONFIG.DEFAULT_PAGE,
    PAGINATION_CONFIG.MIN_PAGE
  );

  let limit = parseInt(req.query.limit as string, 10) || PAGINATION_CONFIG.DEFAULT_LIMIT;

  // Enforce limits
  limit = Math.max(limit, PAGINATION_CONFIG.MIN_LIMIT);
  limit = Math.min(limit, PAGINATION_CONFIG.MAX_LIMIT);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Paginate array of items
 */
export function paginateArray<T>(items: T[], page: number, limit: number): T[] {
  const skip = (page - 1) * limit;
  return items.slice(skip, skip + limit);
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Paginate array and return with metadata
 */
export function paginate<T>(items: T[], page: number, limit: number) {
  const paginatedItems = paginateArray(items, page, limit);
  const pagination = calculatePaginationMeta(items.length, page, limit);

  return {
    items: paginatedItems,
    pagination,
  };
}
