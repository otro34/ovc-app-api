import fs from 'fs/promises';
import path from 'path';
import { FileStorage } from './FileStorage';

interface TestRecord {
  id?: number;
  name: string;
  value: number;
  createdAt?: Date;
  updatedAt?: Date;
}

describe('FileStorage', () => {
  const testDir = path.join(__dirname, '../../test-data');
  const testFile = 'test-records.json';
  let storage: FileStorage<TestRecord>;

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  beforeEach(async () => {
    storage = new FileStorage<TestRecord>(testFile, testDir);
    // Clean up any existing test file
    try {
      await fs.unlink(path.join(testDir, testFile));
    } catch {
      // Ignore if file doesn't exist
    }
  });

  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  describe('initialize', () => {
    it('should create file if it does not exist', async () => {
      await storage.initialize();
      const records = await storage.findAll();
      expect(records).toEqual([]);
    });

    it('should not overwrite existing file', async () => {
      await storage.create({ name: 'test', value: 1 });
      await storage.initialize();
      const records = await storage.findAll();
      expect(records.length).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a new record with auto-generated id', async () => {
      const record = await storage.create({ name: 'test1', value: 100 });
      expect(record.id).toBe(1);
      expect(record.name).toBe('test1');
      expect(record.value).toBe(100);
      expect(record.createdAt).toBeInstanceOf(Date);
      expect(record.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate sequential ids', async () => {
      const record1 = await storage.create({ name: 'test1', value: 100 });
      const record2 = await storage.create({ name: 'test2', value: 200 });
      expect(record1.id).toBe(1);
      expect(record2.id).toBe(2);
    });

    it('should handle concurrent creates', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        storage.create({ name: `test${i}`, value: i })
      );
      const records = await Promise.all(promises);
      const ids = records.map((r) => r.id);
      expect(new Set(ids).size).toBe(5); // All IDs should be unique
    });
  });

  describe('findAll', () => {
    it('should return empty array when no records', async () => {
      const records = await storage.findAll();
      expect(records).toEqual([]);
    });

    it('should return all records', async () => {
      await storage.create({ name: 'test1', value: 100 });
      await storage.create({ name: 'test2', value: 200 });
      const records = await storage.findAll();
      expect(records.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return record when found', async () => {
      const created = await storage.create({ name: 'test1', value: 100 });
      const found = await storage.findById(created.id!);
      expect(found).toEqual(created);
    });

    it('should return null when not found', async () => {
      const found = await storage.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      await storage.create({ name: 'test1', value: 100 });
      await storage.create({ name: 'test2', value: 200 });
      await storage.create({ name: 'test3', value: 300 });
    });

    it('should find records by condition', async () => {
      const records = await storage.find((r) => r.value > 150);
      expect(records.length).toBe(2);
      expect(records.every((r) => r.value > 150)).toBe(true);
    });

    it('should return empty array when no matches', async () => {
      const records = await storage.find((r) => r.value > 1000);
      expect(records).toEqual([]);
    });
  });

  describe('findOne', () => {
    beforeEach(async () => {
      await storage.create({ name: 'test1', value: 100 });
      await storage.create({ name: 'test2', value: 200 });
    });

    it('should find first matching record', async () => {
      const record = await storage.findOne((r) => r.value >= 100);
      expect(record?.value).toBe(100);
    });

    it('should return null when no match', async () => {
      const record = await storage.findOne((r) => r.value > 1000);
      expect(record).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing record', async () => {
      const created = await storage.create({ name: 'test1', value: 100 });
      const updated = await storage.update(created.id!, { name: 'updated', value: 999 });
      expect(updated?.name).toBe('updated');
      expect(updated?.value).toBe(999);
      expect(updated?.id).toBe(created.id);
    });

    it('should update updatedAt timestamp', async () => {
      const created = await storage.create({ name: 'test1', value: 100 });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const updated = await storage.update(created.id!, { value: 200 });
      expect(updated?.updatedAt).not.toEqual(created.updatedAt);
    });

    it('should return null when record not found', async () => {
      const updated = await storage.update(999, { name: 'test' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing record', async () => {
      const created = await storage.create({ name: 'test1', value: 100 });
      const deleted = await storage.delete(created.id!);
      expect(deleted).toBe(true);
      const found = await storage.findById(created.id!);
      expect(found).toBeNull();
    });

    it('should return false when record not found', async () => {
      const deleted = await storage.delete(999);
      expect(deleted).toBe(false);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await storage.create({ name: 'test1', value: 100 });
      await storage.create({ name: 'test2', value: 200 });
      await storage.create({ name: 'test3', value: 300 });
    });

    it('should count all records', async () => {
      const count = await storage.count();
      expect(count).toBe(3);
    });

    it('should count records by condition', async () => {
      const count = await storage.count((r) => r.value > 150);
      expect(count).toBe(2);
    });
  });

  describe('exists', () => {
    beforeEach(async () => {
      await storage.create({ name: 'test1', value: 100 });
    });

    it('should return true when record exists', async () => {
      const exists = await storage.exists((r) => r.name === 'test1');
      expect(exists).toBe(true);
    });

    it('should return false when record does not exist', async () => {
      const exists = await storage.exists((r) => r.name === 'nonexistent');
      expect(exists).toBe(false);
    });
  });

  describe('batchUpdate', () => {
    beforeEach(async () => {
      await storage.create({ name: 'test1', value: 100 });
      await storage.create({ name: 'test2', value: 200 });
    });

    it('should update multiple records', async () => {
      await storage.batchUpdate((data) => data.map((r) => ({ ...r, value: r.value * 2 })));
      const records = await storage.findAll();
      expect(records[0].value).toBe(200);
      expect(records[1].value).toBe(400);
    });

    it('should rollback on error', async () => {
      const originalRecords = await storage.findAll();
      try {
        await storage.batchUpdate(() => {
          throw new Error('Test error');
        });
      } catch {
        // Expected error
      }
      const records = await storage.findAll();
      expect(records).toEqual(originalRecords);
    });
  });

  describe('cache', () => {
    it('should cache read results', async () => {
      await storage.create({ name: 'test1', value: 100 });
      const records1 = await storage.findAll();
      const records2 = await storage.findAll();
      expect(records1).toEqual(records2);
    });

    it('should invalidate cache after write', async () => {
      await storage.create({ name: 'test1', value: 100 });
      await storage.findAll();
      await storage.create({ name: 'test2', value: 200 });
      const records = await storage.findAll();
      expect(records.length).toBe(2);
    });
  });
});
