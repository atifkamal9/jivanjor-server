import { prisma } from '../../config/db';
import { FormSubmission, FormType, CrmSyncStatus } from '@prisma/client';

export interface CreateSubmissionParams {
  id: string;
  crmExternalKey: string;
  formType: FormType;
  fullName: string;
  firmName?: string | null;
  mobileRaw: string;
  mobileNormalized: string;
  email?: string | null;
  city?: string | null;
  location?: string | null;
  state?: string | null;
  pinCode?: string | null;
  queryType?: string | null;
  interestedIn?: string | null;
  lineOfBusiness?: string | null;
  message?: string | null;
  consentGiven: boolean;
  consentTextVersion?: string | null;
  sourceUrl?: string | null;
  referrerUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
}

export class FormSubmissionRepository {
  /**
   * Saves submission and sync job in a single PostgreSQL transaction.
   * Guarantees atomic outbox pattern persistence.
   */
  async createSubmissionWithSyncJob(params: CreateSubmissionParams): Promise<FormSubmission> {
    return prisma.$transaction(async (tx) => {
      // 1. Insert form_submissions row
      const submission = await tx.formSubmission.create({
        data: {
          id: params.id,
          crmExternalKey: params.crmExternalKey,
          formType: params.formType,
          fullName: params.fullName,
          firmName: params.firmName || null,
          mobileRaw: params.mobileRaw,
          mobileNormalized: params.mobileNormalized,
          email: params.email || null,
          city: params.city || null,
          location: params.location || null,
          state: params.state || null,
          pinCode: params.pinCode || null,
          queryType: params.queryType || null,
          interestedIn: params.interestedIn || null,
          lineOfBusiness: params.lineOfBusiness || null,
          message: params.message || null,
          consentGiven: params.consentGiven,
          consentTextVersion: params.consentTextVersion || null,
          sourceUrl: params.sourceUrl || null,
          referrerUrl: params.referrerUrl || null,
          utmSource: params.utmSource || null,
          utmMedium: params.utmMedium || null,
          utmCampaign: params.utmCampaign || null,
          utmContent: params.utmContent || null,
          utmTerm: params.utmTerm || null,
          gclid: params.gclid || null,
          fbclid: params.fbclid || null,
          zohoSyncStatus: CrmSyncStatus.PENDING,
        },
      });

      // 2. Insert crm_sync_jobs outbox row
      await tx.crmSyncJob.create({
        data: {
          submissionId: submission.id,
          status: CrmSyncStatus.PENDING,
          availableAt: new Date(),
        },
      });

      return submission;
    });
  }
}

export const formSubmissionRepository = new FormSubmissionRepository();
