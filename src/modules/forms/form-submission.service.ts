import { v4 as uuidv4 } from 'uuid';
import { FormType } from '@prisma/client';
import {
  ContactFormInput,
  DealerFormInput,
  ContractorFormInput,
  normalizeMobileNumber,
} from './form.validation';
import { formSubmissionRepository } from './form-submission.repository';
import { triggerSyncWorkerImmediately } from '../../workers/crm-sync.worker';
import { logger } from '../../observability/logger';

export class FormSubmissionService {
  async processContactSubmission(input: ContactFormInput) {
    const submissionId = uuidv4();
    const crmExternalKey = `JJV-WEB-${submissionId}`;
    const mobileNormalized = normalizeMobileNumber(input.mobileNumber);

    logger.info('Processing Contact Us form submission', {
      crmExternalKey,
      mobileNormalized,
    });

    const submission = await formSubmissionRepository.createSubmissionWithSyncJob({
      id: submissionId,
      crmExternalKey,
      formType: FormType.CONTACT,
      fullName: input.fullName,
      firmName: input.firmName || null,
      mobileRaw: input.mobileNumber,
      mobileNormalized,
      email: input.email || null,
      city: input.city || null,
      location: input.location || null,
      state: input.state || null,
      pinCode: input.pinCode || null,
      queryType: input.queryType || input.interestedIn || null,
      interestedIn: input.interestedIn || input.queryType || null,
      message: input.message || null,
      consentGiven: input.consent,
      consentTextVersion: input.consentTextVersion || 'v1.0',
      sourceUrl: input.sourceUrl || null,
      referrerUrl: input.referrerUrl || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      utmContent: input.utmContent || null,
      utmTerm: input.utmTerm || null,
      gclid: input.gclid || null,
      fbclid: input.fbclid || null,
    });

    // Trigger immediate background sync worker execution
    triggerSyncWorkerImmediately();

    return {
      entryId: submission.crmExternalKey,
      id: submission.id,
      syncStatus: submission.zohoSyncStatus,
    };
  }

  async processDealerSubmission(input: DealerFormInput) {
    const submissionId = uuidv4();
    const crmExternalKey = `JJV-WEB-${submissionId}`;
    const mobileNormalized = normalizeMobileNumber(input.mobileNumber);

    logger.info('Processing Become a Dealer form submission', {
      crmExternalKey,
      mobileNormalized,
    });

    const submission = await formSubmissionRepository.createSubmissionWithSyncJob({
      id: submissionId,
      crmExternalKey,
      formType: FormType.DEALER,
      fullName: input.fullName,
      firmName: input.firmName || null,
      mobileRaw: input.mobileNumber,
      mobileNormalized,
      email: input.email || null,
      city: input.city || null,
      location: input.location || null,
      state: input.state || null,
      pinCode: input.pinCode || null,
      queryType: input.queryType || input.interestedIn || null,
      interestedIn: input.interestedIn || input.queryType || null,
      lineOfBusiness: input.lineOfBusiness || null,
      message: input.message || null,
      consentGiven: input.consent,
      consentTextVersion: input.consentTextVersion || 'v1.0',
      sourceUrl: input.sourceUrl || null,
      referrerUrl: input.referrerUrl || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      utmContent: input.utmContent || null,
      utmTerm: input.utmTerm || null,
      gclid: input.gclid || null,
      fbclid: input.fbclid || null,
    });

    triggerSyncWorkerImmediately();

    return {
      entryId: submission.crmExternalKey,
      id: submission.id,
      syncStatus: submission.zohoSyncStatus,
    };
  }

  async processContractorSubmission(input: ContractorFormInput) {
    const submissionId = uuidv4();
    const crmExternalKey = `JJV-WEB-${submissionId}`;
    const mobileNormalized = normalizeMobileNumber(input.mobileNumber);

    logger.info('Processing Contractor Connect form submission', {
      crmExternalKey,
      mobileNormalized,
    });

    const submission = await formSubmissionRepository.createSubmissionWithSyncJob({
      id: submissionId,
      crmExternalKey,
      formType: FormType.CONTRACTOR,
      fullName: input.fullName,
      mobileRaw: input.mobileNumber,
      mobileNormalized,
      email: input.email || null,
      city: input.city || null,
      location: input.location || null,
      state: input.state || null,
      pinCode: input.pinCode || null,
      queryType: input.queryType || input.interestedIn || null,
      interestedIn: input.interestedIn || input.queryType || null,
      message: input.message || null,
      consentGiven: input.consent,
      consentTextVersion: input.consentTextVersion || 'v1.0',
      sourceUrl: input.sourceUrl || null,
      referrerUrl: input.referrerUrl || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      utmContent: input.utmContent || null,
      utmTerm: input.utmTerm || null,
      gclid: input.gclid || null,
      fbclid: input.fbclid || null,
    });

    triggerSyncWorkerImmediately();

    return {
      entryId: submission.crmExternalKey,
      id: submission.id,
      syncStatus: submission.zohoSyncStatus,
    };
  }
}

export const formSubmissionService = new FormSubmissionService();
