import { Client } from '../types';
import { FileStorage } from './FileStorage';
import logger from '../config/logger';
import { env } from '../config/env';
import { ErrorFactory } from '../utils/errors';

export interface ClientFilters {
  search?: string; // Search by name or email
}

export class ClientService {
  private clientStorage: FileStorage<Client>;

  constructor() {
    this.clientStorage = new FileStorage<Client>('clients.json', env.dataDir);
  }

  /**
   * Get all clients with optional filtering
   */
  async findAll(filters?: ClientFilters): Promise<Client[]> {
    logger.info('Fetching all clients', { filters });

    let clients = await this.clientStorage.findAll();

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      clients = clients.filter(
        (c) => {
          const email = c.email ? c.email.toLowerCase() : '';
          return c.name.toLowerCase().includes(searchLower) || email.includes(searchLower);
        }
      );
    }

    return clients;
  }

  /**
   * Find a client by ID
   */
  async findById(id: number): Promise<Client> {
    logger.info('Finding client by ID', { id });

    const client = await this.clientStorage.findById(id);

    if (!client) {
      throw ErrorFactory.notFound('Client not found');
    }

    return client;
  }

  /**
   * Create a new client
   */
  async create(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    logger.info('Creating new client', { name: clientData.name });

    // Validate email uniqueness if provided
    if (clientData.email) {
      const existingClients = await this.clientStorage.findAll();
      const emailExists = existingClients.some(
        (c) => c.email?.toLowerCase() === clientData.email?.toLowerCase()
      );

      if (emailExists) {
        throw ErrorFactory.conflict('Client with this email already exists');
      }
    }

    const newClient: Client = {
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdClient = await this.clientStorage.create(newClient);
    logger.info('Client created successfully', { id: createdClient.id });

    return createdClient;
  }

  /**
   * Update an existing client
   */
  async update(
    id: number,
    updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Client> {
    logger.info('Updating client', { id, updates });

    // Check if client exists
    const existingClient = await this.clientStorage.findById(id);
    if (!existingClient) {
      throw ErrorFactory.notFound('Client not found');
    }

    // Validate email uniqueness if email is being updated
    if (updates.email && updates.email !== existingClient.email) {
      const allClients = await this.clientStorage.findAll();
      const emailExists = allClients.some(
        (c) => c.id !== id && c.email?.toLowerCase() === updates.email?.toLowerCase()
      );

      if (emailExists) {
        throw ErrorFactory.conflict('Client with this email already exists');
      }
    }

    const updatedClient = await this.clientStorage.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    if (!updatedClient) {
      throw ErrorFactory.notFound('Client not found');
    }

    logger.info('Client updated successfully', { id });
    return updatedClient;
  }

  /**
   * Delete a client
   * Note: HU-011 requires checking for active contracts before deletion
   */
  async delete(id: number): Promise<void> {
    logger.info('Deleting client', { id });

    // Check if client exists
    const client = await this.clientStorage.findById(id);
    if (!client) {
      throw ErrorFactory.notFound('Client not found');
    }

    // Business rule: Cannot delete client with active contracts
    // This will be implemented in HU-011 when ContractService is available
    // For now, we allow deletion
    const hasContracts = await this.hasActiveContracts(id);
    if (hasContracts) {
      throw ErrorFactory.businessRule(
        'Cannot delete client with active contracts',
        'CLIENT_HAS_CONTRACTS'
      );
    }

    await this.clientStorage.delete(id);
    logger.info('Client deleted successfully', { id });
  }

  /**
   * Check if a client has active contracts
   * This is a placeholder for HU-011 and will be properly implemented when ContractService is available
   */
  private async hasActiveContracts(clientId: number): Promise<boolean> {
    // TODO: Implement when ContractService is available (HU-013)
    // For now, return false to allow deletion during development
    try {
      const contractStorage = new FileStorage<any>('contracts.json', env.dataDir);
      const contracts = await contractStorage.findAll();
      return contracts.some((contract: any) => contract.clientId === clientId);
    } catch {
      // If contracts.json doesn't exist yet, return false
      return false;
    }
  }

  /**
   * Get client statistics
   */
  async getStats(): Promise<{ total: number }> {
    logger.info('Getting client statistics');

    const clients = await this.clientStorage.findAll();

    return {
      total: clients.length,
    };
  }
}
