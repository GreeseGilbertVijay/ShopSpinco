import { jwtVerify } from 'jose';
import type { UserRole } from '@/models/User';

export interface EdgeSessionPayload {
  id: string;
  email: string;
  role: UserRole;
}

let secretKey: Uint8Array | null = null;

function getSecretKey(): Uint8Array {
  if (!secretKey) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    secretKey = new TextEncoder().encode(secret);
  }
  return secretKey;
}

export async function verifySessionEdge(token: string): Promise<EdgeSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as EdgeSessionPayload;
  } catch {
    return null;
  }
}
