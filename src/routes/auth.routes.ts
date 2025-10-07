import { Router, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { successResponse, createdResponse } from '../utils/apiResponse';
import { ErrorFactory } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth.schemas';
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
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
      const result = await authService.login({ username, password });
      successResponse(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      throw ErrorFactory.authenticationFailed('Invalid credentials');
    }
  })
);

// POST /auth/register
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { username, password, email, name, role } = req.body;

    try {
      const user = await authService.register({
        username,
        password,
        email,
        name,
        role: role || 'user'
      });

      createdResponse(res, user, 'User registered successfully');
    } catch (error) {
      logger.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      throw ErrorFactory.validationError(message);
    }
  })
);

// GET /auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw ErrorFactory.unauthorized('User not authenticated');
    }

    const user = await authService.getCurrentUser(req.user.id);
    successResponse(res, user, 'User retrieved successfully');
  })
);

// POST /auth/change-password
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw ErrorFactory.unauthorized('User not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    try {
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password error:', error);
      const message = error instanceof Error ? error.message : 'Failed to change password';
      throw ErrorFactory.validationError(message);
    }
  })
);

// POST /auth/logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    // Since we're using JWT, logout is handled client-side by removing the token
    // This endpoint is kept for API consistency and future enhancements (e.g., token blacklist)
    successResponse(res, null, 'Logout successful');
  })
);

export default router;
