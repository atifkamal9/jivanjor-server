import { FormSubmission } from '@prisma/client';
import { ZOHO_CONTACT_FIELDS } from './zoho-field-map';

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: '', lastName: 'Unknown' };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] };
  }

  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

export function mapSubmissionToZohoContactPayload(submission: FormSubmission): Record<string, any> {
  const { firstName, lastName } = splitFullName(submission.fullName);

  const payload: Record<string, any> = {
    [ZOHO_CONTACT_FIELDS.FIRST_NAME]: firstName,
    [ZOHO_CONTACT_FIELDS.LAST_NAME]: lastName,
    [ZOHO_CONTACT_FIELDS.MOBILE]: submission.mobileRaw,
    [ZOHO_CONTACT_FIELDS.WEBSITE_MOBILE_KEY]: submission.mobileNormalized,
    [ZOHO_CONTACT_FIELDS.LAST_WEBSITE_ENTRY_ID]: submission.crmExternalKey,
    [ZOHO_CONTACT_FIELDS.LAST_WEBSITE_FORM_TYPE]: submission.formType,
    [ZOHO_CONTACT_FIELDS.WEBSITE_CONSENT]: submission.consentGiven,
    [ZOHO_CONTACT_FIELDS.WEBSITE_SOURCE]: 'Jivanjor Website',
  };

  if (submission.email) {
    payload[ZOHO_CONTACT_FIELDS.EMAIL] = submission.email;
  }
  if (submission.city) {
    payload[ZOHO_CONTACT_FIELDS.MAILING_CITY] = submission.city;
  }
  if (submission.pinCode) {
    payload[ZOHO_CONTACT_FIELDS.MAILING_ZIP] = submission.pinCode;
  }
  if (submission.firmName) {
    payload[ZOHO_CONTACT_FIELDS.FIRM_NAME] = submission.firmName;
  }
  if (submission.queryType) {
    payload[ZOHO_CONTACT_FIELDS.LAST_QUERY_TYPE] = submission.queryType;
  }

  return payload;
}
