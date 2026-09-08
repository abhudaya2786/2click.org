# Registration Root Cause and Fix — BuildEcoGroup V18.15

**Diagnosis date:** 2026-09-08  
**Production URL probed:** https://www.buildecogroup.com/register  
**Status:** Root cause confirmed with live Network/API evidence. Code fixes follow in this release. Production will remain broken until Hostinger env + redeploy.

---

## Confirmed primary root cause

### 1. Firebase Admin SDK fails to initialize on production (blocks profile + session)

**Evidence (live):**

1. Browser completed `/register` step 1–2 and submitted **Create Account**.
2. Client Firebase config is present in the production bundle:
   - `authDomain`: `buildecogroup-c600b.firebaseapp.com`
   - `projectId`: `buildecogroup-c600b`
   - API key present
3. Firebase client signup runs (`createUserWithEmailAndPassword`), then the app posts to `/api/auth/register-customer` with an ID token.
4. Backend responses observed from the production origin:

| Probe | HTTP | Body |
|---|---|---|
| Register without `idToken` (valid fields) | `401` | `Verified Firebase registration is required.` |
| Register / session with JWT-shaped token | `500` / `503` | `Firebase Admin SDK is not configured in production. Cannot verify ID token.` (`FIREBASE_ADMIN_MISSING`) |
| UI message after real signup attempt | — | `Server authentication is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on Hostinger, then restart the app.` |
| `GET /api/auth/status` | `200` | `firebaseAdmin.configured: true` (**false positive**) |

**Interpretation:**

- Client Firebase works.
- Hostinger appears to have Firebase Admin env *names* set (status checks only presence of `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
- `initializeApp({ credential: cert(...) })` still fails at runtime (typical Hostinger cause: private key newline/`\\n`/quote wrapping), so `verifyFirebaseToken()` treats Admin as unavailable.
- Result: **Firebase user can be created, PostgreSQL/profile + HttpOnly session never complete** → orphan identity + user sees a configuration error.

This is the registration failure users hit after a complete form submit.

---

## Confirmed secondary root cause

### 2. PostgreSQL is not configured in production (no durable profile)

**Evidence (live `GET /api/health`):**

```json
{
  "status": "degraded",
  "database": {
    "type": "PostgreSQL",
    "configured": false,
    "connected": false,
    "persistence": "memory-fallback"
  }
}
```

Even after Admin verification is fixed, profiles currently persist only via optional `app_runtime_state` JSON when `DATABASE_URL` / `PG*` is set. With DB unset, registrations cannot survive process restarts and cannot be the authoritative application database.

---

## Contributing defects (code-level, verified in source + probes)

| Issue | Evidence | Impact |
|---|---|---|
| `/api/auth/status` reports Admin “configured” from env presence only | Live mismatch vs verify failure | Operators think Auth is healthy while register/login fail |
| Generic `Invalid registration details` hides Zod field errors | Live 400 responses include `details`, UI ignores them | Users cannot fix phone/pincode/password issues |
| Frontend password check is weaker than shared Zod schema | Client: length ≥ 8; server: uppercase + digit | Passwords that pass step 1 can fail server validation |
| Phone validation is `min(8)`, not Indian mobile | Schema + tests | Weak / inconsistent mobile uniqueness |
| No Firebase-UID upsert / orphan recovery | `createUser` throws on duplicate email only; no repair path | Firebase-created / DB-missing accounts cannot recover on next login |
| `createUser` coerces `SUPER_ADMIN` → `CUSTOMER` always | `store.createUser` | Breaks Super Admin bootstrap if it uses the public create path |
| Role/status APIs require UUID, IDs are `usr-…` | `RoleAssignmentSchema` vs `usr-${crypto.randomUUID()}` / seed IDs | Super Admin role changes can fail validation |
| No last-active Super Admin protection | `updateUserRole` / `updateUserStatus` | Last Super Admin can be demoted/suspended |
| `rememberMe` ignored for cookie lifetime | Session always 7 days | Spec violation |
| Customer dashboard canonical path `/dashboard/user` missing | Routes use `/dashboard` | Spec mismatch |
| No `npm run bootstrap:superadmin` | package.json | No idempotent production Super Admin bootstrap |

**Checked and not the primary live failure:**

- Field-name mismatch between form and API (names align: `fullName`, `stateRegion`, etc.).
- Pincode autofill (live lookup returned Bangalore for `560001`).
- CORS between apex/`www` as the immediate submit error (same-origin `/api` calls succeeded).
- Authorized-domain block on this email/password attempt (client Firebase signup proceeded far enough to call the backend).

---

## Fix strategy (implemented in V18.15)

1. Harden Firebase Admin private-key parsing and report **actual** Admin readiness from `/api/auth/status` + `/api/health`.
2. Make registration a safe verified-token → upsert-by-`firebaseUid` → session flow with field-level errors, safe error codes, and request IDs.
3. Recover orphans on `/api/auth/session` and `/api/auth/register-customer`.
4. Add Super Admin bootstrap command, RBAC safeguards, and `/dashboard/user`.
5. Add migration + require durable PostgreSQL for production auth writes; document Hostinger env checklist.
6. Expand automated tests; package Hostinger-ready ZIP **without secrets**.

---

## Production actions still required after code deploy

1. Fix Hostinger `FIREBASE_PRIVATE_KEY` formatting (see `SUPER_ADMIN_PRODUCTION_SETUP.md`).
2. Set `DATABASE_URL` (or `PG*`) and run migrations.
3. Confirm Firebase Authorized Domains: `buildecogroup.com`, `www.buildecogroup.com`, `localhost` (dev only).
4. Run `npm run bootstrap:superadmin` once with temporary env vars, then remove the temp password.
5. Restart the Node app and re-test `/register` end-to-end.
