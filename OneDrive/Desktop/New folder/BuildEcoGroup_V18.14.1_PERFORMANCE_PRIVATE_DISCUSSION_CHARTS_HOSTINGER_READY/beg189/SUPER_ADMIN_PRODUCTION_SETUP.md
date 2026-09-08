# Super Admin Production Setup — BuildEcoGroup V18.15

Canonical Super Admin email: `superadmin@buildecogroup.in`  
Protected route: `/dashboard/super-admin`

Passwords must never be stored in PostgreSQL, source code, ZIP archives, localStorage, logs, or screenshots.

---

## A. Firebase Console checklist

1. Open Firebase project `buildecogroup-c600b` (or your production project).
2. **Authentication → Sign-in method**
   - Enable **Email/Password**
   - Enable **Google**
3. **Authentication → Settings → Authorized domains** must include:
   - `buildecogroup.com`
   - `www.buildecogroup.com`
   - `localhost` (development only)
4. Do **not** use `*.firebaseapp.com` as the public website URL. Keep
   `VITE_FIREBASE_AUTH_DOMAIN` as the Firebase auth domain
   (normally `<project-id>.firebaseapp.com`).
5. Create a Web App if needed and copy the client config into Hostinger
   `VITE_FIREBASE_*` variables, then rebuild.

### If Firebase Admin credentials are unavailable in this environment

Create the Super Admin identity manually:

1. Authentication → Users → Add user
2. Email: `superadmin@buildecogroup.in`
3. Set a strong temporary password in the Console only (do not paste it into chat, git, or `.env.example`)
4. Copy the Firebase UID for verification after bootstrap

---

## B. Hostinger environment variables (names only)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` or `PG*` | Authoritative PostgreSQL |
| `SESSION_SECRET` | ≥32 char random secret |
| `CORS_ORIGINS` | `https://www.buildecogroup.com,https://buildecogroup.com` |
| `FIREBASE_PROJECT_ID` | Admin project id |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account PEM (see formatting below) |
| `VITE_FIREBASE_API_KEY` | Client SDK |
| `VITE_FIREBASE_AUTH_DOMAIN` | Usually `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Client project id |
| `VITE_FIREBASE_APP_ID` | Client app id |
| `SUPER_ADMIN_EMAIL` | Default `superadmin@buildecogroup.in` |
| `SUPER_ADMIN_TEMP_PASSWORD` | Temporary only for bootstrap |
| `SUPER_ADMIN_RESET_PASSWORD` | `true` only when intentionally resetting |

### FIREBASE_PRIVATE_KEY formatting (most common Hostinger failure)

Preferred (multi-line PEM):

```
-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----
```

Single-line alternative (no surrounding quotes):

```
-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```

Avoid:

- Wrapping the whole PEM in extra `"..."` quotes inside the panel
- Truncating BEGIN/END lines
- Mixing Windows and escaped newlines incorrectly

After changing Admin env vars, **restart** the Node application.

Verify:

- `GET /api/auth/status` → `firebaseAdmin.configured: true`
- `GET /api/health` → `auth.firebaseAdminReady: true` and `auth.firebasePrivateKeyParsable: true`

---

## C. Bootstrap command

```bash
npm run bootstrap:superadmin
```

The command:

1. Creates or locates the Firebase user
2. Sets custom claim `{ role: "SUPER_ADMIN" }` when Admin SDK works
3. Upserts PostgreSQL/runtime user with role `SUPER_ADMIN`, status `ACTIVE`
4. Writes a security audit event
5. Does **not** print the full password
6. Does **not** overwrite an existing password unless `SUPER_ADMIN_RESET_PASSWORD=true`
7. Is safe to re-run (idempotent)

Then:

1. Remove `SUPER_ADMIN_TEMP_PASSWORD` from Hostinger env
2. Sign in at `https://www.buildecogroup.com/login`
3. Confirm redirect to `/dashboard/super-admin`
4. Change the password via Forgot password / Firebase if a temporary password was used

---

## D. Super Admin capabilities (server-enforced)

- Search/filter users, view profile + registration status
- Activate / suspend / unblock
- Send password-reset link (never view passwords)
- Change roles (Super Admin only for privileged roles)
- Verify consultants, manage enrolments, cases, commercial tools, audit logs
- Cannot remove/suspend the last active Super Admin
- Admins cannot promote themselves to Super Admin

---

## E. Rollback

1. Redeploy previous Hostinger-ready ZIP / build
2. Keep PostgreSQL backups before migrations
3. Super Admin bootstrap does not delete users; demote via audited role change only when another active Super Admin exists
