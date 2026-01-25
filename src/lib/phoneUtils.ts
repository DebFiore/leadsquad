// src/lib/phoneUtils.ts
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  try {
    const parsed = parsePhoneNumber(phone, 'US');
    if (parsed) {
      return parsed.formatNational();
    }
  } catch {
    // Return original if parsing fails
  }
  
  return phone;
}

export function formatPhoneInternational(phone: string | null | undefined): string {
  if (!phone) return '';
  
  try {
    const parsed = parsePhoneNumber(phone, 'US');
    if (parsed) {
      return parsed.formatInternational();
    }
  } catch {
    // Return original if parsing fails
  }
  
  return phone;
}

export function validatePhoneNumber(phone: string, country: CountryCode = 'US'): {
  isValid: boolean;
  formatted: string | null;
  e164: string | null;
  error?: string;
} {
  if (!phone || phone.trim() === '') {
    return { isValid: false, formatted: null, e164: null, error: 'Phone number is required' };
  }

  try {
    // Try to parse with default country
    const parsed = parsePhoneNumber(phone, country);
    
    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        formatted: parsed.formatNational(),
        e164: parsed.format('E.164'),
      };
    }
    
    // Try without country code assumption
    if (isValidPhoneNumber(phone)) {
      const parsedIntl = parsePhoneNumber(phone);
      if (parsedIntl) {
        return {
          isValid: true,
          formatted: parsedIntl.formatNational(),
          e164: parsedIntl.format('E.164'),
        };
      }
    }

    return { 
      isValid: false, 
      formatted: null, 
      e164: null,
      error: 'Invalid phone number format' 
    };
  } catch {
    return { 
      isValid: false, 
      formatted: null, 
      e164: null,
      error: 'Could not parse phone number' 
    };
  }
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}
