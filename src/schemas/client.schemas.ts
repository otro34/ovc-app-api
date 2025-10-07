import { z } from 'zod';

/**
 * Schema for creating a new client
 */
export const createClientSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name must be less than 255 characters'),
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email must be less than 255 characters')
      .optional(),
    phone: z.string().max(50, 'Phone must be less than 50 characters').optional(),
    address: z.string().max(500, 'Address must be less than 500 characters').optional(),
  }),
});

/**
 * Schema for updating a client
 */
export const updateClientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(1, 'Name cannot be empty')
        .max(255, 'Name must be less than 255 characters')
        .optional(),
      email: z
        .string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters')
        .optional(),
      phone: z.string().max(50, 'Phone must be less than 50 characters').optional(),
      address: z.string().max(500, 'Address must be less than 500 characters').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

/**
 * Schema for getting a client by ID
 */
export const getClientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

/**
 * Schema for deleting a client
 */
export const deleteClientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

/**
 * Schema for listing clients with filters
 */
export const listClientsSchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
});

// Type exports for TypeScript
export type CreateClientInput = z.infer<typeof createClientSchema>['body'];
export type UpdateClientInput = z.infer<typeof updateClientSchema>['body'];
