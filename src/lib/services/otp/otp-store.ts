import { createHash, randomInt } from 'crypto';
import { OTP_TTL_MS, OTP_LENGTH } from '@/lib/constants/otp.constants';

export type OtpPurpose = 'login' | 'signup';

interface StoredOtp {
  hashedOtp: string;
  expiresAt: number;
  purpose: OtpPurpose;
}

const store = new Map<string, StoredOtp>();

function key(email: string, purpose: OtpPurpose): string {
  return `${email.toLowerCase().trim()}:${purpose}`;
}

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function generateOtpCode(): string {
  const digits: string[] = [];
  for (let i = 0; i < OTP_LENGTH; i++) {
    digits.push(String(randomInt(0, 10)));
  }
  return digits.join('');
}

export function saveOtp(email: string, purpose: OtpPurpose, code: string): void {
  const k = key(email, purpose);
  const expiresAt = Date.now() + OTP_TTL_MS;
  store.set(k, {
    hashedOtp: hashCode(code),
    expiresAt,
    purpose,
  });
}

export function verifyAndConsumeOtp(email: string, purpose: OtpPurpose, code: string): boolean {
  const k = key(email, purpose);
  const entry = store.get(k);
  if (!entry) {
    return false;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(k);
    return false;
  }
  const match = entry.hashedOtp === hashCode(code);
  if (match) {
    store.delete(k);
  }
  return match;
}

export function hasValidOtp(email: string, purpose: OtpPurpose): boolean {
  const k = key(email, purpose);
  const entry = store.get(k);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(k);
    return false;
  }
  return true;
}
