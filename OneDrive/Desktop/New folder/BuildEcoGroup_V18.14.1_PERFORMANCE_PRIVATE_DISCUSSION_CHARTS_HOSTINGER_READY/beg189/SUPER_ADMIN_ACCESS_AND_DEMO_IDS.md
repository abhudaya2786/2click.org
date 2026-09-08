# BuildEcoGroup demo IDs and Super Admin access

## Development preview IDs

Open `/login` in a development build and use the one-click **Test Pre-Seeded Identities** cards. A password is not required for these local demo buttons.

| Workspace | Demo ID | Default route |
|---|---|---|
| Customer | `aditya.vardhan@ecoventures.in` | `/dashboard` |
| Consultant | `elena.rostova@beg-partner.in` | `/dashboard/consultant` |
| Coordinator | `coordinator@buildecogroup.in` | `/dashboard/employee` |
| Admin | `admin@buildecogroup.in` | `/dashboard/admin` |
| Super Admin | `superadmin@buildecogroup.in` | `/dashboard/super-admin` |

These shortcuts are compiled only when `import.meta.env.DEV` is true. The server also blocks direct email-only demo sessions when `NODE_ENV=production`.

## Production Super Admin access

1. In Firebase Console, create or confirm the Authentication user `superadmin@buildecogroup.in`.
2. Set a strong password in Firebase or send a password-reset email. Never store the password in source code, `.env.example`, screenshots, or the deployment ZIP.
3. In the authoritative PostgreSQL users table/store, confirm that the exact verified email is active and has role `SUPER_ADMIN`.
4. Open `https://www.buildecogroup.com/login` and sign in with that Firebase identity.
5. The role-aware dashboard opens **Command Center** automatically. The protected URL is `/dashboard/super-admin`.

## Security rules

- `SUPER_ADMIN` is the only role that can change user roles and read security audit logs.
- `ADMIN` can operate cases and manage allowed account status actions, but cannot enter the Super Admin Command Center.
- All protected API calls verify the HttpOnly server session and role again; hiding a menu item alone is not treated as security.
- **Forgot password?** sends a privacy-safe Firebase reset flow without revealing whether an account exists.
