import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'OVC-APP API',
    version: '1.0.0',
    description: 'REST API for managing sales contracts and purchase orders for a palm oil company',
    contact: {
      name: 'API Support',
      email: 'otro34@hotmail.com',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Development server',
    },
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authorization header using the Bearer scheme. Example: "Bearer {token}"',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'User ID',
          },
          username: {
            type: 'string',
            description: 'Username',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Client: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Client ID',
          },
          name: {
            type: 'string',
            description: 'Client name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Client email address',
          },
          phone: {
            type: 'string',
            description: 'Client phone number',
          },
          address: {
            type: 'string',
            description: 'Client address',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      PaginationMetadata: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number',
            example: 1,
          },
          limit: {
            type: 'integer',
            description: 'Items per page',
            example: 10,
          },
          total: {
            type: 'integer',
            description: 'Total number of items',
            example: 100,
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages',
            example: 10,
          },
          hasNext: {
            type: 'boolean',
            description: 'Whether there is a next page',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            description: 'Whether there is a previous page',
            example: false,
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Username',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Username',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
            default: 'user',
          },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'confirmPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            format: 'password',
            description: 'Current password',
          },
          newPassword: {
            type: 'string',
            format: 'password',
            description: 'New password',
          },
          confirmPassword: {
            type: 'string',
            format: 'password',
            description: 'Confirm new password',
          },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            description: 'Username (alphanumeric and underscores only)',
            example: 'johndoe',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 6,
            maxLength: 100,
            description: 'User password',
            example: 'password123',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john@example.com',
          },
          name: {
            type: 'string',
            maxLength: 100,
            description: 'User full name',
            example: 'John Doe',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
            default: 'user',
            example: 'user',
          },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            description: 'Username (alphanumeric and underscores only)',
            example: 'johndoe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john@example.com',
          },
          name: {
            type: 'string',
            maxLength: 100,
            description: 'User full name',
            example: 'John Doe',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
            example: 'user',
          },
        },
      },
      PaginatedUsers: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User',
            },
          },
          pagination: {
            $ref: '#/components/schemas/PaginationMeta',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Success status',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          message: {
            type: 'string',
            description: 'Response message',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Response timestamp',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Success status',
            example: false,
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Error code',
              },
              message: {
                type: 'string',
                description: 'Detailed error message',
              },
              details: {
                type: 'object',
                description: 'Additional error details',
              },
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp',
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number',
            example: 1,
          },
          limit: {
            type: 'integer',
            description: 'Items per page',
            example: 10,
          },
          total: {
            type: 'integer',
            description: 'Total number of items',
            example: 100,
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages',
            example: 10,
          },
          hasNext: {
            type: 'boolean',
            description: 'Whether there is a next page',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            description: 'Whether there is a previous page',
            example: false,
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Success status',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
            description: 'Response data',
          },
          message: {
            type: 'string',
            description: 'Response message',
            example: 'Success',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Response timestamp',
          },
          meta: {
            $ref: '#/components/schemas/PaginationMeta',
          },
        },
      },
      ValidationErrorDetails: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            description: 'Field name that failed validation',
            example: 'username',
          },
          message: {
            type: 'string',
            description: 'Validation error message',
            example: 'Username must be at least 3 characters',
          },
          code: {
            type: 'string',
            description: 'Validation error code',
            example: 'too_small',
          },
          received: {
            description: 'Received value (if applicable)',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Unauthorized - Invalid or missing authentication token',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Unauthorized',
              error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication token is required',
              },
              timestamp: '2025-10-06T11:00:00.000Z',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Forbidden',
              error: {
                code: 'FORBIDDEN',
                message: 'You do not have permission to access this resource',
              },
              timestamp: '2025-10-06T11:00:00.000Z',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Not Found - Resource does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: {
                code: 'NOT_FOUND',
                message: 'Resource not found',
              },
              timestamp: '2025-10-06T11:00:00.000Z',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation Error - Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Request validation failed',
              error: {
                code: 'VAL_2001',
                message: 'Validation failed',
                details: [
                  {
                    field: 'username',
                    message: 'Username must be at least 3 characters',
                    code: 'too_small',
                    received: 'ab',
                  },
                  {
                    field: 'email',
                    message: 'Invalid email format',
                    code: 'invalid_string',
                  },
                ],
              },
              timestamp: '2025-10-06T11:00:00.000Z',
            },
          },
        },
      },
      ConflictError: {
        description: 'Conflict - Resource already exists or conflicts with existing data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: {
                code: 'CONFLICT',
                message: 'Client with this email already exists',
              },
              timestamp: '2025-10-06T11:00:00.000Z',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Clients',
      description: 'Client management endpoints',
    },
    {
      name: 'Contracts',
      description: 'Contract management endpoints',
    },
    {
      name: 'Purchase Orders',
      description: 'Purchase order management endpoints',
    },
    {
      name: 'System',
      description: 'System configuration and management endpoints',
    },
    {
      name: 'Health',
      description: 'Health check and monitoring endpoints',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
