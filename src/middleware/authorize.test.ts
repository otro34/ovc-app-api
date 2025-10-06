import { Response, NextFunction } from 'express';
import { authorize, adminOnly, authenticatedUser } from './authorize';
import { AuthRequest } from './auth';

describe('authorize middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should return 401 if user is not authenticated', () => {
    const middleware = authorize('admin');
    middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      },
      timestamp: expect.any(String)
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user does not have required role', () => {
    mockRequest.user = {
      id: 1,
      username: 'user1',
      email: 'user@example.com',
      role: 'user'
    };

    const middleware = authorize('admin');
    middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden',
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource'
      },
      timestamp: expect.any(String)
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() if user has admin role', () => {
    mockRequest.user = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    };

    const middleware = authorize('admin');
    middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should call next() if user has user role and user is allowed', () => {
    mockRequest.user = {
      id: 1,
      username: 'user1',
      email: 'user@example.com',
      role: 'user'
    };

    const middleware = authorize('admin', 'user');
    middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  describe('adminOnly', () => {
    it('should allow admin users', () => {
      mockRequest.user = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      };

      adminOnly(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should block regular users', () => {
      mockRequest.user = {
        id: 1,
        username: 'user1',
        email: 'user@example.com',
        role: 'user'
      };

      adminOnly(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authenticatedUser', () => {
    it('should allow admin users', () => {
      mockRequest.user = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      };

      authenticatedUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow regular users', () => {
      mockRequest.user = {
        id: 1,
        username: 'user1',
        email: 'user@example.com',
        role: 'user'
      };

      authenticatedUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should block unauthenticated requests', () => {
      authenticatedUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
