import { ClientService } from './ClientService';
import { FileStorage } from './FileStorage';
import { Client } from '../types';

// Mock FileStorage
jest.mock('./FileStorage');

describe('ClientService', () => {
  let clientService: ClientService;
  let mockClientStorage: jest.Mocked<FileStorage<Client>>;

  beforeEach(() => {
    jest.clearAllMocks();
    clientService = new ClientService();
    mockClientStorage = (clientService as any).clientStorage;
  });

  describe('findAll', () => {
    it('should return all clients when no filters are provided', async () => {
      const mockClients: Client[] = [
        {
          id: 1,
          name: 'Client A',
          email: 'clienta@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Client B',
          email: 'clientb@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientStorage.findAll.mockResolvedValue(mockClients);

      const result = await clientService.findAll();

      expect(result).toEqual(mockClients);
      expect(mockClientStorage.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter clients by name search', async () => {
      const mockClients: Client[] = [
        {
          id: 1,
          name: 'Acme Corporation',
          email: 'acme@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Global Industries',
          email: 'global@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientStorage.findAll.mockResolvedValue(mockClients);

      const result = await clientService.findAll({ search: 'acme' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Acme Corporation');
    });

    it('should filter clients by email search', async () => {
      const mockClients: Client[] = [
        {
          id: 1,
          name: 'Client A',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Client B',
          email: 'other@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientStorage.findAll.mockResolvedValue(mockClients);

      const result = await clientService.findAll({ search: 'test@' });

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('test@example.com');
    });

    it('should perform case-insensitive search', async () => {
      const mockClients: Client[] = [
        {
          id: 1,
          name: 'Acme Corporation',
          email: 'ACME@EXAMPLE.COM',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientStorage.findAll.mockResolvedValue(mockClients);

      const result = await clientService.findAll({ search: 'ACME' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Acme Corporation');
    });
  });

  describe('findById', () => {
    it('should return a client when found', async () => {
      const mockClient: Client = {
        id: 1,
        name: 'Test Client',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClientStorage.findById.mockResolvedValue(mockClient);

      const result = await clientService.findById(1);

      expect(result).toEqual(mockClient);
      expect(mockClientStorage.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when client does not exist', async () => {
      mockClientStorage.findById.mockResolvedValue(null);

      await expect(clientService.findById(999)).rejects.toThrow('Client not found');
    });
  });

  describe('create', () => {
    it('should create a new client successfully', async () => {
      const clientData = {
        name: 'New Client',
        email: 'new@example.com',
        phone: '+1234567890',
        address: '123 Main St',
      };

      const expectedClient: Client = {
        id: 1,
        ...clientData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockClientStorage.findAll.mockResolvedValue([]);
      mockClientStorage.create.mockResolvedValue(expectedClient);

      const result = await clientService.create(clientData);

      expect(result).toEqual(expectedClient);
      expect(mockClientStorage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should create client without optional fields', async () => {
      const clientData = {
        name: 'Simple Client',
      };

      const expectedClient: Client = {
        id: 1,
        ...clientData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockClientStorage.findAll.mockResolvedValue([]);
      mockClientStorage.create.mockResolvedValue(expectedClient);

      const result = await clientService.create(clientData);

      expect(result).toEqual(expectedClient);
      expect(result.name).toBe('Simple Client');
    });

    it('should throw ConflictError if email already exists', async () => {
      const clientData = {
        name: 'New Client',
        email: 'existing@example.com',
      };

      const existingClients: Client[] = [
        {
          id: 1,
          name: 'Existing Client',
          email: 'existing@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientStorage.findAll.mockResolvedValue(existingClients);

      await expect(clientService.create(clientData)).rejects.toThrow(
        'Client with this email already exists'
      );
      expect(mockClientStorage.create).not.toHaveBeenCalled();
    });

    it('should perform case-insensitive email validation', async () => {
      const clientData = {
        name: 'New Client',
        email: 'TEST@EXAMPLE.COM',
      };

      const existingClients: Client[] = [
        {
          id: 1,
          name: 'Existing Client',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientStorage.findAll.mockResolvedValue(existingClients);

      await expect(clientService.create(clientData)).rejects.toThrow(
        'Client with this email already exists'
      );
    });
  });

  describe('update', () => {
    const existingClient: Client = {
      id: 1,
      name: 'Existing Client',
      email: 'existing@example.com',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a client successfully', async () => {
      const updates = {
        name: 'Updated Name',
        phone: '+9876543210',
      };

      const updatedClient: Client = {
        ...existingClient,
        ...updates,
        updatedAt: new Date(),
      };

      mockClientStorage.findById.mockResolvedValue(existingClient);
      mockClientStorage.update.mockResolvedValue(updatedClient);

      const result = await clientService.update(1, updates);

      expect(result).toEqual(updatedClient);
      expect(mockClientStorage.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: updates.name,
          phone: updates.phone,
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw NotFoundError if client does not exist', async () => {
      mockClientStorage.findById.mockResolvedValue(null);

      await expect(clientService.update(999, { name: 'New Name' })).rejects.toThrow(
        'Client not found'
      );
      expect(mockClientStorage.update).not.toHaveBeenCalled();
    });

    it('should update email if new email is unique', async () => {
      const updates = {
        email: 'newemail@example.com',
      };

      mockClientStorage.findById.mockResolvedValue(existingClient);
      mockClientStorage.findAll.mockResolvedValue([existingClient]);
      mockClientStorage.update.mockResolvedValue({ ...existingClient, ...updates });

      const result = await clientService.update(1, updates);

      expect(result.email).toBe('newemail@example.com');
      expect(mockClientStorage.update).toHaveBeenCalled();
    });

    it('should throw ConflictError if new email already exists', async () => {
      const updates = {
        email: 'taken@example.com',
      };

      const otherClient: Client = {
        id: 2,
        name: 'Other Client',
        email: 'taken@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClientStorage.findById.mockResolvedValue(existingClient);
      mockClientStorage.findAll.mockResolvedValue([existingClient, otherClient]);

      await expect(clientService.update(1, updates)).rejects.toThrow(
        'Client with this email already exists'
      );
      expect(mockClientStorage.update).not.toHaveBeenCalled();
    });

    it('should allow keeping the same email', async () => {
      const updates = {
        name: 'Updated Name',
      };

      mockClientStorage.findById.mockResolvedValue(existingClient);
      mockClientStorage.findAll.mockResolvedValue([existingClient]);
      mockClientStorage.update.mockResolvedValue({ ...existingClient, ...updates });

      await clientService.update(1, updates);

      expect(mockClientStorage.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const mockClient: Client = {
      id: 1,
      name: 'Test Client',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete a client successfully when no contracts exist', async () => {
      mockClientStorage.findById.mockResolvedValue(mockClient);
      mockClientStorage.delete.mockResolvedValue(true);

      // Mock FileStorage constructor for contracts check
      const mockContractStorage = {
        findAll: jest.fn().mockResolvedValue([]),
      };
      (FileStorage as jest.Mock).mockImplementationOnce(() => mockContractStorage);

      await clientService.delete(1);

      expect(mockClientStorage.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError if client does not exist', async () => {
      mockClientStorage.findById.mockResolvedValue(null);

      await expect(clientService.delete(999)).rejects.toThrow('Client not found');
      expect(mockClientStorage.delete).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleError if client has active contracts', async () => {
      mockClientStorage.findById.mockResolvedValue(mockClient);

      // Mock FileStorage for contracts with active contracts
      const mockContractStorage = {
        findAll: jest.fn().mockResolvedValue([
          { id: 1, clientId: 1, status: 'active' },
        ]),
      };
      (FileStorage as jest.Mock).mockImplementationOnce(() => mockContractStorage);

      await expect(clientService.delete(1)).rejects.toThrow(
        'Cannot delete client with active contracts'
      );
      expect(mockClientStorage.delete).not.toHaveBeenCalled();
    });

    it('should allow deletion when contracts.json does not exist', async () => {
      mockClientStorage.findById.mockResolvedValue(mockClient);
      mockClientStorage.delete.mockResolvedValue(true);

      // Mock FileStorage to throw error (file not found)
      const mockContractStorage = {
        findAll: jest.fn().mockRejectedValue(new Error('File not found')),
      };
      (FileStorage as jest.Mock).mockImplementationOnce(() => mockContractStorage);

      await clientService.delete(1);

      expect(mockClientStorage.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const mockClients: Client[] = [
        {
          id: 1,
          name: 'Client A',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Client B',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Client C',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientStorage.findAll.mockResolvedValue(mockClients);

      const result = await clientService.getStats();

      expect(result).toEqual({ total: 3 });
      expect(mockClientStorage.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return zero when no clients exist', async () => {
      mockClientStorage.findAll.mockResolvedValue([]);

      const result = await clientService.getStats();

      expect(result).toEqual({ total: 0 });
    });
  });
});
