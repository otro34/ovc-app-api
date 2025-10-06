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
      email: 'otro34@hotmail.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Development server'
    },
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Local server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authorization header using the Bearer scheme. Example: "Bearer {token}"'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'User ID'
          },
          username: {
            type: 'string',
            description: 'Username'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          name: {
            type: 'string',
            description: 'User full name'
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Username'
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token'
          },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Username'
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          name: {
            type: 'string',
            description: 'User full name'
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
            default: 'user'
          }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'confirmPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            format: 'password',
            description: 'Current password'
          },
          newPassword: {
            type: 'string',
            format: 'password',
            description: 'New password'
          },
          confirmPassword: {
            type: 'string',
            format: 'password',
            description: 'Confirm new password'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Success status'
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          message: {
            type: 'string',
            description: 'Response message'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Response timestamp'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Success status',
            example: false
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Error code'
              },
              message: {
                type: 'string',
                description: 'Detailed error message'
              },
              details: {
                type: 'object',
                description: 'Additional error details'
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp'
          }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized - Invalid or missing authentication token',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Unauthorized',
              error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication token is required'
              },
              timestamp: '2025-10-06T11:00:00.000Z'
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Forbidden',
              error: {
                code: 'FORBIDDEN',
                message: 'You do not have permission to access this resource'
              },
              timestamp: '2025-10-06T11:00:00.000Z'
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found - Resource does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              error: {
                code: 'NOT_FOUND',
                message: 'Resource not found'
              },
              timestamp: '2025-10-06T11:00:00.000Z'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation Error - Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Validation error',
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Missing required fields'
              },
              timestamp: '2025-10-06T11:00:00.000Z'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Clients',
      description: 'Client management endpoints'
    },
    {
      name: 'Contracts',
      description: 'Contract management endpoints'
    },
    {
      name: 'Purchase Orders',
      description: 'Purchase order management endpoints'
    },
    {
      name: 'System',
      description: 'System configuration and management endpoints'
    },
    {
      name: 'Health',
      description: 'Health check and monitoring endpoints'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/app.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
