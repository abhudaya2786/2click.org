/**
 * Idempotent Super Admin bootstrap.
 *
 * Usage:
 *   SUPER_ADMIN_EMAIL=superadmin@buildecogroup.in \
 *   SUPER_ADMIN_TEMP_PASSWORD='********' \
 *   npm run bootstrap:superadmin
 *
 * Optional:
 *   SUPER_ADMIN_RESET_PASSWORD=true   # overwrite Firebase password
 *
 * Never commit real passwords. Remove SUPER_ADMIN_TEMP_PASSWORD from the
 * environment after a successful run.
 */
import { env } from '../env';
import { ensureFirebaseUser, setFirebaseCustomClaims, isFirebaseAdminReady } from '../firebaseAdmin';
import { store } from '../store';
import { restoreRuntimeState, flushPersistence } from '../persistence';

const DEFAULT_EMAIL = 'superadmin@buildecogroup.in';

function maskSecret(value: string): string {
  if (!value) return '(empty)';
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}…${value.slice(-2)} (len=${value.length})`;
}

async function main() {
  const email = (process.env.SUPER_ADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const tempPassword = process.env.SUPER_ADMIN_TEMP_PASSWORD || '';
  const resetPassword = String(process.env.SUPER_ADMIN_RESET_PASSWORD || '').toLowerCase() === 'true';

  console.log('[bootstrap:superadmin] Starting idempotent Super Admin bootstrap');
  console.log(`[bootstrap:superadmin] email=${email}`);
  console.log(`[bootstrap:superadmin] tempPassword=${maskSecret(tempPassword)}`);
  console.log(`[bootstrap:superadmin] resetPassword=${resetPassword}`);
  console.log(`[bootstrap:superadmin] NODE_ENV=${env.NODE_ENV}`);

  if (!email.endsWith('@buildecogroup.in') && email !== DEFAULT_EMAIL) {
    console.warn('[bootstrap:superadmin] Warning: email is outside @buildecogroup.in');
  }

  try {
    await restoreRuntimeState();
  } catch (error: unknown) {
    console.warn('[bootstrap:superadmin] Runtime restore skipped:', error instanceof Error ? error.message : error);
  }

  let firebaseUid: string | null = null;
  let createdFirebase = false;
  let passwordReset = false;

  if (isFirebaseAdminReady()) {
    if (!tempPassword && resetPassword) {
      throw new Error('SUPER_ADMIN_TEMP_PASSWORD is required when SUPER_ADMIN_RESET_PASSWORD=true');
    }
    if (!tempPassword) {
      // Locate-only path: require existing Firebase user
      const ensured = await ensureFirebaseUser({
        email,
        displayName: 'BuildEcoGroup Super Admin',
      }).catch(async (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('Temporary password is required')) {
          throw new Error(
            'Firebase user does not exist yet. Set SUPER_ADMIN_TEMP_PASSWORD to create it, then remove the env var after bootstrap.'
          );
        }
        throw err;
      });
      firebaseUid = ensured.uid;
      createdFirebase = ensured.created;
      passwordReset = ensured.passwordReset;
    } else {
      const ensured = await ensureFirebaseUser({
        email,
        password: tempPassword,
        displayName: 'BuildEcoGroup Super Admin',
        resetPassword,
      });
      firebaseUid = ensured.uid;
      createdFirebase = ensured.created;
      passwordReset = ensured.passwordReset;
    }

    await setFirebaseCustomClaims(firebaseUid, {
      role: 'SUPER_ADMIN',
      platform: 'buildecogroup',
    });
    console.log(`[bootstrap:superadmin] Firebase uid linked (created=${createdFirebase}, passwordReset=${passwordReset})`);
  } else {
    console.warn('[bootstrap:superadmin] Firebase Admin is not ready. Creating / updating PostgreSQL profile only.');
    console.warn('[bootstrap:superadmin] Follow SUPER_ADMIN_PRODUCTION_SETUP.md to create the Firebase user in Console.');
    firebaseUid = `pending-firebase:${email}`;
  }

  const upserted = store.upsertPrivilegedUser({
    email,
    fullName: 'BuildEcoGroup Super Admin',
    role: 'SUPER_ADMIN',
    firebaseUid,
    status: 'ACTIVE',
    mustChangePassword: createdFirebase || passwordReset,
    actorId: 'bootstrap:superadmin',
    ipAddress: 'bootstrap',
  });

  store.recordSecurityAudit({
    actorId: 'bootstrap:superadmin',
    action: 'SUPER_ADMIN_BOOTSTRAP',
    entityType: 'USER',
    entityId: upserted.user.id,
    ipAddress: 'bootstrap',
    changes: {
      email,
      created: upserted.created,
      firebaseCreated: createdFirebase,
      passwordReset,
      role: 'SUPER_ADMIN',
      mustChangePassword: upserted.user.mustChangePassword === true,
    },
  });

  try {
    await flushPersistence();
  } catch (error: unknown) {
    console.warn('[bootstrap:superadmin] Persistence flush skipped:', error instanceof Error ? error.message : error);
  }

  console.log('[bootstrap:superadmin] Success');
  console.log(`[bootstrap:superadmin] userId=${upserted.user.id}`);
  console.log(`[bootstrap:superadmin] role=${upserted.user.role} status=${upserted.user.status}`);
  console.log('[bootstrap:superadmin] Remove SUPER_ADMIN_TEMP_PASSWORD from the environment now.');
  if (upserted.user.mustChangePassword) {
    console.log('[bootstrap:superadmin] Password change is marked required on first interactive login where supported.');
  }
}

main().catch((error) => {
  console.error('[bootstrap:superadmin] FAILED:', error instanceof Error ? error.message : error);
  process.exit(1);
});
