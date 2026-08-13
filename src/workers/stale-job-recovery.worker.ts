import { CrmSyncStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { logger } from '../observability/logger';

let sweeperIntervalId: NodeJS.Timeout | null = null;

export async function recoverStaleJobs(staleTimeoutMinutes = 5): Promise<number> {
  const cutoff = new Date(Date.now() - staleTimeoutMinutes * 60 * 1000);

  try {
    const staleJobs = await prisma.crmSyncJob.findMany({
      where: {
        status: CrmSyncStatus.PROCESSING,
        lockedAt: {
          lt: cutoff,
        },
      },
    });

    if (staleJobs.length === 0) {
      return 0;
    }

    logger.warn(`Found ${staleJobs.length} stale PROCESSING jobs locked before ${cutoff.toISOString()}. Resetting to RETRY_SCHEDULED.`);

    const result = await prisma.crmSyncJob.updateMany({
      where: {
        id: {
          in: staleJobs.map((j) => j.id),
        },
      },
      data: {
        status: CrmSyncStatus.RETRY_SCHEDULED,
        lockedAt: null,
        workerId: null,
        availableAt: new Date(),
      },
    });

    return result.count;
  } catch (error) {
    logger.error('Error recovering stale sync jobs', { error });
    return 0;
  }
}

export function startStaleJobRecoveryWorker(checkIntervalMs = 60000): void {
  if (sweeperIntervalId) return;

  logger.info('Starting Stale Job Recovery Worker');
  sweeperIntervalId = setInterval(() => {
    recoverStaleJobs().catch((err) => {
      logger.error('Error during stale job recovery sweep', { err });
    });
  }, checkIntervalMs);
}

export function stopStaleJobRecoveryWorker(): void {
  if (sweeperIntervalId) {
    clearInterval(sweeperIntervalId);
    sweeperIntervalId = null;
    logger.info('Stale Job Recovery Worker stopped');
  }
}
