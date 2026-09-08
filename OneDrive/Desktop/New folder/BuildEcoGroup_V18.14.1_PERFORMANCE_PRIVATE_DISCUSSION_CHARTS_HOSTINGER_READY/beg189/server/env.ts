import { z } from 'zod';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load .env if present
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters').default('buildecogroup-v17-secure-dev-session-key-32chars!'),
  APP_ORIGIN: z.string().default('http://localhost:3000'),
  APP_URL: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  DATABASE_URL: z.string().url().optional().or(z.literal('')),
  PGHOST: z.string().optional(),
  PGPORT: z.coerce.number().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGDATABASE: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  HUBSPOT_PRIVATE_APP_TOKEN: z.string().optional(),
  HUBSPOT_PORTAL_ID: z.string().optional(),
});

export type ServerEnv = z.infer<typeof EnvSchema>;

function parseEnv(): ServerEnv {
  const result = EnvSchema.safeParse(process.env);
  let data: ServerEnv;
  if (!result.success) {
    console.error('[BuildEcoGroup] Environment configuration validation error:', result.error.format());
    data = {
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      PORT: parseInt(process.env.PORT || '3000', 10),
      SESSION_SECRET: process.env.SESSION_SECRET || 'buildecogroup_v17_development_jwt_secret_fallback_key',
      APP_ORIGIN: process.env.APP_ORIGIN || 'http://localhost:3000',
      DATABASE_URL: process.env.DATABASE_URL || '',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    };
  } else {
    data = result.data;
  }

  // Never use the predictable development secret in production. If Hostinger
  // has not been configured yet, use an ephemeral cryptographically-random
  // runtime secret so the public site can boot safely instead of returning 503.
  // Configure SESSION_SECRET in hPanel to keep sessions valid across restarts.
  const unsafeSecrets = new Set([
    'buildecogroup-v17-secure-dev-session-key-32chars!',
    'buildecogroup_v17_development_jwt_secret_fallback_key',
  ]);
  if (data.NODE_ENV === 'production' && (unsafeSecrets.has(data.SESSION_SECRET) || data.SESSION_SECRET.length < 32)) {
    data = { ...data, SESSION_SECRET: crypto.randomBytes(48).toString('hex') };
    console.warn('[BuildEcoGroup] SESSION_SECRET is not configured; using an ephemeral secure secret. Set SESSION_SECRET in Hostinger to preserve sessions across restarts.');
  }
  return data;
}

export const env = parseEnv();

export function isDatabaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL && env.DATABASE_URL.length > 0) || Boolean(env.PGHOST && env.PGDATABASE);
}


export function assertProductionEnv(): void {
  if (env.NODE_ENV !== 'production') return;
  // Availability-first production validation: configuration gaps are surfaced
  // as warnings/health status instead of crashing the Node process (503).
  // Persistence stays in memory until PostgreSQL is configured.
  if (!isDatabaseConfigured()) {
    console.warn('[BuildEcoGroup] PostgreSQL is not configured. Server will start in degraded in-memory mode; configure DATABASE_URL or PG* in Hostinger for restart-safe persistence.');
  }
}

export function allowedOrigins(): string[] {
  const defaults = [
    'https://www.buildecogroup.com',
    'https://buildecogroup.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  const raw = env.CORS_ORIGINS || env.APP_ORIGIN || env.APP_URL || '';
  const configured = raw.split(',').map(v => v.trim()).filter(Boolean);
  return Array.from(new Set([...defaults, ...configured]));
}
