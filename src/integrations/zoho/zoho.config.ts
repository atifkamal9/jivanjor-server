import { env } from '../../config/env';

export interface ZohoConfig {
  accountsUrl: string;
  apiVersion: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  apiDomain: string;
  contactsModule: string;
  enquiryModule: string;
  syncEnabled: boolean;
  syncTimeoutMs: number;
  maxAutoAttempts: number;
}

export const getZohoConfig = (): ZohoConfig => ({
  accountsUrl: env.ZOHO_ACCOUNTS_URL,
  apiVersion: env.ZOHO_API_VERSION,
  clientId: env.ZOHO_CLIENT_ID,
  clientSecret: env.ZOHO_CLIENT_SECRET,
  refreshToken: env.ZOHO_REFRESH_TOKEN,
  apiDomain: env.ZOHO_API_DOMAIN,
  contactsModule: env.ZOHO_CONTACTS_MODULE,
  enquiryModule: env.ZOHO_ENQUIRY_MODULE,
  syncEnabled: env.ZOHO_SYNC_ENABLED,
  syncTimeoutMs: env.ZOHO_SYNC_TIMEOUT_MS,
  maxAutoAttempts: env.ZOHO_MAX_AUTO_ATTEMPTS,
});
