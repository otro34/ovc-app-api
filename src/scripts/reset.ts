#!/usr/bin/env ts-node

/**
 * Development Data Reset Script
 * HU-043: Development Data Reset
 *
 * Usage: npm run reset
 *
 * This script resets all data files to a clean state for development.
 * WARNING: This will delete all existing data!
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { env } from '../config/env';
import readline from 'readline';

interface ResetOptions {
  force?: boolean;
  backup?: boolean;
  seed?: boolean;
}

class DataResetter {
  private dataDir: string;
  private backupDir: string;
  private dataFiles = [
    'users.json',
    'clients.json',
    'contracts.json',
    'purchase-orders.json',
    'system-configuration.json',
    'config.json',
  ];

  constructor() {
    this.dataDir = path.resolve(env.dataDir);
    this.backupDir = path.join(this.dataDir, 'backups');
  }

  /**
   * Main reset method
   */
  async reset(options: ResetOptions = {}): Promise<void> {
    try {
      console.log('🔄 Data Reset Utility\n');

      // Check if data directory exists
      const dataExists = await this.checkDataDirectory();
      if (!dataExists) {
        console.log('📁 No data directory found. Nothing to reset.');
        return;
      }

      // Show current data status
      await this.showDataStatus();

      // Confirm reset unless force flag is set
      if (!options.force) {
        const confirmed = await this.confirmReset();
        if (!confirmed) {
          console.log('❌ Reset cancelled.');
          return;
        }
      }

      // Create backup if requested
      if (options.backup) {
        await this.createBackup();
      }

      // Perform reset
      await this.performReset();

      // Seed initial data if requested
      if (options.seed) {
        await this.seedInitialData();
      }

      console.log('\n✅ Data reset completed successfully!');
    } catch (error) {
      console.error('❌ Reset failed:', error);
      process.exit(1);
    }
  }

  /**
   * Check if data directory exists
   */
  private async checkDataDirectory(): Promise<boolean> {
    try {
      await fs.access(this.dataDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Show current data status
   */
  private async showDataStatus(): Promise<void> {
    console.log('📊 Current Data Status:');
    console.log('─'.repeat(50));

    for (const file of this.dataFiles) {
      const filePath = path.join(this.dataDir, file);
      try {
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        let recordCount = 0;

        try {
          const data = JSON.parse(content);
          if (data.data && Array.isArray(data.data)) {
            recordCount = data.data.length;
          } else if (Array.isArray(data)) {
            recordCount = data.length;
          } else if (typeof data === 'object') {
            recordCount = Object.keys(data).length;
          }
        } catch {
          // Not valid JSON or different structure
        }

        console.log(
          `  📄 ${file.padEnd(30)} ${this.formatSize(stats.size).padEnd(10)} ${recordCount} records`
        );
      } catch {
        console.log(`  ⚫ ${file.padEnd(30)} Not found`);
      }
    }
    console.log('─'.repeat(50));
  }

  /**
   * Format file size
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Confirm reset action
   */
  private async confirmReset(): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      console.log('\n⚠️  WARNING: This will delete ALL data!');
      rl.question('Are you sure you want to reset? (yes/no): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      });
    });
  }

  /**
   * Create backup of current data
   */
  private async createBackup(): Promise<void> {
    console.log('\n💾 Creating backup...');

    // Create backup directory if it doesn't exist
    await fs.mkdir(this.backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupSubDir = path.join(this.backupDir, `backup-${timestamp}`);
    await fs.mkdir(backupSubDir, { recursive: true });

    for (const file of this.dataFiles) {
      const sourcePath = path.join(this.dataDir, file);
      const backupPath = path.join(backupSubDir, file);

      try {
        await fs.copyFile(sourcePath, backupPath);
        console.log(`  ✅ Backed up: ${file}`);
      } catch {
        console.log(`  ⏭️  Skipped: ${file} (not found)`);
      }
    }

    console.log(`\n📁 Backup saved to: ${backupSubDir}`);
  }

  /**
   * Perform the actual reset
   */
  private async performReset(): Promise<void> {
    console.log('\n🗑️  Resetting data files...');

    for (const file of this.dataFiles) {
      const filePath = path.join(this.dataDir, file);

      try {
        // Delete the file
        await fs.unlink(filePath);
        console.log(`  ✅ Deleted: ${file}`);

        // Create empty file with proper structure
        const emptyData = this.getEmptyDataStructure(file);
        await fs.writeFile(filePath, JSON.stringify(emptyData, null, 2));
        console.log(`  ✅ Created empty: ${file}`);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // File doesn't exist, create it
          const emptyData = this.getEmptyDataStructure(file);
          await fs.writeFile(filePath, JSON.stringify(emptyData, null, 2));
          console.log(`  ✅ Created: ${file}`);
        } else {
          console.log(`  ❌ Failed to reset: ${file} - ${error.message}`);
        }
      }
    }
  }

  /**
   * Get empty data structure for a file
   */
  private getEmptyDataStructure(filename: string): any {
    switch (filename) {
      case 'system-configuration.json':
      case 'config.json':
        return {
          metadata: {
            version: '1.0.0',
            lastModified: new Date().toISOString(),
            totalRecords: 0,
          },
          data: {},
        };
      default:
        return {
          metadata: {
            version: '1.0.0',
            lastModified: new Date().toISOString(),
            totalRecords: 0,
          },
          data: [],
        };
    }
  }

  /**
   * Seed initial data (minimal setup)
   */
  private async seedInitialData(): Promise<void> {
    console.log('\n🌱 Seeding initial data...');

    try {
      // Import and run the seeder
      const DataSeeder = (await import('./seed')).default;
      const seeder = new DataSeeder();
      await seeder.seed();
    } catch (error: any) {
      console.log(`  ⚠️  Failed to seed data: ${error.message}`);
      console.log('  You can run "npm run seed" manually later.');
    }
  }
}

// Parse command line arguments
function parseArguments(): ResetOptions {
  const args = process.argv.slice(2);
  const options: ResetOptions = {};

  for (const arg of args) {
    switch (arg) {
      case '--force':
      case '-f':
        options.force = true;
        break;
      case '--backup':
      case '-b':
        options.backup = true;
        break;
      case '--seed':
      case '-s':
        options.seed = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Data Reset Utility

Usage: npm run reset [options]

Options:
  -f, --force    Skip confirmation prompt
  -b, --backup   Create backup before resetting
  -s, --seed     Seed initial data after reset
  -h, --help     Show this help message

Examples:
  npm run reset                 # Reset with confirmation
  npm run reset -- --force      # Reset without confirmation
  npm run reset -- --backup     # Reset with backup
  npm run reset -- --seed       # Reset and seed data
  npm run reset -- -b -s        # Backup and seed
        `);
        process.exit(0);
    }
  }

  return options;
}

// Run resetter if called directly
if (require.main === module) {
  const options = parseArguments();
  const resetter = new DataResetter();

  resetter
    .reset(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error during reset:', error);
      process.exit(1);
    });
}

export default DataResetter;
