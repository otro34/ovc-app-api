import bcrypt from 'bcryptjs';
import { User } from '../types';
import { FileStorage } from './FileStorage';
import logger from '../config/logger';
import { generateToken } from '../middleware/auth';
import { env } from '../config/env';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  private userStorage: FileStorage<User>;

  constructor() {
    this.userStorage = new FileStorage<User>('users.json', env.dataDir);
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { username, password } = credentials;

    logger.info(`Login attempt for user: ${username}`);

    // Find user by username
    const users = await this.userStorage.findAll();
    const user = users.find((u: User) => u.username === username);

    if (!user) {
      logger.warn(`Login failed: user not found - ${username}`);
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Login failed: invalid password - ${username}`);
      throw new Error('Invalid credentials');
    }

    // Generate token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    logger.info(`Login successful for user: ${username}`);

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async register(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Omit<User, 'password'>> {
    logger.info(`Registering new user: ${userData.username}`);

    // Check if user already exists
    const users = await this.userStorage.findAll();
    const existingUser = users.find((u: User) => u.username === userData.username);

    if (existingUser) {
      logger.warn(`Registration failed: username already exists - ${userData.username}`);
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (userData.email) {
      const emailExists = users.find((u: User) => u.email === userData.email);
      if (emailExists) {
        logger.warn(`Registration failed: email already exists - ${userData.email}`);
        throw new Error('Email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      ...userData,
      password: hashedPassword,
    };

    const createdUser = await this.userStorage.create(newUser);

    logger.info(`User registered successfully: ${userData.username}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    logger.info(`Password change attempt for user ID: ${userId}`);

    const user = await this.userStorage.findById(userId);

    if (!user) {
      logger.warn(`Password change failed: user not found - ${userId}`);
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      logger.warn(`Password change failed: invalid current password - ${userId}`);
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    await this.userStorage.update(userId, { password: hashedPassword });

    logger.info(`Password changed successfully for user ID: ${userId}`);
  }

  async getCurrentUser(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.userStorage.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
