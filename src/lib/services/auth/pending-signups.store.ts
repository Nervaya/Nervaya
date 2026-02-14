import { Role } from '@/lib/constants/roles';

const PENDING_SIGNUP_TTL_MS = 10 * 60 * 1000;

export interface PendingSignupData {
  email: string;
  password: string;
  name: string;
  role?: Role;
  expiresAt: number;
}

const pendingSignups = new Map<string, PendingSignupData>();

function keyForEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function savePendingSignup(email: string, password: string, name: string, role?: Role): void {
  const key = keyForEmail(email);
  const expiresAt = Date.now() + PENDING_SIGNUP_TTL_MS;

  pendingSignups.set(key, {
    email: email.toLowerCase().trim(),
    password: password,
    name: name.trim(),
    role,
    expiresAt,
  });
}

export function consumePendingSignup(email: string): Omit<PendingSignupData, 'expiresAt'> | null {
  const key = keyForEmail(email);
  const data = pendingSignups.get(key);

  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    pendingSignups.delete(key);
    return null;
  }

  pendingSignups.delete(key);

  return {
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role,
  };
}

export function hasPendingSignup(email: string): boolean {
  const key = keyForEmail(email);
  const data = pendingSignups.get(key);

  if (!data) return false;

  if (Date.now() > data.expiresAt) {
    pendingSignups.delete(key);
    return false;
  }

  return true;
}

export function clearPendingSignup(email: string): void {
  const key = keyForEmail(email);
  pendingSignups.delete(key);
}

export function cleanupExpiredSignups(): void {
  const now = Date.now();
  for (const [key, data] of pendingSignups.entries()) {
    if (now > data.expiresAt) {
      pendingSignups.delete(key);
    }
  }
}
