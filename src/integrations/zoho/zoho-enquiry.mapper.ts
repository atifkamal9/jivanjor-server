import { FormSubmission } from '@prisma/client';
import { splitFullName, getQueryTypeDifferentiator, getContactType } from './zoho-contact.mapper';

export function mapSubmissionToZohoEnquiryPayload(
  submission: FormSubmission,
  zohoContactId: string
): Record<string, any> {
  const { firstName, lastName } = splitFullName(submission.fullName);
  const typeOfQuery = getQueryTypeDifferentiator(submission);
  const contactType = getContactType(submission);
  const mobileClean = (submission.mobileNormalized || submission.mobileRaw || '').replace(/[^\d+]/g, '');

  const payload: Record<string, any> = {
    Name: submission.crmExternalKey,
    Website_Entry_ID: submission.crmExternalKey,
    Contact: { id: zohoContactId },

    // Exact accepted Zoho CRM fields
    Pin_Code: submission.pinCode || '',
    Type_Of_Query: typeOfQuery,
    Phone: submission.mobileRaw || mobileClean,
    Mobile: mobileClean,
    District_City: submission.city || '',
    Current_Location: submission.location || '',
    Location: submission.location || '',
    State: submission.state || '',
    Mailing_State: submission.state || '',
    Description: submission.message || `${contactType} form submission on Jivanjor website`,
    Contact_Status: 'Open',

    // Name & Firm
    First_Name: firstName,
    Last_Name: lastName,
    Firm_Name: submission.firmName || '',

    // Form metadata
    Form_Type: submission.formType,
    Full_Name_Snapshot: submission.fullName,
    Mobile_Snapshot: submission.mobileRaw,
    Consent_Given: submission.consentGiven,
    Website_Submitted_At: submission.submittedAt.toISOString(),

    // Source tracking
    Source: `Jivanjor Website - ${contactType}`,
    Lead_Source: 'Jivanjor Website',
    Website_Source: 'Jivanjor Website',

    // Fallback alias fields
    Status: 'Open',
    Contact_status: 'Open',
    City: submission.city || '',
    Mailing_City: submission.city || '',
    District: submission.city || '',
    Pincode: submission.pinCode || '',
    Zip_Code: submission.pinCode || '',
    Mailing_Zip: submission.pinCode || '',
    Query_Type: typeOfQuery,
    Type_of_Query: typeOfQuery,
    Remarks: submission.message || '',
    Message: submission.message || '',
  };

  if (submission.interestedIn) {
    payload.Interested_In = submission.interestedIn;
  }
  if (submission.lineOfBusiness) {
    payload.Line_of_Business = submission.lineOfBusiness;
  }
  if (submission.consentTextVersion) {
    payload.Consent_Text_Version = submission.consentTextVersion;
  }
  if (submission.sourceUrl) {
    payload.Source_URL = submission.sourceUrl;
  }
  if (submission.referrerUrl) {
    payload.Referrer_URL = submission.referrerUrl;
  }
  if (submission.utmSource) {
    payload.UTM_Source = submission.utmSource;
  }
  if (submission.utmMedium) {
    payload.UTM_Medium = submission.utmMedium;
  }
  if (submission.utmCampaign) {
    payload.UTM_Campaign = submission.utmCampaign;
  }
  if (submission.utmContent) {
    payload.UTM_Content = submission.utmContent;
  }
  if (submission.utmTerm) {
    payload.UTM_Term = submission.utmTerm;
  }
  if (submission.gclid) {
    payload.GCLID = submission.gclid;
  }
  if (submission.fbclid) {
    payload.FBCLID = submission.fbclid;
  }

  return payload;
}
