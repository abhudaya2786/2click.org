# BuildEcoGroup V18.14.1 — Hostinger Deployment

## Package contents

- Application source (`src/`, `server/`, `server.ts`)
- Production build (`dist/` — run `npm run build` if missing)
- Database migrations (`src/db/migrations/`)
- `package.json` + `package-lock.json`
- `.env.example` (copy to `.env` — never commit real secrets)

## Excluded from zip (install on server)

- `node_modules/` — run `npm ci --omit=dev` on Hostinger
- `.git/`, `.env`, logs, QA artifacts

## Prerequisites (Hostinger Node.js)

1. Node.js 20+ application in hPanel
2. PostgreSQL database (required for restart-safe persistence)
3. Domain + SSL (`www.buildecogroup.com`)

## Environment variables

Copy `.env.example` → `.env` and set:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `SESSION_SECRET` | **Yes** | Min 32 random characters |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | Hostinger-assigned port |
| `APP_ORIGIN` | Yes | `https://www.buildecogroup.com` |
| `CORS_ORIGINS` | Yes | Production domains |
| `FIREBASE_PROJECT_ID` | Yes | Auth token verification |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account |
| `FIREBASE_PRIVATE_KEY` | Yes | Escaped newlines (`\n`) |
| `VITE_FIREBASE_*` | Yes | Client Firebase config (rebuild if changed) |
| `VITE_POSTHOG_KEY` | Optional | Product analytics |

## Firebase live-domain setup

`VITE_FIREBASE_AUTH_DOMAIN` should remain the exact hostname supplied by the Firebase Web App configuration, normally `<project-id>.firebaseapp.com` without `https://`.

Separately, open **Firebase Console → Authentication → Settings → Authorized domains** and add:

- `buildecogroup.com`
- `www.buildecogroup.com`

Also confirm **Authentication → Sign-in method → Google** is enabled. Rebuild the frontend after changing any `VITE_FIREBASE_*` value.

For password reset, confirm **Authentication → Templates → Password reset** is enabled and uses the correct BuildEcoGroup sender name and continue URL.

## Required source files (Linux)

Before `npm run build`, these files **must** exist on the server (case-sensitive):

```
src/components/auth/ProtectedRoute.tsx
src/components/auth/RoleBadge.tsx
```

If Hostinger reports `Could not resolve "./components/auth/ProtectedRoute"`, the deployed
source tree is incomplete — re-upload the full package or commit the `src/components/auth/` folder to git.

Run locally before deploy:

```bash
npm run verify:imports
```


```bash
# 1. Upload zip and extract to app root
unzip BuildEcoGroup_V18.14.1_PERFORMANCE_PRIVATE_DISCUSSION_CHARTS_HOSTINGER_READY.zip -d ~/app

# 2. Install production dependencies
cd ~/app
npm ci --omit=dev

# 3. Configure environment
cp .env.example .env
# Edit .env with Hostinger PostgreSQL + Firebase credentials

# 4. Run database migrations
npm run db:migrate

# 5. Build (if dist/ not included or env changed)
npm run build

# 6. Start
npm start
# Uses server/start-hostinger.cjs → dist/server.cjs
```

## Hostinger hPanel settings

- **Start command:** `npm start`
- **Node version:** 20.x
- **Build command (optional):** `npm ci --omit=dev && npm run build`
- **Environment:** set all `.env` values in hPanel Node.js env UI

## Post-deploy verification

1. `GET /api/health` → `persistence: postgresql`
2. Register a fresh test customer → logout → login again
3. Submit requirement → verify Case ID `BEG-2026-XXXXXX`
4. Server restart → confirm case still exists (PostgreSQL persistence)

## Super Admin access

1. Create the authorized Firebase Authentication user for `superadmin@buildecogroup.in` and set its password outside the source code.
2. Ensure the same verified email is mapped to the `SUPER_ADMIN` role in the authoritative PostgreSQL user record.
3. Sign in at `/login`; the role-aware dashboard hub opens `/dashboard/super-admin` automatically.
4. Use **Forgot password?** on the login page to send a Firebase password-reset email when needed.

The development-only one-click role switcher is hidden from production builds. Admin users cannot open the Super Admin Command Center because both the client route and API mutations enforce RBAC.

## Automated tests (optional, on staging)

```bash
npm run registration:test
npm run role-privacy:test
npm run e2e-fresh-user:test
```

## Support

- Official: support@buildecogroup.in
- Version: 18.14.1
