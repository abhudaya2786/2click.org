# Hostinger Deploy Checklist — V18.15 (Registration + Super Admin)

## Super Admin login (after bootstrap)

- URL: https://www.buildecogroup.com/login
- User ID / Email: `superadmin@buildecogroup.in`
- Password: **not stored in this ZIP** (security rule). You choose a strong temporary password in Hostinger env only.

## Before upload

1. Fix `FIREBASE_PRIVATE_KEY` in hPanel (multi-line PEM or `\n` escaped, no extra quotes)
2. Set `DATABASE_URL` (PostgreSQL) — required for lasting profiles
3. Set `SESSION_SECRET` (≥32 chars), `CORS_ORIGINS`, all `VITE_FIREBASE_*` and `FIREBASE_*` vars
4. Set `SUPER_ADMIN_EMAIL=superadmin@buildecogroup.in`
5. Set `SUPER_ADMIN_TEMP_PASSWORD=<your strong temporary password>` (hPanel only — never commit)

## Deploy

1. Upload this ZIP to Hostinger Node.js app / rebuild
2. Hostinger runs `npm install` + `npm run build`
3. On server: `npm run db:migrate`
4. On server: `npm run bootstrap:superadmin`
5. Remove `SUPER_ADMIN_TEMP_PASSWORD` from hPanel and restart
6. Login with `superadmin@buildecogroup.in` + the password you set
7. Confirm redirect to `/dashboard/super-admin`
8. Test customer `/register` then `/login` → `/dashboard/user`

## Verify

- `GET /api/auth/status` → Firebase Admin ready
- `GET /api/health` → database not `memory-fallback`
- New customer registration returns 201 and sets session cookie

See `SUPER_ADMIN_PRODUCTION_SETUP.md` and `REGISTRATION_ROOT_CAUSE_AND_FIX.md`.
