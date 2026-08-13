import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '8000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/jivanjor',
  JWT_SECRET: process.env.JWT_SECRET || 'jivanjor_development_secret_key_987654321_abc_xyz',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Zoho CRM Configuration
  ZOHO_ACCOUNTS_URL: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in',
  ZOHO_API_VERSION: process.env.ZOHO_API_VERSION || 'v8',
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID || '',
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET || '',
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN || '',
  ZOHO_API_DOMAIN: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in',
  ZOHO_CONTACTS_MODULE: process.env.ZOHO_CONTACTS_MODULE || 'Contacts',
  ZOHO_ENQUIRY_MODULE: process.env.ZOHO_ENQUIRY_MODULE || 'Website_Enquiries',
  ZOHO_SYNC_ENABLED: process.env.ZOHO_SYNC_ENABLED === 'true',
  ZOHO_SYNC_TIMEOUT_MS: parseInt(process.env.ZOHO_SYNC_TIMEOUT_MS || '8000', 10),
  ZOHO_MAX_AUTO_ATTEMPTS: parseInt(process.env.ZOHO_MAX_AUTO_ATTEMPTS || '6', 10),
};

// Simple validation
if (!process.env.DATABASE_URL && env.NODE_ENV === 'production') {
  console.warn('WARNING: DATABASE_URL is not set. Using default connection string.');
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. File uploads will not work.');
}
if (env.ZOHO_SYNC_ENABLED && (!env.ZOHO_CLIENT_ID || !env.ZOHO_CLIENT_SECRET || !env.ZOHO_REFRESH_TOKEN)) {
  console.warn('WARNING: ZOHO_SYNC_ENABLED is true but Zoho OAuth credentials (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) are incomplete.');
}

