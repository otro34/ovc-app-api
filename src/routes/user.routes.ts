import { Router, Response } from 'express';
import { UserService } from '../services/UserService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { successResponse, createdResponse, paginatedResponse } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  deleteUserSchema,
  updateUserPasswordSchema,
  getUsersQuerySchema,
} from '../schemas/user.schemas';
import logger from '../config/logger';
import { paginate } from '../utils/pagination';

const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username, name, or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaginatedUsers'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(getUsersQuerySchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { role, search, page = 1, limit = 20 } = req.query;

    const filters = {
      role: role as 'admin' | 'user' | undefined,
      search: search as string | undefined,
    };

    const allUsers = await userService.findAll(filters);
    const paginatedData = paginate(allUsers, page as number, limit as number);

    paginatedResponse(res, paginatedData, 'Users retrieved successfully');
  })
);

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 10
 *                         byRole:
 *                           type: object
 *                           properties:
 *                             admin:
 *                               type: integer
 *                               example: 2
 *                             user:
 *                               type: integer
 *                               example: 8
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    const stats = await userService.getStats();
    successResponse(res, stats, 'User statistics retrieved successfully');
  })
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(getUserByIdSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id, 10);
    const user = await userService.findById(userId);

    successResponse(res, user, 'User retrieved successfully');
  })
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           example:
 *             username: johndoe
 *             password: password123
 *             email: john@example.com
 *             name: John Doe
 *             role: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createUserSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userData = req.body;

    try {
      const user = await userService.create(userData);
      createdResponse(res, user, 'User created successfully');
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             name: John Doe Updated
 *             email: john.updated@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateUserSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id, 10);
    const updates = req.body;

    try {
      const user = await userService.update(userId, updates);
      successResponse(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(deleteUserSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id, 10);

    try {
      await userService.delete(userId);
      successResponse(res, null, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     summary: Update user password (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put(
  '/:id/password',
  authenticate,
  authorize('admin'),
  validate(updateUserPasswordSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    try {
      await userService.updatePassword(userId, newPassword);
      successResponse(res, null, 'Password updated successfully');
    } catch (error) {
      logger.error('Update password error:', error);
      throw error;
    }
  })
);

export default router;
