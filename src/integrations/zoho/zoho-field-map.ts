/**
 * Constants for Zoho CRM field API names.
 * These correspond to Contacts module and Website Enquiries custom module fields.
 */
export const ZOHO_CONTACT_FIELDS = {
  FIRST_NAME: 'First_Name',
  LAST_NAME: 'Last_Name',
  MOBILE: 'Mobile',
  WEBSITE_MOBILE_KEY: 'Website_Mobile_Key', // Primary contact dedupe key
  EMAIL: 'Email',
  MAILING_CITY: 'Mailing_City',
  MAILING_ZIP: 'Mailing_Zip',
  FIRM_NAME: 'Firm_Name',
  LAST_WEBSITE_ENTRY_ID: 'Last_Website_Entry_ID',
  LAST_WEBSITE_FORM_TYPE: 'Last_Website_Form_Type',
  LAST_QUERY_TYPE: 'Last_Query_Type',
  WEBSITE_CONSENT: 'Website_Consent',
  WEBSITE_SOURCE: 'Website_Source', // Default: "Jivanjor Website"
} as const;

export const ZOHO_ENQUIRY_FIELDS = {
  NAME: 'Name', // Entry ID e.g. "JJV-WEB-<UUID>"
  WEBSITE_ENTRY_ID: 'Website_Entry_ID', // Primary dedupe / idempotency key
  CONTACT: 'Contact', // Lookup object: { id: zoho_contact_id }
  FORM_TYPE: 'Form_Type', // CONTACT / DEALER / CONTRACTOR
  FULL_NAME_SNAPSHOT: 'Full_Name_Snapshot',
  FIRST_NAME: 'First_Name',
  LAST_NAME: 'Last_Name',
  FIRM_NAME: 'Firm_Name',
  MOBILE_SNAPSHOT: 'Mobile_Snapshot',
  CITY: 'City',
  PIN_CODE: 'Pin_Code',
  QUERY_TYPE: 'Query_Type',
  INTERESTED_IN: 'Interested_In',
  LINE_OF_BUSINESS: 'Line_of_Business',
  MESSAGE: 'Message',
  CONSENT_GIVEN: 'Consent_Given',
  CONSENT_TEXT_VERSION: 'Consent_Text_Version',
  WEBSITE_SUBMITTED_AT: 'Website_Submitted_At',
  SOURCE_URL: 'Source_URL',
  REFERRER_URL: 'Referrer_URL',
  UTM_SOURCE: 'UTM_Source',
  UTM_MEDIUM: 'UTM_Medium',
  UTM_CAMPAIGN: 'UTM_Campaign',
  UTM_CONTENT: 'UTM_Content',
  UTM_TERM: 'UTM_Term',
  GCLID: 'GCLID',
  FBCLID: 'FBCLID',
} as const;
