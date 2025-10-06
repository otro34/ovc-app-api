import { AuthService } from './AuthService';
import { FileStorage } from './FileStorage';
import bcrypt from 'bcryptjs';
import { User } from '../types';

jest.mock('./FileStorage');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserStorage: jest.Mocked<FileStorage<User>>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockUserStorage = (authService as any).userStorage;
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserStorage.findAll.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.username).toBe('testuser');
    });

    it('should throw error if user not found', async () => {
      mockUserStorage.findAll.mockResolvedValue([]);

      await expect(
        authService.login({ username: 'nonexistent', password: 'password' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is invalid', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user'
      };

      mockUserStorage.findAll.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ username: 'testuser', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user' as const
      };

      const createdUser: User = {
        id: 1,
        ...newUser,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserStorage.findAll.mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockUserStorage.create.mockResolvedValue(createdUser);

      const result = await authService.register(newUser);

      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('newuser');
      expect(mockUserStorage.create).toHaveBeenCalled();
    });

    it('should throw error if username already exists', async () => {
      const existingUser: User = {
        id: 1,
        username: 'existinguser',
        password: 'hashedpassword',
        role: 'user'
      };

      mockUserStorage.findAll.mockResolvedValue([existingUser]);

      await expect(
        authService.register({
          username: 'existinguser',
          password: 'password123',
          role: 'user'
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should throw error if email already exists', async () => {
      const existingUser: User = {
        id: 1,
        username: 'user1',
        password: 'hashedpassword',
        email: 'existing@example.com',
        role: 'user'
      };

      mockUserStorage.findAll.mockResolvedValue([existingUser]);

      await expect(
        authService.register({
          username: 'newuser',
          password: 'password123',
          email: 'existing@example.com',
          role: 'user'
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'oldhashedpassword',
        role: 'user'
      };

      mockUserStorage.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
      mockUserStorage.update.mockResolvedValue({
        ...mockUser,
        password: 'newhashedpassword'
      });

      await authService.changePassword(1, 'oldpassword', 'newpassword');

      expect(mockUserStorage.update).toHaveBeenCalledWith(1, {
        password: 'newhashedpassword'
      });
    });

    it('should throw error if current password is incorrect', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user'
      };

      mockUserStorage.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(1, 'wrongpassword', 'newpassword')
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw error if new password is too short', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user'
      };

      mockUserStorage.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.changePassword(1, 'oldpassword', '123')
      ).rejects.toThrow('New password must be at least 6 characters long');
    });

    it('should throw error if user not found', async () => {
      mockUserStorage.findById.mockResolvedValue(null);

      await expect(
        authService.changePassword(999, 'oldpassword', 'newpassword')
      ).rejects.toThrow('User not found');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      mockUserStorage.findById.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser(1);

      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('testuser');
    });

    it('should throw error if user not found', async () => {
      mockUserStorage.findById.mockResolvedValue(null);

      await expect(authService.getCurrentUser(999)).rejects.toThrow('User not found');
    });
  });
});
