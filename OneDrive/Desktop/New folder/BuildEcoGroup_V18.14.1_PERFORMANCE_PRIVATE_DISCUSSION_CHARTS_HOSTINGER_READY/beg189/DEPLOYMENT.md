# BuildEcoGroup V18.15 — Hostinger Deployment (Registration + Super Admin Fix)

## Package contents

- Application source (`src/`, `server/`, `server.ts`)
- Database migrations (`src/db/migrations/` including `005_auth_registration_reliability.sql`)
- `package.json` + `package-lock.json`
- `.env.example` (placeholders only — never real secrets)
- `REGISTRATION_ROOT_CAUSE_AND_FIX.md`
- `SUPER_ADMIN_PRODUCTION_SETUP.md`

## Excluded from zip

- `node_modules/`
- `.git/`
- `.env` / secrets
- `dist/` (Hostinger builds on server)
- logs, caches, test videos, temporary files

## Prerequisites

1. Node.js 20+ app in Hostinger hPanel
2. PostgreSQL (`DATABASE_URL`)
3. Domain + SSL: `https://www.buildecogroup.com`
4. Firebase project with Email/Password + Google enabled

## Environment checklist (names only)

| Variable | Required |
|---|---|
| `DATABASE_URL` or `PG*` | Yes |
| `SESSION_SECRET` (≥32 chars) | Yes |
| `NODE_ENV=production` | Yes |
| `PORT` | Yes (Hostinger) |
| `APP_ORIGIN` / `CORS_ORIGINS` | Yes |
| `FIREBASE_PROJECT_ID` | Yes |
| `FIREBASE_CLIENT_EMAIL` | Yes |
| `FIREBASE_PRIVATE_KEY` | Yes (PEM; `\n` OK) |
| `VITE_FIREBASE_API_KEY` | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes (`<project>.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Yes |
| `VITE_FIREBASE_APP_ID` | Yes |
| `SUPER_ADMIN_EMAIL` | Bootstrap only |
| `SUPER_ADMIN_TEMP_PASSWORD` | Bootstrap only — remove after |

## Deploy steps

1. Upload ZIP and extract to the Node app root.
2. In hPanel, set all env vars **before** first request. Env vars cannot be set via Hostinger API.
3. Build settings (typical):
   - Node 20
   - Build: `npm run build`
   - Entry: `server/start-hostinger.cjs` (or as currently configured)
4. After deploy/restart:

```bash
npm run db:migrate
npm run bootstrap:superadmin
```

5. Remove `SUPER_ADMIN_TEMP_PASSWORD` from hPanel and restart.
6. Verify:

- `GET /api/health` → DB connected + `firebaseAdminReady: true`
- `GET /api/auth/status` → `firebaseAdmin.configured: true`
- Register → `/dashboard/user`
- Super Admin login → `/dashboard/super-admin`

## Firebase Console still required

Authorized domains:

- `buildecogroup.com`
- `www.buildecogroup.com`
- `localhost` (dev only)

## Rollback

1. Redeploy previous Hostinger ZIP / build.
2. Keep a PostgreSQL backup before migrations.
3. Do not demote the last Super Admin.

## Local verification commands

```bash
npm ci
npm run typecheck
npm run registration:test
npm run rbac:test
npm run auth:test
npm run security:test
npm run build
```
