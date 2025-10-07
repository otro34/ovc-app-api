import { Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse
} from './apiResponse';
import { ErrorCode } from './errors';

describe('API Response Utilities', () => {
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: sendMock });

    mockResponse = {
      status: statusMock
    } as Partial<Response>;
  });

  describe('successResponse', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };

      successResponse(mockResponse as Response, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Success',
        timestamp: expect.any(String)
      });
    });

    it('should accept custom message and status code', () => {
      const data = { id: 1 };

      successResponse(mockResponse as Response, data, 'Custom message', 201);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Custom message',
        timestamp: expect.any(String)
      });
    });

    it('should include pagination meta when provided', () => {
      const data = [1, 2, 3];
      const meta = {
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNext: true,
        hasPrev: false
      };

      successResponse(mockResponse as Response, data, 'Success', 200, meta);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Success',
        timestamp: expect.any(String),
        meta
      });
    });
  });

  describe('errorResponse', () => {
    it('should send error response', () => {
      const error = {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid input'
      };

      errorResponse(mockResponse as Response, error, 'Error occurred', 400);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error occurred',
        error,
        timestamp: expect.any(String)
      });
    });

    it('should use default message when not provided', () => {
      const error = {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong'
      };

      errorResponse(mockResponse as Response, error);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error',
        error,
        timestamp: expect.any(String)
      });
    });
  });

  describe('createdResponse', () => {
    it('should send 201 created response', () => {
      const data = { id: 1, name: 'New Item' };

      createdResponse(mockResponse as Response, data);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Resource created successfully',
        timestamp: expect.any(String)
      });
    });

    it('should accept custom message', () => {
      const data = { id: 1 };

      createdResponse(mockResponse as Response, data, 'User created');

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'User created',
        timestamp: expect.any(String)
      });
    });
  });

  describe('noContentResponse', () => {
    it('should send 204 no content response', () => {
      noContentResponse(mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });
  });

  describe('paginatedResponse', () => {
    it('should send paginated response with metadata', () => {
      const data = [1, 2, 3, 4, 5];
      const page = 2;
      const limit = 5;
      const total = 50;

      paginatedResponse(mockResponse as Response, data, page, limit, total);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Success',
        timestamp: expect.any(String),
        meta: {
          page: 2,
          limit: 5,
          total: 50,
          totalPages: 10,
          hasNext: true,
          hasPrev: true
        }
      });
    });

    it('should calculate hasNext and hasPrev correctly for first page', () => {
      const data = [1, 2, 3];

      paginatedResponse(mockResponse as Response, data, 1, 10, 15);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.meta.hasNext).toBe(true);
      expect(callArgs.meta.hasPrev).toBe(false);
    });

    it('should calculate hasNext and hasPrev correctly for last page', () => {
      const data = [1, 2];

      paginatedResponse(mockResponse as Response, data, 5, 10, 42);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.meta.hasNext).toBe(false);
      expect(callArgs.meta.hasPrev).toBe(true);
      expect(callArgs.meta.totalPages).toBe(5);
    });
  });
});
