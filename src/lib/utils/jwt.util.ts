import { SignJWT, jwtVerify } from 'jose';
import { Role } from '../constants/roles';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function generateToken(userId: string, role: string): Promise<string> {
    const alg = 'HS256';
    return new SignJWT({ userId, role })
        .setProtectedHeader({ alg })
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; role: Role } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as { userId: string; role: Role };
    } catch (error) {
        return null; // Invalid token
    }
}
