import { Request } from 'express';
import { getPaginationParams, paginateArray, calculatePaginationMeta, PAGINATION_CONFIG } from './pagination';

describe('Pagination Utils', () => {
  describe('getPaginationParams', () => {
    it('should return default pagination when no query params', () => {
      const req = { query: {} } as Request;
      const result = getPaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
        skip: 0
      });
    });

    it('should parse valid page and limit from query', () => {
      const req = { query: { page: '2', limit: '20' } } as unknown as Request;
      const result = getPaginationParams(req);

      expect(result).toEqual({
        page: 2,
        limit: 20,
        skip: 20
      });
    });

    it('should enforce max limit', () => {
      const req = { query: { limit: '200' } } as unknown as Request;
      const result = getPaginationParams(req);

      expect(result.limit).toBe(PAGINATION_CONFIG.MAX_LIMIT);
    });

    it('should use default limit when limit is 0', () => {
      const req = { query: { limit: '0' } } as unknown as Request;
      const result = getPaginationParams(req);

      expect(result.limit).toBe(PAGINATION_CONFIG.DEFAULT_LIMIT);
    });

    it('should enforce min page', () => {
      const req = { query: { page: '-1' } } as unknown as Request;
      const result = getPaginationParams(req);

      expect(result.page).toBe(PAGINATION_CONFIG.MIN_PAGE);
    });

    it('should handle invalid query params', () => {
      const req = { query: { page: 'invalid', limit: 'invalid' } } as unknown as Request;
      const result = getPaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
        skip: 0
      });
    });
  });

  describe('paginateArray', () => {
    it('should paginate array correctly', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginateArray(items, 1, 5);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return second page correctly', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginateArray(items, 2, 5);

      expect(result).toEqual([6, 7, 8, 9, 10]);
    });

    it('should return empty array for page beyond data', () => {
      const items = [1, 2, 3];
      const result = paginateArray(items, 5, 5);

      expect(result).toEqual([]);
    });

    it('should handle empty array', () => {
      const items: number[] = [];
      const result = paginateArray(items, 1, 10);

      expect(result).toEqual([]);
    });
  });

  describe('calculatePaginationMeta', () => {
    it('should calculate metadata for first page', () => {
      const meta = calculatePaginationMeta(50, 1, 10);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNext: true,
        hasPrev: false
      });
    });

    it('should calculate metadata for middle page', () => {
      const meta = calculatePaginationMeta(50, 3, 10);

      expect(meta).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNext: true,
        hasPrev: true
      });
    });

    it('should calculate metadata for last page', () => {
      const meta = calculatePaginationMeta(50, 5, 10);

      expect(meta).toEqual({
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNext: false,
        hasPrev: true
      });
    });

    it('should handle single page', () => {
      const meta = calculatePaginationMeta(5, 1, 10);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should handle empty results', () => {
      const meta = calculatePaginationMeta(0, 1, 10);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    });
  });
});
