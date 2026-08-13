import app from './app';
import { env } from './config/env';
import { startCrmSyncWorker, stopCrmSyncWorker } from './workers/crm-sync.worker';
import { startStaleJobRecoveryWorker, stopStaleJobRecoveryWorker } from './workers/stale-job-recovery.worker';

const server = app.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Jivanjor Server running on port ${env.PORT}`);
  console.log(`🔧 Mode: ${env.NODE_ENV}`);
  console.log(`=========================================`);

  if (env.ZOHO_SYNC_ENABLED) {
    startCrmSyncWorker();
    startStaleJobRecoveryWorker();
  } else {
    console.log('ℹ️ Zoho CRM background sync worker is disabled (ZOHO_SYNC_ENABLED=false).');
  }
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  stopCrmSyncWorker();
  stopStaleJobRecoveryWorker();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message);
  stopCrmSyncWorker();
  stopStaleJobRecoveryWorker();
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err?.name, err?.message);
  stopCrmSyncWorker();
  stopStaleJobRecoveryWorker();
  server.close(() => {
    process.exit(1);
  });
});

