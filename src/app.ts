import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import logger from './config/logger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import clientRoutes from './routes/client.routes';
import {
  apiRateLimiter,
  authRateLimiter,
  sanitizeInput,
  validateContentType,
  securityHeaders
} from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Content type validation
app.use(validateContentType);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'OVC-APP API Documentation'
}));

// API Routes
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1/users', apiRateLimiter, userRoutes);
app.use('/api/v1/clients', apiRateLimiter, clientRoutes);
app.use('/api/v1', apiRateLimiter); // Apply rate limiting to all other API routes

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// API version endpoint
app.get('/version', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      version: process.env.npm_package_version || '1.0.0',
      apiVersion: 'v1',
      nodeVersion: process.version,
      environment: config.nodeEnv,
    },
  });
});

// 404 handler - must come before error handler
app.use(notFoundHandler);

// Global error handling middleware - must be last
app.use(errorHandler);

export default app;
