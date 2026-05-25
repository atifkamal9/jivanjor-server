import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Jivanjor Server running on port ${env.PORT}`);
  console.log(`🔧 Mode: ${env.NODE_ENV}`);
  console.log(`=========================================`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
