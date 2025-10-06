import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type UserRole = 'admin' | 'user';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

// Convenience middlewares
export const adminOnly = authorize('admin');
export const authenticatedUser = authorize('admin', 'user');
