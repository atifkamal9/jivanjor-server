/**
 * Constants for Zoho CRM field API names.
 * Explicitly includes accepted fields: Pin_Code, Type_Of_Query, Phone, District_City, Contact_Type, Description, Mobile.
 */
export const ZOHO_CONTACT_FIELDS = {
  FIRST_NAME: 'First_Name',
  LAST_NAME: 'Last_Name',
  MOBILE: 'Mobile',
  PHONE: 'Phone',
  PIN_CODE: 'Pin_Code',
  TYPE_OF_QUERY: 'Type_Of_Query',
  DISTRICT_CITY: 'District_City',
  DESCRIPTION: 'Description',
  EMAIL: 'Email',
  FIRM_NAME: 'Firm_Name',
  MAILING_CITY: 'Mailing_City',
  CITY: 'City',
  DISTRICT: 'District',
  MAILING_ZIP: 'Mailing_Zip',
  ZIP_CODE: 'Zip_Code',
  PINCODE: 'Pincode',
  QUERY_TYPE: 'Query_Type',
  TYPE_OF_QUERY_ALT: 'Type_of_Query',
  REMARKS: 'Remarks',
  MESSAGE: 'Message',
  WEBSITE_MOBILE_KEY: 'Website_Mobile_Key',
  LEAD_SOURCE: 'Lead_Source',
  SOURCE: 'Source',
  WEBSITE_SOURCE: 'Website_Source',
} as const;

export const ZOHO_ENQUIRY_FIELDS = { ...ZOHO_CONTACT_FIELDS } as const;
