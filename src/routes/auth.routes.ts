import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticate, AuthRequest } from '../middleware/auth';
import logger from '../config/logger';

const router = Router();
const authService = new AuthService();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             username: admin
 *             password: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const result = await authService.login({ username, password });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid credentials'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email, name, role } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username and password are required',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await authService.register({
      username,
      password,
      email,
      name,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
      error: {
        code: 'REGISTRATION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to register user'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(404).json({
      success: false,
      message: 'User not found',
      error: {
        code: 'USER_NOT_FOUND',
        message: error instanceof Error ? error.message : 'Failed to retrieve user'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// POST /auth/change-password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'All password fields are required',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passwords do not match'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to change password',
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to change password'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// POST /auth/logout
router.post('/logout', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint is kept for API consistency and future enhancements (e.g., token blacklist)
  res.status(200).json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

export default router;
