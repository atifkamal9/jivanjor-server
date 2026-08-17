import { FormSubmission } from '@prisma/client';
import { ZOHO_ENQUIRY_FIELDS } from './zoho-field-map';
import { splitFullName } from './zoho-contact.mapper';

export function mapSubmissionToZohoEnquiryPayload(
  submission: FormSubmission,
  zohoContactId: string
): Record<string, any> {
  const { firstName, lastName } = splitFullName(submission.fullName);

  const payload: Record<string, any> = {
    [ZOHO_ENQUIRY_FIELDS.NAME]: submission.crmExternalKey,
    [ZOHO_ENQUIRY_FIELDS.FIRST_NAME]: firstName,
    [ZOHO_ENQUIRY_FIELDS.LAST_NAME]: lastName,
    [ZOHO_ENQUIRY_FIELDS.WEBSITE_ENTRY_ID]: submission.crmExternalKey,
    [ZOHO_ENQUIRY_FIELDS.CONTACT]: { id: zohoContactId },
    [ZOHO_ENQUIRY_FIELDS.FORM_TYPE]: submission.formType,
    [ZOHO_ENQUIRY_FIELDS.FULL_NAME_SNAPSHOT]: submission.fullName,
    [ZOHO_ENQUIRY_FIELDS.MOBILE_SNAPSHOT]: submission.mobileRaw,
    [ZOHO_ENQUIRY_FIELDS.CONSENT_GIVEN]: submission.consentGiven,
    [ZOHO_ENQUIRY_FIELDS.WEBSITE_SUBMITTED_AT]: submission.submittedAt.toISOString(),
  };

  if (submission.firmName) {
    payload[ZOHO_ENQUIRY_FIELDS.FIRM_NAME] = submission.firmName;
  }
  if (submission.city) {
    payload[ZOHO_ENQUIRY_FIELDS.CITY] = submission.city;
  }
  if (submission.pinCode) {
    payload[ZOHO_ENQUIRY_FIELDS.PIN_CODE] = submission.pinCode;
  }
  if (submission.queryType) {
    payload[ZOHO_ENQUIRY_FIELDS.QUERY_TYPE] = submission.queryType;
  }
  if (submission.interestedIn) {
    payload[ZOHO_ENQUIRY_FIELDS.INTERESTED_IN] = submission.interestedIn;
  }
  if (submission.lineOfBusiness) {
    payload[ZOHO_ENQUIRY_FIELDS.LINE_OF_BUSINESS] = submission.lineOfBusiness;
  }
  if (submission.message) {
    payload[ZOHO_ENQUIRY_FIELDS.MESSAGE] = submission.message;
  }
  if (submission.consentTextVersion) {
    payload[ZOHO_ENQUIRY_FIELDS.CONSENT_TEXT_VERSION] = submission.consentTextVersion;
  }
  if (submission.sourceUrl) {
    payload[ZOHO_ENQUIRY_FIELDS.SOURCE_URL] = submission.sourceUrl;
  }
  if (submission.referrerUrl) {
    payload[ZOHO_ENQUIRY_FIELDS.REFERRER_URL] = submission.referrerUrl;
  }
  if (submission.utmSource) {
    payload[ZOHO_ENQUIRY_FIELDS.UTM_SOURCE] = submission.utmSource;
  }
  if (submission.utmMedium) {
    payload[ZOHO_ENQUIRY_FIELDS.UTM_MEDIUM] = submission.utmMedium;
  }
  if (submission.utmCampaign) {
    payload[ZOHO_ENQUIRY_FIELDS.UTM_CAMPAIGN] = submission.utmCampaign;
  }
  if (submission.utmContent) {
    payload[ZOHO_ENQUIRY_FIELDS.UTM_CONTENT] = submission.utmContent;
  }
  if (submission.utmTerm) {
    payload[ZOHO_ENQUIRY_FIELDS.UTM_TERM] = submission.utmTerm;
  }
  if (submission.gclid) {
    payload[ZOHO_ENQUIRY_FIELDS.GCLID] = submission.gclid;
  }
  if (submission.fbclid) {
    payload[ZOHO_ENQUIRY_FIELDS.FBCLID] = submission.fbclid;
  }

  return payload;
}
