import { Router, Response } from 'express';
import { ClientService } from '../services/ClientService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createClientSchema,
  updateClientSchema,
  getClientSchema,
  deleteClientSchema,
  listClientsSchema,
} from '../schemas/client.schemas';
import { successResponse, createdResponse, paginatedResponse } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { paginate } from '../utils/pagination';

const router = Router();
const clientService = new ClientService();

/**
 * @openapi
 * /clients:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Get all clients
 *     description: Retrieve a paginated list of all clients with optional search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by client name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  authenticate,
  validate(listClientsSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      search,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const clients = await clientService.findAll({
      search: search as string,
    });

    // Sort clients
    clients.sort((a, b) => {
      const field = sortBy as 'name' | 'email' | 'createdAt';
      const order = sortOrder === 'asc' ? 1 : -1;

      if (field === 'createdAt') {
        return (
          (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) * order
        );
      }

      const aVal = (a[field] || '').toString().toLowerCase();
      const bVal = (b[field] || '').toString().toLowerCase();
      return aVal.localeCompare(bVal) * order;
    });

    const paginatedResult = paginate(clients, parseInt(page as string), parseInt(limit as string));

    paginatedResponse(res, paginatedResult);
  })
);

/**
 * @openapi
 * /clients/stats:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Get client statistics
 *     description: Get statistics about clients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const stats = await clientService.getStats();
    successResponse(res, stats);
  })
);

/**
 * @openapi
 * /clients/{id}:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Get a client by ID
 *     description: Retrieve detailed information about a specific client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  authenticate,
  validate(getClientSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const client = await clientService.findById(id);
    successResponse(res, client);
  })
);

/**
 * @openapi
 * /clients:
 *   post:
 *     tags:
 *       - Clients
 *     summary: Create a new client
 *     description: Create a new client (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corporation"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@acme.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, Country"
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *                 message:
 *                   type: string
 *                   example: "Client created successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 */
router.post(
  '/',
  authenticate,
  validate(createClientSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const client = await clientService.create(req.body);
    createdResponse(res, client, 'Client created successfully');
  })
);

/**
 * @openapi
 * /clients/{id}:
 *   put:
 *     tags:
 *       - Clients
 *     summary: Update a client
 *     description: Update client information (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corporation Inc."
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@acme.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, Country"
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *                 message:
 *                   type: string
 *                   example: "Client updated successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 */
router.put(
  '/:id',
  authenticate,
  validate(updateClientSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const client = await clientService.update(id, req.body);
    successResponse(res, client, 'Client updated successfully');
  })
);

/**
 * @openapi
 * /clients/{id}:
 *   delete:
 *     tags:
 *       - Clients
 *     summary: Delete a client
 *     description: Delete a client (requires admin role). Cannot delete clients with active contracts.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Client deleted successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Cannot delete client with active contracts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(deleteClientSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    await clientService.delete(id);
    successResponse(res, null, 'Client deleted successfully');
  })
);

export default router;
