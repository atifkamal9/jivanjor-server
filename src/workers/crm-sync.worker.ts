import os from 'os';
import { CrmSyncStatus } from '@prisma/client';

import { prisma } from '../config/db';
import { getZohoConfig } from '../integrations/zoho/zoho.config';
import { mapSubmissionToZohoContactPayload } from '../integrations/zoho/zoho-contact.mapper';
import { mapSubmissionToZohoEnquiryPayload } from '../integrations/zoho/zoho-enquiry.mapper';
import { zohoHttpClient } from '../integrations/zoho/zoho-http.client';
import { classifyZohoError, ClassifiedError } from '../integrations/zoho/zoho-error.classifier';
import { logger } from '../observability/logger';

const WORKER_ID = `${os.hostname()}-${process.pid}`;

/**
 * Calculates next retry date using exponential backoff schedule with 15% jitter.
 * Schedule:
 *  Attempt 1: Immediate
 *  Attempt 2: 1 minute
 *  Attempt 3: 5 minutes
 *  Attempt 4: 20 minutes
 *  Attempt 5: 1 hour (60 minutes)
 *  Attempt 6: 6 hours (360 minutes)
 */
export function calculateNextRetryDate(attemptNumber: number): Date {
  const baseDelaysInMinutes = [0, 1, 5, 20, 60, 360];
  const delayMinutes = baseDelaysInMinutes[attemptNumber - 1] ?? 360;

  // Add random +/- 15% jitter
  const jitterFactor = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
  const delayMs = Math.round(delayMinutes * 60 * 1000 * jitterFactor);

  return new Date(Date.now() + delayMs);
}

export async function processSingleSyncJob(
  jobId: string,
  submissionId: string,
  source: 'AUTO' | 'MANUAL' = 'AUTO',
  actor = 'SYSTEM'
): Promise<void> {
  const config = getZohoConfig();

  // 1. Fetch submission details
  const submission = await prisma.formSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    logger.error('Submission not found for sync job', { jobId, submissionId });
    await prisma.crmSyncJob.delete({ where: { id: jobId } }).catch(() => {});
    return;
  }

  const currentAttemptNumber = submission.zohoSyncAttempts + 1;
  const startedAt = new Date();

  logger.info(`Starting sync processing for submission ${submission.crmExternalKey}`, {
    attemptNumber: currentAttemptNumber,
    source,
    actor,
  });

  try {
    // 2. Upsert Contact to Zoho CRM
    const contactPayload = mapSubmissionToZohoContactPayload(submission);
    const contactResult = await zohoHttpClient.upsertRecord(
      config.contactsModule,
      contactPayload,
      ['Website_Mobile_Key']
    );

    // 3. Upsert Website Enquiry / Note to Zoho CRM
    const enquiryPayload = mapSubmissionToZohoEnquiryPayload(submission, contactResult.zohoId);
    const enquiryResult = await zohoHttpClient.upsertRecord(
      config.enquiryModule,
      enquiryPayload,
      ['Website_Entry_ID']
    );

    const completedAt = new Date();

    // 4. Update FormSubmission to SYNCED
    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        zohoSyncStatus: CrmSyncStatus.SYNCED,
        zohoContactId: contactResult.zohoId,
        zohoEnquiryId: enquiryResult.zohoId,
        zohoContactAction: contactResult.action,
        zohoEnquiryAction: enquiryResult.action,
        zohoSyncAttempts: currentAttemptNumber,
        zohoLastHttpStatus: 200,
        zohoLastErrorCode: null,
        zohoLastErrorMessage: null,
        zohoLastResponse: {
          contact: contactResult.rawResponse,
          enquiry: enquiryResult.rawResponse,
        },
        zohoLastAttemptAt: completedAt,
        zohoSyncedAt: completedAt,
        nextRetryAt: null,
      },
    });

    // 5. Remove job from active outbox queue
    await prisma.crmSyncJob.delete({ where: { id: jobId } }).catch(() => {});

    // 6. Record immutable success attempt history log
    await prisma.crmSyncAttempt.create({
      data: {
        submissionId,
        attemptNumber: currentAttemptNumber,
        source,
        actor,
        status: CrmSyncStatus.SYNCED,
        httpStatus: 200,
        responsePayload: {
          contactId: contactResult.zohoId,
          enquiryId: enquiryResult.zohoId,
          contactAction: contactResult.action,
          enquiryAction: enquiryResult.action,
        },
        startedAt,
        completedAt,
      },
    });

    logger.info(`Successfully synced submission ${submission.crmExternalKey} to Zoho CRM`, {
      contactId: contactResult.zohoId,
      enquiryId: enquiryResult.zohoId,
    });
  } catch (error: any) {
    const completedAt = new Date();
    const classification: ClassifiedError = classifyZohoError(error, error.httpStatus);

    let finalStatus = classification.status;
    let nextRetryAt: Date | null = null;

    // Check max auto attempts limit
    if (finalStatus === CrmSyncStatus.RETRY_SCHEDULED) {
      if (currentAttemptNumber >= config.maxAutoAttempts) {
        logger.warn(`Max auto attempts (${config.maxAutoAttempts}) reached for ${submission.crmExternalKey}. Marking FAILED.`);
        finalStatus = CrmSyncStatus.FAILED;
      } else {
        nextRetryAt = calculateNextRetryDate(currentAttemptNumber + 1);
      }
    }

    // Update submission record
    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        zohoSyncStatus: finalStatus,
        zohoSyncAttempts: currentAttemptNumber,
        zohoLastHttpStatus: error.httpStatus || null,
        zohoLastErrorCode: classification.errorCode,
        zohoLastErrorMessage: classification.errorMessage,
        zohoLastResponse: error.rawDetails ? error.rawDetails : { message: error.message },
        zohoLastAttemptAt: completedAt,
        nextRetryAt,
      },
    });

    // Update or remove sync job
    if (finalStatus === CrmSyncStatus.RETRY_SCHEDULED && nextRetryAt) {
      await prisma.crmSyncJob.update({
        where: { id: jobId },
        data: {
          status: CrmSyncStatus.RETRY_SCHEDULED,
          availableAt: nextRetryAt,
          lockedAt: null,
          workerId: null,
        },
      });
    } else {
      // For FAILED or MANUAL_REVIEW, remove active sync job (can be re-created via manual retry endpoint)
      await prisma.crmSyncJob.delete({ where: { id: jobId } }).catch(() => {});
    }

    // Record immutable failure attempt log
    await prisma.crmSyncAttempt.create({
      data: {
        submissionId,
        attemptNumber: currentAttemptNumber,
        source,
        actor,
        status: finalStatus,
        httpStatus: error.httpStatus || null,
        errorCode: classification.errorCode,
        errorMessage: classification.errorMessage,
        responsePayload: error.rawDetails ? error.rawDetails : { message: error.message },
        startedAt,
        completedAt,
      },
    });

    logger.error(`Sync failed for submission ${submission.crmExternalKey}`, {
      status: finalStatus,
      errorCode: classification.errorCode,
      errorMessage: classification.errorMessage,
      nextRetryAt: nextRetryAt ? nextRetryAt.toISOString() : null,
    });
  }
}

/**
 * Main worker loop claiming jobs using FOR UPDATE SKIP LOCKED pattern.
 */
export async function runCrmSyncWorkerStep(): Promise<boolean> {
  const config = getZohoConfig();

  if (!config.syncEnabled) {
    return false;
  }

  try {
    // 1. Claim job using FOR UPDATE SKIP LOCKED
    const claimedJobs: Array<{ id: string; submission_id: string }> = await prisma.$queryRaw`
      SELECT id, submission_id
      FROM crm_sync_jobs
      WHERE status IN ('PENDING', 'RETRY_SCHEDULED')
        AND available_at <= NOW()
      ORDER BY available_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1;
    `;

    if (!claimedJobs || claimedJobs.length === 0) {
      return false;
    }

    const job = claimedJobs[0];

    // 2. Mark job as PROCESSING inside short transaction
    await prisma.crmSyncJob.update({
      where: { id: job.id },
      data: {
        status: CrmSyncStatus.PROCESSING,
        lockedAt: new Date(),
        workerId: WORKER_ID,
      },
    });

    // 3. Process job outside DB lock
    await processSingleSyncJob(job.id, job.submission_id, 'AUTO', WORKER_ID);
    return true;
  } catch (error) {
    logger.error('Error during worker job claim step', { error });
    return false;
  }
}

let workerIntervalId: NodeJS.Timeout | null = null;

export function triggerSyncWorkerImmediately(): void {
  setImmediate(() => {
    runCrmSyncWorkerStep().catch((err) => {
      logger.error('Error executing immediate sync worker step', { err });
    });
  });
}

export function startCrmSyncWorker(pollIntervalMs = 5000): void {
  if (workerIntervalId) return;

  logger.info(`Starting Zoho CRM Background Worker (Worker ID: ${WORKER_ID}, Poll interval: ${pollIntervalMs}ms)`);

  workerIntervalId = setInterval(async () => {
    try {
      let processed = false;
      do {
        processed = await runCrmSyncWorkerStep();
      } while (processed);
    } catch (err) {
      logger.error('Unhandled error in worker polling loop', { err });
    }
  }, pollIntervalMs);
}

export function stopCrmSyncWorker(): void {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    logger.info('Zoho CRM Background Worker stopped');
  }
}
