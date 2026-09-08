import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { SafeUser } from '../src/types/auth';

export const SESSION_COOKIE_NAME = 'beg_session';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_EPHEMERAL_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours when rememberMe is false

export interface SessionPayload {
  userId: string;
  email: string;
  role: SafeUser['role'];
  status: SafeUser['status'];
  iat?: number;
  exp?: number;
}

/**
 * Creates a signed JWT session token for the user
 */
export function createSessionToken(user: SafeUser, rememberMe = true): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  return jwt.sign(payload, env.SESSION_SECRET, {
    expiresIn: rememberMe ? '7d' : '12h',
    issuer: 'buildecogroup.auth',
    audience: 'buildecogroup.app',
  });
}

/**
 * Verifies and decodes a server session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.SESSION_SECRET, {
      issuer: 'buildecogroup.auth',
      audience: 'buildecogroup.app',
    }) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Sets the HttpOnly, secure session cookie on the Express response
 */
export function setSessionCookie(res: Response, token: string, rememberMe = true): void {
  const isProd = env.NODE_ENV === 'production';

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: rememberMe ? SESSION_MAX_AGE_MS : SESSION_EPHEMERAL_MAX_AGE_MS,
    path: '/',
  });
}

/**
 * Clears the session cookie on logout
 */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
