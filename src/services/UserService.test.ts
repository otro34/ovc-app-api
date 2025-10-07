import { UserService } from './UserService';
import { FileStorage } from './FileStorage';
import { User } from '../types';
import bcrypt from 'bcryptjs';

// Mock FileStorage
jest.mock('./FileStorage');
jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;
  let mockUserStorage: jest.Mocked<FileStorage<User>>;

  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      password: 'hashedpassword',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      username: 'user1',
      password: 'hashedpassword',
      email: 'user1@example.com',
      name: 'Regular User',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    userService = new UserService();
    mockUserStorage = (userService as unknown as { userStorage: jest.Mocked<FileStorage<User>> })
      .userStorage;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(result[0].username).toBe('admin');
    });

    it('should filter users by role', async () => {
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      const result = await userService.findAll({ role: 'admin' });

      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('admin');
      expect(result[0].role).toBe('admin');
    });

    it('should search users by username', async () => {
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      const result = await userService.findAll({ search: 'user1' });

      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('user1');
    });

    it('should search users by email', async () => {
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      const result = await userService.findAll({ search: 'admin@example.com' });

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('admin@example.com');
    });
  });

  describe('findById', () => {
    it('should return user without password when found', async () => {
      mockUserStorage.findById.mockResolvedValue(mockUsers[0]);

      const result = await userService.findById(1);

      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('admin');
      expect(result.id).toBe(1);
    });

    it('should throw error when user not found', async () => {
      mockUserStorage.findById.mockResolvedValue(null);

      await expect(userService.findById(999)).rejects.toThrow("User with id '999' not found");
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const newUserData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        name: 'New User',
        role: 'user' as const,
      };

      mockUserStorage.findAll.mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockUserStorage.create.mockResolvedValue({
        ...newUserData,
        id: 3,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userService.create(newUserData);

      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('newuser');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw error if username already exists', async () => {
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      await expect(
        userService.create({
          username: 'admin',
          password: 'password',
          role: 'user',
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should throw error if email already exists', async () => {
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      await expect(
        userService.create({
          username: 'newuser',
          password: 'password',
          email: 'admin@example.com',
          role: 'user',
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should throw error if password is too short', async () => {
      mockUserStorage.findAll.mockResolvedValue([]);

      await expect(
        userService.create({
          username: 'newuser',
          password: '12345',
          role: 'user',
        })
      ).rejects.toThrow('Password must be at least 6 characters long');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updates = { name: 'Updated Name', email: 'updated@example.com' };

      mockUserStorage.findById.mockResolvedValue(mockUsers[0]);
      mockUserStorage.findAll.mockResolvedValue(mockUsers);
      mockUserStorage.update.mockResolvedValue({
        ...mockUsers[0],
        ...updates,
      });

      const result = await userService.update(1, updates);

      expect(result).not.toHaveProperty('password');
      expect(result.name).toBe('Updated Name');
    });

    it('should throw error if user not found', async () => {
      mockUserStorage.findById.mockResolvedValue(null);

      await expect(userService.update(999, { name: 'Test' })).rejects.toThrow(
        "User with id '999' not found"
      );
    });

    it('should throw error if new username already exists', async () => {
      mockUserStorage.findById.mockResolvedValue(mockUsers[0]);
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      await expect(userService.update(1, { username: 'user1' })).rejects.toThrow(
        'Username already exists'
      );
    });

    it('should throw error if new email already exists', async () => {
      mockUserStorage.findById.mockResolvedValue(mockUsers[0]);
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      await expect(userService.update(1, { email: 'user1@example.com' })).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockUserStorage.findById.mockResolvedValue(mockUsers[1]); // regular user
      mockUserStorage.findAll.mockResolvedValue(mockUsers); // Multiple admins exist
      mockUserStorage.delete.mockResolvedValue(true);

      await userService.delete(2);

      expect(mockUserStorage.delete).toHaveBeenCalledWith(2);
    });

    it('should throw error if user not found', async () => {
      mockUserStorage.findById.mockResolvedValue(null);

      await expect(userService.delete(999)).rejects.toThrow("User with id '999' not found");
    });

    it('should throw error when deleting the last admin', async () => {
      const singleAdmin = [mockUsers[0]]; // Only one admin
      mockUserStorage.findById.mockResolvedValue(mockUsers[0]);
      mockUserStorage.findAll.mockResolvedValue(singleAdmin);

      await expect(userService.delete(1)).rejects.toThrow('Cannot delete the last admin user');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockUserStorage.findById.mockResolvedValue(mockUsers[0]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
      mockUserStorage.update.mockResolvedValue({
        ...mockUsers[0],
        password: 'newhashedpassword',
      });

      await userService.updatePassword(1, 'newpassword123');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockUserStorage.update).toHaveBeenCalledWith(1, { password: 'newhashedpassword' });
    });

    it('should throw error if user not found', async () => {
      mockUserStorage.findById.mockResolvedValue(null);

      await expect(userService.updatePassword(999, 'newpassword')).rejects.toThrow(
        "User with id '999' not found"
      );
    });

    it('should throw error if new password is too short', async () => {
      mockUserStorage.findById.mockResolvedValue(mockUsers[0]);

      await expect(userService.updatePassword(1, '12345')).rejects.toThrow(
        'Password must be at least 6 characters long'
      );
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      mockUserStorage.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getStats();

      expect(result).toEqual({
        total: 2,
        byRole: {
          admin: 1,
          user: 1,
        },
      });
    });

    it('should return correct stats when no users exist', async () => {
      mockUserStorage.findAll.mockResolvedValue([]);

      const result = await userService.getStats();

      expect(result).toEqual({
        total: 0,
        byRole: {
          admin: 0,
          user: 0,
        },
      });
    });
  });
});
