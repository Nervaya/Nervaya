import { SignJWT, jwtVerify } from 'jose';
import { Role } from '../constants/roles';

// Validate JWT_SECRET is set in production
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // Only allow fallback in development
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using fallback key. This should NEVER be used in production!');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-fallback-secret-key-change-in-production');

// Validate JWT_SECRET length (minimum 32 characters recommended)
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function generateToken(userId: string, role: string): Promise<string> {
  const alg = 'HS256';
  return new SignJWT({ userId, role }).setProtectedHeader({ alg }).setExpirationTime(JWT_EXPIRES_IN).sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; role: Role } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as { userId: string; role: Role };
  } catch (_error) {
    return null; // Invalid token
  }
}
