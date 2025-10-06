import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dataDir: process.env.DATA_DIR || path.join(__dirname, '../../data'),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiration: process.env.JWT_EXPIRATION || '8h',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    frequency: process.env.BACKUP_FREQUENCY || 'daily',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
