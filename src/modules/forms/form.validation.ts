import { z } from 'zod';


/**
 * Normalizes mobile number to canonical digits string (E.164 format without + symbol).
 * Example: "+91 98765 43210" or "09876543210" -> "919876543210"
 */
export function normalizeMobileNumber(rawMobile: string): string {
  if (!rawMobile) return '';
  const digitsOnly = rawMobile.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `91${digitsOnly.substring(1)}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly;
  }
  return digitsOnly;
}

export function isValidIndianMobile(val: string): boolean {
  if (!val) return false;
  let clean = val.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('91')) clean = clean.slice(2);
  if (clean.length === 11 && clean.startsWith('0')) clean = clean.slice(1);

  if (clean.length !== 10) return false;
  if (!/^[6-9]/.test(clean)) return false; // Must start with 6, 7, 8, or 9
  if (/^(\d)\1{9}$/.test(clean)) return false; // Reject repeated digits (0000000000, 1111111111, 9999999999, etc.)
  if (/^[6-9]0{9}$/.test(clean)) return false; // Reject dummy numbers like 9000000000, 8000000000
  if (['1234567890', '9876543210', '0123456789'].includes(clean)) return false;

  return true;
}

const mobileValidationSchema = z.string().trim().refine(isValidIndianMobile, {
  message: 'Invalid mobile number. Must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
});

export const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full Name must be at least 2 characters').max(120),
  firmName: z.string().trim().max(150).optional().or(z.literal('')),
  mobileNumber: mobileValidationSchema,
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  location: z.string().trim().max(150).optional().or(z.literal('')),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  pinCode: z.string().trim().length(6, 'Pin code must be exactly 6 digits').optional().or(z.literal('')),
  queryType: z.string().trim().max(120).optional().or(z.literal('')),
  interestedIn: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Consent must be accepted',
  }),
  consentTextVersion: z.string().trim().max(50).optional(),
  sourceUrl: z.string().trim().optional(),
  referrerUrl: z.string().trim().optional(),
  utmSource: z.string().trim().max(150).optional(),
  utmMedium: z.string().trim().max(150).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmContent: z.string().trim().max(200).optional(),
  utmTerm: z.string().trim().max(200).optional(),
  gclid: z.string().trim().max(255).optional(),
  fbclid: z.string().trim().max(255).optional(),
});

export const dealerFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full Name must be at least 2 characters').max(120),
  firmName: z.string().trim().max(150).optional().or(z.literal('')),
  mobileNumber: mobileValidationSchema,
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  location: z.string().trim().max(150).optional().or(z.literal('')),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  pinCode: z.string().trim().length(6, 'Pin code must be exactly 6 digits').optional().or(z.literal('')),
  queryType: z.string().trim().max(120).optional().or(z.literal('')),
  interestedIn: z.string().trim().max(120).optional().or(z.literal('')),
  lineOfBusiness: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Consent must be accepted',
  }),
  consentTextVersion: z.string().trim().max(50).optional(),
  sourceUrl: z.string().trim().optional(),
  referrerUrl: z.string().trim().optional(),
  utmSource: z.string().trim().max(150).optional(),
  utmMedium: z.string().trim().max(150).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmContent: z.string().trim().max(200).optional(),
  utmTerm: z.string().trim().max(200).optional(),
  gclid: z.string().trim().max(255).optional(),
  fbclid: z.string().trim().max(255).optional(),
});

export const contractorFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full Name must be at least 2 characters').max(120),
  mobileNumber: mobileValidationSchema,
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  location: z.string().trim().max(150).optional().or(z.literal('')),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  pinCode: z.string().trim().length(6, 'Pin code must be exactly 6 digits').optional().or(z.literal('')),
  queryType: z.string().trim().max(120).optional().or(z.literal('')),
  interestedIn: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Consent must be accepted',
  }),
  consentTextVersion: z.string().trim().max(50).optional(),
  sourceUrl: z.string().trim().optional(),
  referrerUrl: z.string().trim().optional(),
  utmSource: z.string().trim().max(150).optional(),
  utmMedium: z.string().trim().max(150).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmContent: z.string().trim().max(200).optional(),
  utmTerm: z.string().trim().max(200).optional(),
  gclid: z.string().trim().max(255).optional(),
  fbclid: z.string().trim().max(255).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type DealerFormInput = z.infer<typeof dealerFormSchema>;
export type ContractorFormInput = z.infer<typeof contractorFormSchema>;
