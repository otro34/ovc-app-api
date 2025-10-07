#!/usr/bin/env ts-node

/**
 * Development Data Seeding Script
 * HU-042: Development Data Seeding
 *
 * Usage: npm run seed
 *
 * This script populates the database with sample data for development and testing.
 * It creates users, clients, contracts, and purchase orders.
 */

import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { ClientService } from '../services/ClientService';
import { env } from '../config/env';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SeedStats {
  users: number;
  clients: number;
  contracts: number;
  purchaseOrders: number;
}

class DataSeeder {
  private authService: AuthService;
  private userService: UserService;
  private clientService: ClientService;
  private stats: SeedStats = {
    users: 0,
    clients: 0,
    contracts: 0,
    purchaseOrders: 0,
  };

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
    this.clientService = new ClientService();
  }

  /**
   * Main seed method
   */
  async seed(): Promise<void> {
    try {
      console.log('🌱 Starting data seeding...\n');

      // Check if data directory exists
      await this.ensureDataDirectory();

      // Seed users
      await this.seedUsers();

      // Seed clients
      await this.seedClients();

      // Seed contracts (placeholder for future implementation)
      await this.seedContracts();

      // Seed purchase orders (placeholder for future implementation)
      await this.seedPurchaseOrders();

      // Print summary
      this.printSummary();
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    }
  }

  /**
   * Ensure data directory exists
   */
  private async ensureDataDirectory(): Promise<void> {
    const dataPath = path.resolve(env.dataDir);
    try {
      await fs.access(dataPath);
    } catch {
      console.log(`📁 Creating data directory: ${dataPath}`);
      await fs.mkdir(dataPath, { recursive: true });
    }
  }

  /**
   * Seed users
   */
  private async seedUsers(): Promise<void> {
    console.log('👥 Seeding users...');

    const users = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@ovc-app.com',
        name: 'Administrator',
        role: 'admin' as const,
      },
      {
        username: 'jdoe',
        password: 'password123',
        email: 'john.doe@ovc-app.com',
        name: 'John Doe',
        role: 'user' as const,
      },
      {
        username: 'jsmith',
        password: 'password123',
        email: 'jane.smith@ovc-app.com',
        name: 'Jane Smith',
        role: 'user' as const,
      },
      {
        username: 'mmanager',
        password: 'password123',
        email: 'mike.manager@ovc-app.com',
        name: 'Mike Manager',
        role: 'admin' as const,
      },
      {
        username: 'soperator',
        password: 'password123',
        email: 'sarah.operator@ovc-app.com',
        name: 'Sarah Operator',
        role: 'user' as const,
      },
    ];

    // Fetch all existing users once and build a set of usernames
    const existingUsers = await this.userService.findAll();
    const existingUsernames = new Set(existingUsers.map((u) => u.username));

    for (const userData of users) {
      try {
        // Check if user already exists
        const userExists = existingUsernames.has(userData.username);

        if (!userExists) {
          await this.authService.register(userData);
          this.stats.users++;
          existingUsernames.add(userData.username); // Update set in case registration is immediate
          console.log(`  ✅ Created user: ${userData.username} (${userData.role})`);
        } else {
          console.log(`  ⏭️  User already exists: ${userData.username}`);
        }
      } catch (error: any) {
        console.log(`  ⚠️  Failed to create user ${userData.username}: ${error.message}`);
      }
    }
  }

  /**
   * Seed clients
   */
  private async seedClients(): Promise<void> {
    console.log('\n🏢 Seeding clients...');

    const clients = [
      {
        name: 'Palm Oil Traders Inc.',
        email: 'contact@palmoiltraders.com',
        phone: '+1-555-0100',
        address: '100 Palm Street, Miami, FL 33101',
      },
      {
        name: 'Global Bio Energy Ltd.',
        email: 'info@globalbioenergy.com',
        phone: '+44-20-7946-0958',
        address: '25 Energy House, London EC2A 4JB, UK',
      },
      {
        name: 'Asian Pacific Palm Co.',
        email: 'sales@asiapacificpalm.sg',
        phone: '+65-6234-5678',
        address: '10 Marina Boulevard, Singapore 018983',
      },
      {
        name: 'Green Future Industries',
        email: 'procurement@greenfuture.de',
        phone: '+49-30-12345678',
        address: 'Grüner Weg 42, 10115 Berlin, Germany',
      },
      {
        name: 'Sustainable Oils Brazil',
        email: 'comercial@oleossustentaveis.com.br',
        phone: '+55-11-3456-7890',
        address: 'Av. Paulista 1000, São Paulo, SP 01310-100, Brazil',
      },
      {
        name: 'Mediterranean Import Export',
        email: 'trade@medimportexport.es',
        phone: '+34-91-234-5678',
        address: 'Calle Mayor 50, 28013 Madrid, Spain',
      },
      {
        name: 'Nordic Bio Resources',
        email: 'contact@nordicbioresources.se',
        phone: '+46-8-123-4567',
        address: 'Drottninggatan 100, 111 60 Stockholm, Sweden',
      },
      {
        name: 'Australian Palm Products',
        email: 'orders@auspalm.com.au',
        phone: '+61-2-9876-5432',
        address: '200 George Street, Sydney NSW 2000, Australia',
      },
      {
        name: 'Canadian Renewable Oils',
        email: 'info@canrenewable.ca',
        phone: '+1-604-555-0200',
        address: '1500 West Georgia Street, Vancouver, BC V6G 2Z6, Canada',
      },
      {
        name: 'Middle East Trading Co.',
        email: 'sales@metrading.ae',
        phone: '+971-4-234-5678',
        address: 'Sheikh Zayed Road, Dubai, UAE',
      },
    ];

    // Cache existing client emails (lowercased) for fast lookup
    const existingClients = await this.clientService.findAll();
    const existingEmails = new Set<string>(
      existingClients.map((c) => c.email?.toLowerCase()).filter((email): email is string => !!email)
    );

    for (const clientData of clients) {
      try {
        const emailLower = clientData.email.toLowerCase();
        const clientExists = existingEmails.has(emailLower);

        if (!clientExists) {
          await this.clientService.create(clientData);
          this.stats.clients++;
          existingEmails.add(emailLower); // Track newly inserted email
          console.log(`  ✅ Created client: ${clientData.name}`);
        } else {
          console.log(`  ⏭️  Client already exists: ${clientData.name}`);
        }
      } catch (error: any) {
        console.log(`  ⚠️  Failed to create client ${clientData.name}: ${error.message}`);
      }
    }
  }

  /**
   * Seed contracts (placeholder for future implementation)
   */
  private async seedContracts(): Promise<void> {
    console.log('\n📄 Seeding contracts...');
    console.log('  ⏳ Contract seeding will be implemented in HU-013');

    // TODO: Implement contract seeding when ContractService is available
    // This is a placeholder for Sprint 6 (HU-013)
  }

  /**
   * Seed purchase orders (placeholder for future implementation)
   */
  private async seedPurchaseOrders(): Promise<void> {
    console.log('\n📦 Seeding purchase orders...');
    console.log('  ⏳ Purchase order seeding will be implemented in HU-016');

    // TODO: Implement purchase order seeding when PurchaseOrderService is available
    // This is a placeholder for Sprint 7 (HU-016)
  }

  /**
   * Print seeding summary
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Users created:          ${this.stats.users}`);
    console.log(`✅ Clients created:        ${this.stats.clients}`);
    console.log(`⏳ Contracts created:      ${this.stats.contracts} (pending implementation)`);
    console.log(
      `⏳ Purchase Orders created: ${this.stats.purchaseOrders} (pending implementation)`
    );
    console.log('='.repeat(50));
    console.log('\n🎉 Data seeding completed successfully!');
  }
}

// Run seeder if called directly
if (require.main === module) {
  const seeder = new DataSeeder();
  seeder
    .seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error during seeding:', error);
      process.exit(1);
    });
}

export default DataSeeder;
