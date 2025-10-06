import fs from 'fs/promises';
import path from 'path';
import { FileData } from '../types';
import logger from '../config/logger';

export class FileStorage<T extends { id?: number }> {
  private filePath: string;
  private lockPath: string;
  private cache: T[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor(filename: string, dataDir: string) {
    this.filePath = path.join(dataDir, filename);
    this.lockPath = `${this.filePath}.lock`;
  }

  /**
   * Initialize the file if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      const initialData: FileData<T> = {
        metadata: {
          version: '1.0',
          lastModified: new Date().toISOString(),
          totalRecords: 0,
        },
        data: [],
      };
      await this.writeFile(initialData);
      logger.info(`Initialized file: ${this.filePath}`);
    }
  }

  /**
   * Acquire file lock
   */
  private async acquireLock(timeout = 5000): Promise<void> {
    const startTime = Date.now();
    while (true) {
      try {
        await fs.writeFile(this.lockPath, process.pid.toString(), { flag: 'wx' });
        return;
      } catch {
        if (Date.now() - startTime > timeout) {
          throw new Error(`Failed to acquire lock for ${this.filePath} after ${timeout}ms`);
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  }

  /**
   * Release file lock
   */
  private async releaseLock(): Promise<void> {
    try {
      await fs.unlink(this.lockPath);
    } catch (error) {
      logger.warn(`Failed to release lock for ${this.filePath}`, error);
    }
  }

  /**
   * Read file with caching
   */
  private async readFile(): Promise<FileData<T>> {
    if (this.cache && Date.now() < this.cacheExpiry) {
      return {
        metadata: {
          version: '1.0',
          lastModified: new Date().toISOString(),
          totalRecords: this.cache.length,
        },
        data: this.cache,
      };
    }

    const content = await fs.readFile(this.filePath, 'utf-8');
    const fileData: FileData<T> = JSON.parse(content);

    this.cache = fileData.data;
    this.cacheExpiry = Date.now() + this.CACHE_TTL;

    return fileData;
  }

  /**
   * Write file atomically using temporary file
   */
  private async writeFile(data: FileData<T>): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;

    try {
      // Validate data before writing
      if (!data.metadata || !Array.isArray(data.data)) {
        throw new Error('Invalid data structure');
      }

      // Update metadata
      data.metadata.lastModified = new Date().toISOString();
      data.metadata.totalRecords = data.data.length;

      // Write to temporary file
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');

      // Atomic rename
      await fs.rename(tempPath, this.filePath);

      // Invalidate cache
      this.cache = data.data;
      this.cacheExpiry = Date.now() + this.CACHE_TTL;

      logger.debug(`File written successfully: ${this.filePath}`);
    } catch (error) {
      // Cleanup temp file on error
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Get all records
   */
  async findAll(): Promise<T[]> {
    await this.initialize();
    const fileData = await this.readFile();
    return fileData.data;
  }

  /**
   * Find record by ID
   */
  async findById(id: number): Promise<T | null> {
    const records = await this.findAll();
    return records.find((record) => record.id === id) || null;
  }

  /**
   * Find records by condition
   */
  async find(predicate: (record: T) => boolean): Promise<T[]> {
    const records = await this.findAll();
    return records.filter(predicate);
  }

  /**
   * Find one record by condition
   */
  async findOne(predicate: (record: T) => boolean): Promise<T | null> {
    const records = await this.findAll();
    return records.find(predicate) || null;
  }

  /**
   * Create new record
   */
  async create(record: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    await this.acquireLock();
    try {
      await this.initialize();
      const fileData = await this.readFile();

      // Generate new ID
      const maxId = fileData.data.reduce((max, r) => Math.max(max, r.id || 0), 0);
      const newId = maxId + 1;

      const newRecord = {
        ...record,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as T;

      fileData.data.push(newRecord);
      await this.writeFile(fileData);

      return newRecord;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Update record by ID
   */
  async update(id: number, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    await this.acquireLock();
    try {
      await this.initialize();
      const fileData = await this.readFile();

      const index = fileData.data.findIndex((record) => record.id === id);
      if (index === -1) {
        return null;
      }

      const updatedRecord = {
        ...fileData.data[index],
        ...updates,
        updatedAt: new Date(),
      } as unknown as T;

      fileData.data[index] = updatedRecord;
      await this.writeFile(fileData);

      return updatedRecord;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: number): Promise<boolean> {
    await this.acquireLock();
    try {
      await this.initialize();
      const fileData = await this.readFile();

      const initialLength = fileData.data.length;
      fileData.data = fileData.data.filter((record) => record.id !== id);

      if (fileData.data.length === initialLength) {
        return false;
      }

      await this.writeFile(fileData);
      return true;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Count records
   */
  async count(predicate?: (record: T) => boolean): Promise<number> {
    const records = await this.findAll();
    return predicate ? records.filter(predicate).length : records.length;
  }

  /**
   * Check if record exists
   */
  async exists(predicate: (record: T) => boolean): Promise<boolean> {
    const records = await this.findAll();
    return records.some(predicate);
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Batch update (for complex operations)
   */
  async batchUpdate(updater: (data: T[]) => T[]): Promise<void> {
    await this.acquireLock();
    try {
      await this.initialize();
      const fileData = await this.readFile();

      const originalData = JSON.stringify(fileData.data);
      try {
        fileData.data = updater(fileData.data);
        await this.writeFile(fileData);
      } catch (error) {
        // Rollback on error
        fileData.data = JSON.parse(originalData);
        throw error;
      }
    } finally {
      await this.releaseLock();
    }
  }
}
