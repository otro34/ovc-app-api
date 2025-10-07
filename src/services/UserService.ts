import bcrypt from 'bcryptjs';
import { User } from '../types';
import { FileStorage } from './FileStorage';
import logger from '../config/logger';
import { env } from '../config/env';
import { ErrorFactory } from '../utils/errors';

export interface UserFilters {
  role?: 'admin' | 'user';
  search?: string; // Search by username, name, or email
}

export interface UserStats {
  total: number;
  byRole: {
    admin: number;
    user: number;
  };
}

export class UserService {
  private userStorage: FileStorage<User>;

  constructor() {
    this.userStorage = new FileStorage<User>('users.json', env.dataDir);
  }

  /**
   * Get all users with optional filtering
   */
  async findAll(filters?: UserFilters): Promise<Omit<User, 'password'>[]> {
    logger.info('Fetching all users', { filters });

    let users = await this.userStorage.findAll();

    // Apply role filter
    if (filters?.role) {
      users = users.filter((u) => u.role === filters.role);
    }

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(searchLower) ||
          u.name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
      );
    }

    // Remove passwords from response
    return users.map(({ password: _, ...user }) => user);
  }

  /**
   * Get user by ID
   */
  async findById(id: number): Promise<Omit<User, 'password'>> {
    logger.info(`Fetching user by ID: ${id}`);

    const user = await this.userStorage.findById(id);

    if (!user) {
      throw ErrorFactory.notFound('User', id.toString());
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Create a new user
   */
  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Omit<User, 'password'>> {
    logger.info(`Creating new user: ${userData.username}`);

    // Validate required fields
    if (!userData.username || !userData.password) {
      throw ErrorFactory.validationError('Username and password are required');
    }

    // Check if username already exists
    const users = await this.userStorage.findAll();
    const existingUser = users.find((u) => u.username === userData.username);

    if (existingUser) {
      throw ErrorFactory.validationError('Username already exists');
    }

    // Check if email already exists
    if (userData.email) {
      const emailExists = users.find((u) => u.email === userData.email);
      if (emailExists) {
        throw ErrorFactory.validationError('Email already exists');
      }
    }

    // Validate password strength
    if (userData.password.length < 6) {
      throw ErrorFactory.validationError('Password must be at least 6 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user', // Default to 'user' role
    };

    const createdUser = await this.userStorage.create(newUser);

    logger.info(`User created successfully: ${userData.username} (ID: ${createdUser.id})`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  /**
   * Update an existing user
   */
  async update(
    id: number,
    updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password'>>
  ): Promise<Omit<User, 'password'>> {
    logger.info(`Updating user ID: ${id}`, { updates });

    // Check if user exists
    const existingUser = await this.userStorage.findById(id);
    if (!existingUser) {
      throw ErrorFactory.notFound('User', id.toString());
    }

    // Validate username uniqueness if being updated
    if (updates.username && updates.username !== existingUser.username) {
      const users = await this.userStorage.findAll();
      const usernameExists = users.find((u) => u.username === updates.username && u.id !== id);
      if (usernameExists) {
        throw ErrorFactory.validationError('Username already exists');
      }
    }

    // Validate email uniqueness if being updated
    if (updates.email && updates.email !== existingUser.email) {
      const users = await this.userStorage.findAll();
      const emailExists = users.find((u) => u.email === updates.email && u.id !== id);
      if (emailExists) {
        throw ErrorFactory.validationError('Email already exists');
      }
    }

    // Update user
    const updatedUser = await this.userStorage.update(id, updates);

    if (!updatedUser) {
      throw ErrorFactory.notFound('User', id.toString());
    }

    logger.info(`User updated successfully: ${id}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Delete a user
   */
  async delete(id: number): Promise<void> {
    logger.info(`Deleting user ID: ${id}`);

    // Check if user exists
    const user = await this.userStorage.findById(id);
    if (!user) {
      throw ErrorFactory.notFound('User', id.toString());
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const users = await this.userStorage.findAll();
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        throw ErrorFactory.validationError('Cannot delete the last admin user');
      }
    }

    await this.userStorage.delete(id);

    logger.info(`User deleted successfully: ${id}`);
  }

  /**
   * Update user password (admin only)
   */
  async updatePassword(userId: number, newPassword: string): Promise<void> {
    logger.info(`Admin updating password for user ID: ${userId}`);

    const user = await this.userStorage.findById(userId);

    if (!user) {
      throw ErrorFactory.notFound('User', userId.toString());
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      throw ErrorFactory.validationError('Password must be at least 6 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password (explicitly casting to allow password update)
    await this.userStorage.update(userId, { password: hashedPassword } as Partial<User>);

    logger.info(`Password updated successfully by admin for user ID: ${userId}`);
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    logger.info('Fetching user statistics');

    const users = await this.userStorage.findAll();

    const stats: UserStats = {
      total: users.length,
      byRole: {
        admin: users.filter((u) => u.role === 'admin').length,
        user: users.filter((u) => u.role === 'user').length,
      },
    };

    return stats;
  }
}
