import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/models/User';

export const COOKIE_NAME = 'shopspinco_session';
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export interface SessionPayload {
  id: string;
  email: string;
  role: UserRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: SESSION_MAX_AGE_SECONDS });
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getSession(req: NextRequest): SessionPayload {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    throw new AuthError('Missing or invalid session', 401);
  }
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    throw new AuthError('Invalid or expired session', 401);
  }
}

export function requireAuth(req: NextRequest): SessionPayload {
  return getSession(req);
}

export function requireSuperAdmin(req: NextRequest): SessionPayload {
  const session = getSession(req);
  if (session.role !== 'superAdmin') {
    throw new AuthError('Forbidden', 403);
  }
  return session;
}
