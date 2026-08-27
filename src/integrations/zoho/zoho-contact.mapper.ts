import { FormSubmission } from '@prisma/client';

export function splitFullName(fullName?: string | null): { firstName: string; lastName: string } {
  const trimmed = (fullName || '').trim();
  if (!trimmed) {
    return { firstName: '', lastName: 'Unknown' };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] || 'Unknown' };
  }

  const lastName = parts.pop() || 'Unknown';
  const firstName = parts.join(' ');
  return { firstName, lastName: lastName || 'Unknown' };
}

export function getQueryTypeDifferentiator(submission: FormSubmission): string {
  if (submission.queryType && submission.queryType.trim()) {
    return submission.queryType.trim();
  }

  if (submission.formType === 'DEALER') {
    const details = [submission.interestedIn, submission.lineOfBusiness].filter(Boolean).join(' - ');
    return details ? `Dealer Enquiry (${details})` : 'Become a Dealer';
  }

  if (submission.formType === 'CONTRACTOR') {
    return 'Contractor Connect';
  }

  return 'General Enquiry';
}

export function getContactType(submission: FormSubmission): string {
  if (submission.formType === 'DEALER') return 'Dealer';
  if (submission.formType === 'CONTRACTOR') return 'Contractor';
  return 'Customer';
}

export function mapSubmissionToZohoContactPayload(submission: FormSubmission): Record<string, any> {
  const { firstName, lastName } = splitFullName(submission.fullName);

  const mobileClean = (submission.mobileNormalized || submission.mobileRaw || '').replace(/[^\d+]/g, '');
  const typeOfQuery = getQueryTypeDifferentiator(submission);
  const contactType = getContactType(submission);

  const payload: Record<string, any> = {
    // Exact accepted Zoho CRM fields
    Pin_Code: submission.pinCode || '',
    Type_Of_Query: typeOfQuery,
    Phone: submission.mobileRaw || mobileClean,
    Mobile: mobileClean,
    District_City: submission.city || '',
    Contact_Type: contactType,
    Description: submission.message || `${contactType} form submission on Jivanjor website`,

    // Core Name & Email fields
    First_Name: firstName,
    Last_Name: lastName,
    Email: submission.email || '',
    Firm_Name: submission.firmName || '',

    // Duplicate key & source metadata
    Website_Mobile_Key: mobileClean,
    Source: `Jivanjor Website - ${contactType}`,
    Lead_Source: 'Jivanjor Website',
    Website_Source: 'Jivanjor Website',

    // Fallback alias fields for full CRM compatibility
    Mailing_City: submission.city || '',
    City: submission.city || '',
    District: submission.city || '',
    Mailing_Zip: submission.pinCode || '',
    Zip_Code: submission.pinCode || '',
    Pincode: submission.pinCode || '',
    Query_Type: typeOfQuery,
    Type_of_Query: typeOfQuery,
    Last_Query_Type: typeOfQuery,
    Remarks: submission.message || '',
    Message: submission.message || '',
    Last_Website_Entry_ID: submission.crmExternalKey,
    Last_Website_Form_Type: submission.formType,
    Website_Consent: submission.consentGiven,
  };

  return payload;
}
