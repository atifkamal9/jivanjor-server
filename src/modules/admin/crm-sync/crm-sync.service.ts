import { crmSyncRepository, ListSubmissionsQuery } from './crm-sync.repository';
import { prisma } from '../../../config/db';
import { CrmSyncStatus } from '@prisma/client';
import { triggerSyncWorkerImmediately } from '../../../workers/crm-sync.worker';
import { AppError, HttpCode } from '../../../utils/errors';
import { logger } from '../../../observability/logger';

export class CrmSyncService {
  async getSubmissions(query: ListSubmissionsQuery) {
    return crmSyncRepository.listSubmissions(query);
  }

  async getSubmissionDetail(id: string) {
    const submission = await crmSyncRepository.getSubmissionById(id);
    if (!submission) {
      throw new AppError('Form submission not found', HttpCode.NOT_FOUND);
    }
    return submission;
  }

  async retrySubmission(
    submissionId: string,
    adminUserId: string,
    reason?: string,
    ipAddress?: string
  ) {
    const submission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new AppError('Form submission not found', HttpCode.NOT_FOUND);
    }

    if (submission.zohoSyncStatus === CrmSyncStatus.PROCESSING) {
      throw new AppError('Cannot retry a submission that is currently being processed', HttpCode.BAD_REQUEST);
    }

    const previousStatus = submission.zohoSyncStatus;

    logger.info(`Admin user ${adminUserId} initiated manual retry for submission ${submission.crmExternalKey}`, {
      reason,
      previousStatus,
    });

    // Requeue submission atomically
    const updatedSubmission = await crmSyncRepository.requeueSubmission(submissionId);

    // Create AdminAuditLog entry
    await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action: 'RETRY_SYNC',
        submissionId,
        reason: reason || 'Manual admin retry requested',
        previousStatus,
        newStatus: CrmSyncStatus.PENDING,
        ipAddress: ipAddress || null,
      },
    });

    // Trigger immediate background sync worker
    triggerSyncWorkerImmediately();

    return {
      entryId: updatedSubmission.crmExternalKey,
      previousStatus,
      newStatus: CrmSyncStatus.PENDING,
      queued: true,
    };
  }

  async batchRetrySubmissions(
    submissionIds: string[],
    adminUserId: string,
    reason?: string,
    ipAddress?: string
  ) {
    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      throw new AppError('submissionIds array must be provided', HttpCode.BAD_REQUEST);
    }

    // Cap batch size at 100
    const targetIds = submissionIds.slice(0, 100);

    const eligibleSubmissions = await prisma.formSubmission.findMany({
      where: {
        id: { in: targetIds },
        zohoSyncStatus: { not: CrmSyncStatus.PROCESSING },
      },
    });

    if (eligibleSubmissions.length === 0) {
      return {
        message: 'No eligible submissions found for retry (records may be currently PROCESSING or invalid)',
        requeuedCount: 0,
      };
    }

    let requeuedCount = 0;
    for (const sub of eligibleSubmissions) {
      await crmSyncRepository.requeueSubmission(sub.id);
      requeuedCount++;
    }

    await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action: 'BATCH_RETRY_SYNC',
        reason: reason || 'Batch manual retry requested',
        details: {
          requestedCount: targetIds.length,
          requeuedCount,
          submissionIds: eligibleSubmissions.map((s) => s.id),
        },
        ipAddress: ipAddress || null,
      },
    });

    triggerSyncWorkerImmediately();

    return {
      message: `Successfully queued ${requeuedCount} submissions for CRM retry`,
      requeuedCount,
    };
  }

  async getHealth() {
    return crmSyncRepository.getHealthMetrics();
  }
}

export const crmSyncService = new CrmSyncService();
