import app from './app';
import { config } from './config/env';
import logger from './config/logger';

const startServer = () => {
  try {
    app.listen(config.port, () => {
      logger.info(`🚀 Server started on port ${config.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`💾 Data directory: ${config.dataDir}`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
      logger.info(`📌 Version: http://localhost:${config.port}/version`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
