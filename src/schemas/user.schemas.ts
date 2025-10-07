import { z } from 'zod';

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters'),
    email: z.string().email('Invalid email format').optional(),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    role: z.enum(['admin', 'user']).optional(),
  }),
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number'),
  }),
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .optional(),
    email: z.string().email('Invalid email format').optional(),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    role: z.enum(['admin', 'user']).optional(),
  }),
});

/**
 * Schema for getting a user by ID
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number'),
  }),
});

/**
 * Schema for deleting a user
 */
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number'),
  }),
});

/**
 * Schema for updating user password (admin only)
 */
export const updateUserPasswordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number'),
  }),
  body: z.object({
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters'),
  }),
});

/**
 * Schema for filtering/searching users
 */
export const getUsersQuerySchema = z.object({
  query: z
    .object({
      role: z.enum(['admin', 'user']).optional(),
      search: z.string().optional(),
      page: z.string().regex(/^\d+$/, 'Page must be a positive number').transform(Number).optional(),
      limit: z
        .string()
        .regex(/^\d+$/, 'Limit must be a positive number')
        .transform(Number)
        .optional(),
    })
    .optional()
    .default({}),
});
