import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  verifyFirebaseToken,
  getFirebaseAdminStatus,
  sendFirebasePasswordResetLink,
} from './firebaseAdmin';
import { createSessionToken, setSessionCookie, clearSessionCookie } from './session';
import { store } from './store';
import { normalizeIndianLocation } from './lib/normalizeLocation';
import {
  CustomerRegistrationSchema,
  RoleAssignmentSchema,
  StatusUpdateSchema,
  firstZodFieldMessage,
  formatZodFieldErrors,
} from '../src/types/auth';
import {
  requireAuth,
  requireRole,
} from './middleware/auth';
import {
  authRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
} from './middleware/rateLimiter';
import { ROLE_PERMISSIONS } from '../src/lib/permissions';
import { env } from './env';

export const authRouter = Router();

function requestId(): string {
  return randomUUID();
}

function safeAuthError(code: string, message: string, reqId: string, status = 400) {
  return {
    success: false as const,
    error: message,
    code,
    requestId: reqId,
    status,
  };
}

/**
 * POST /api/auth/session
 * Exchanging Firebase identity token for an authoritative HttpOnly server session
 */
authRouter.post('/session', authRateLimiter, async (req: Request, res: Response) => {
  const reqId = requestId();
  try {
    const { idToken, email: reqEmail, rememberMe } = req.body;
    const persistSession = rememberMe !== false;

    let verifiedIdentity: { uid: string; email: string; emailVerified: boolean; displayName?: string };

    if (idToken) {
      verifiedIdentity = await verifyFirebaseToken(idToken);
    } else if (reqEmail && env.NODE_ENV !== 'production') {
      const candidateUser = store.findUserByEmail(reqEmail);
      if (!candidateUser) {
        return res.status(401).json(safeAuthError('ACCOUNT_NOT_FOUND', 'No account found with this email address. Please register first.', reqId, 401));
      }

      verifiedIdentity = {
        uid: candidateUser.firebaseUid || `uid-${candidateUser.id}`,
        email: candidateUser.email,
        emailVerified: candidateUser.emailVerified,
        displayName: candidateUser.fullName,
      };
    } else {
      return res.status(400).json(safeAuthError(
        'TOKEN_REQUIRED',
        env.NODE_ENV === 'production'
          ? 'A verified Firebase identity token is required.'
          : 'Missing authentication credentials or ID token.',
        reqId,
        400,
      ));
    }

    let user = store.findUserByFirebaseUid(verifiedIdentity.uid);
    if (!user) {
      user = store.findUserByEmail(verifiedIdentity.email);
    }

    // Orphan recovery: Firebase identity exists but profile missing / unlinked
    if (!user) {
      const repaired = store.upsertCustomerByFirebaseUid({
        firebaseUid: verifiedIdentity.uid,
        email: verifiedIdentity.email,
        fullName: verifiedIdentity.displayName || verifiedIdentity.email.split('@')[0],
        emailVerified: verifiedIdentity.emailVerified,
        ipAddress: req.ip,
      });
      user = repaired.user;
    } else if (!user.firebaseUid && verifiedIdentity.uid) {
      user = store.linkFirebaseUid(user.id, verifiedIdentity.uid, verifiedIdentity.emailVerified);
    } else {
      store.updateLastLogin(user.id);
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        ...safeAuthError('ACCOUNT_SUSPENDED', 'This account is currently suspended. Please contact BuildEcoGroup Platform Support.', reqId, 403),
        status: 'SUSPENDED',
      });
    }

    if (user.status === 'DISABLED') {
      return res.status(403).json({
        ...safeAuthError('ACCOUNT_DISABLED', 'This account has been disabled.', reqId, 403),
        status: 'DISABLED',
      });
    }

    const sessionToken = createSessionToken(user, persistSession);
    setSessionCookie(res, sessionToken, persistSession);

    store.recordSecurityAudit({
      actorId: user.id,
      action: 'LOGIN_SUCCEEDED',
      entityType: 'SESSION',
      entityId: user.id,
      ipAddress: req.ip,
      changes: { role: user.role, status: user.status, requestId: reqId },
    });

    return res.status(200).json({
      success: true,
      user,
      token: sessionToken,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      requestId: reqId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed.';
    console.error(`[BuildEcoGroup Auth][${reqId}] Session creation error:`, message);
    const status = message.includes('Firebase Admin SDK is not configured')
      ? 503
      : message.includes('token verification failed')
        ? 401
        : 401;
    return res.status(status).json(safeAuthError(
      message.includes('not configured') ? 'FIREBASE_ADMIN_MISSING' : 'AUTH_FAILED',
      message.includes('not configured')
        ? 'Server authentication is temporarily unavailable. Please try again shortly.'
        : 'Authentication failed. Please verify your credentials.',
      reqId,
      status,
    ));
  }
});

/**
 * POST /api/auth/register-customer
 * Minimal customer registration handler
 */
authRouter.post('/register-customer', registrationRateLimiter, async (req: Request, res: Response) => {
  const reqId = requestId();
  try {
    // Never honor client-supplied role
    if (req.body && typeof req.body === 'object') {
      delete req.body.role;
    }

    const parseResult = CustomerRegistrationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: firstZodFieldMessage(parseResult.error),
        code: 'VALIDATION_FAILED',
        details: formatZodFieldErrors(parseResult.error),
        requestId: reqId,
      });
    }

    const data = parseResult.data;

    if (!data.idToken && env.NODE_ENV === 'production') {
      return res.status(401).json(safeAuthError('TOKEN_REQUIRED', 'Verified Firebase registration is required.', reqId, 401));
    }

    let firebaseUid: string | null = null;
    let emailVerified = false;

    if (data.idToken) {
      const verified = await verifyFirebaseToken(data.idToken);
      if (!verified.email || verified.email.toLowerCase() !== data.email.toLowerCase()) {
        return res.status(401).json(safeAuthError('EMAIL_MISMATCH', 'Registration email does not match the verified identity.', reqId, 401));
      }
      firebaseUid = verified.uid;
      emailVerified = verified.emailVerified;
    } else if (env.NODE_ENV !== 'production') {
      firebaseUid = `uid-dev-${data.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      emailVerified = true;
    }

    if (!firebaseUid) {
      return res.status(401).json(safeAuthError('TOKEN_REQUIRED', 'Verified Firebase registration is required.', reqId, 401));
    }

    const phoneOwner = store.findUserByPhone(data.phone);
    if (phoneOwner && phoneOwner.email !== data.email) {
      return res.status(409).json(safeAuthError(
        'DUPLICATE_MOBILE',
        'An account with this mobile number already exists. Please sign in instead.',
        reqId,
        409,
      ));
    }

    const existingByEmail = store.findUserByEmail(data.email);
    if (existingByEmail && existingByEmail.firebaseUid && existingByEmail.firebaseUid !== firebaseUid) {
      return res.status(409).json(safeAuthError(
        'DUPLICATE_EMAIL',
        'An account with this email address already exists. Please sign in instead.',
        reqId,
        409,
      ));
    }

    if (existingByEmail && !existingByEmail.firebaseUid) {
      return res.status(409).json(safeAuthError(
        'PROFILE_NEEDS_RESET',
        'An account profile exists for this email but is not linked to a sign-in identity. Use Forgot password or contact support to repair access.',
        reqId,
        409,
      ));
    }

    const location = normalizeIndianLocation({
      pincode: data.pincode,
      city: data.city,
      district: data.district,
      stateRegion: data.stateRegion,
      country: data.country,
    });

    const upserted = store.upsertCustomerByFirebaseUid({
      firebaseUid,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      emailVerified,
      profile: {
        city: location.city,
        district: location.district,
        stateRegion: location.stateRegion,
        pincode: location.pincode,
        country: location.country,
        stakeholderType: 'CLIENT',
      },
      ipAddress: req.ip,
    });

    // Force CUSTOMER on public registration even if a prior privileged seed was somehow matched by UID (should not happen).
    if (upserted.created || upserted.repaired) {
      upserted.user.role = 'CUSTOMER';
      if (upserted.user.status === 'PENDING') upserted.user.status = 'ACTIVE';
    }

    const sessionToken = createSessionToken(upserted.user, true);
    setSessionCookie(res, sessionToken, true);

    store.recordSecurityAudit({
      actorId: upserted.user.id,
      action: upserted.created ? 'CUSTOMER_REGISTERED' : 'CUSTOMER_REGISTRATION_COMPLETED',
      entityType: 'USER',
      entityId: upserted.user.id,
      ipAddress: req.ip,
      changes: {
        created: upserted.created,
        repaired: upserted.repaired,
        requestId: reqId,
      },
    });

    return res.status(upserted.created ? 201 : 200).json({
      success: true,
      message: upserted.created ? 'Account created successfully' : 'Account profile linked successfully',
      user: upserted.user,
      token: sessionToken,
      permissions: ROLE_PERMISSIONS[upserted.user.role] || [],
      requestId: reqId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete registration.';
    console.error(`[BuildEcoGroup Auth][${reqId}] Registration error:`, message);

    if (message.includes('mobile number already exists')) {
      return res.status(409).json(safeAuthError('DUPLICATE_MOBILE', message, reqId, 409));
    }
    if (message.includes('already exists')) {
      return res.status(409).json(safeAuthError('DUPLICATE_EMAIL', 'An account with this email address already exists. Please sign in instead.', reqId, 409));
    }
    if (message.includes('Firebase Admin SDK is not configured')) {
      return res.status(503).json(safeAuthError(
        'FIREBASE_ADMIN_MISSING',
        'Registration could not be completed because server authentication is temporarily unavailable. If you just created a password, sign in after support restores verification — your profile can be completed automatically.',
        reqId,
        503,
      ));
    }
    if (message.includes('token verification failed')) {
      return res.status(401).json(safeAuthError('TOKEN_INVALID', 'Your sign-in session expired or is invalid. Please try again.', reqId, 401));
    }

    return res.status(500).json(safeAuthError(
      'REGISTRATION_FAILED',
      'Failed to complete registration. Please try again. If this continues, sign in with the same email to finish profile setup.',
      reqId,
      500,
    ));
  }
});

/**
 * POST /api/auth/register-consultant
 * Consultant Onboarding & Application Submission
 */
authRouter.post('/register-consultant', registrationRateLimiter, async (req: Request, res: Response) => {
  const reqId = requestId();
  try {
    const {
      fullName,
      email,
      phone,
      discipline,
      specialization,
      city,
      statutoryRegNumber,
      firmName,
      experienceYears,
      idToken,
    } = req.body;

    if (!fullName || !email || !discipline) {
      return res.status(400).json(safeAuthError('VALIDATION_FAILED', 'Full name, valid email, and primary engineering discipline are required.', reqId));
    }

    const existingUser = store.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json(safeAuthError('DUPLICATE_EMAIL', 'An account with this email already exists. Please sign in.', reqId, 409));
    }

    let firebaseUid: string | null = null;
    if (!idToken && env.NODE_ENV === 'production') {
      return res.status(401).json(safeAuthError('TOKEN_REQUIRED', 'Verified Firebase registration is required.', reqId, 401));
    }
    if (idToken) {
      const verified = await verifyFirebaseToken(idToken);
      if (verified.email.toLowerCase() !== String(email).toLowerCase()) {
        return res.status(401).json(safeAuthError('EMAIL_MISMATCH', 'Registration email does not match the verified identity.', reqId, 401));
      }
      firebaseUid = verified.uid;
    }

    const user = store.createUser({
      email,
      fullName,
      phone,
      role: 'CONSULTANT',
      status: 'ACTIVE',
      firebaseUid,
      profile: {
        organization: firmName || 'Independent Practice',
        designation: `${discipline} Specialist`,
        city,
      },
      ipAddress: req.ip,
    });

    const consultant = store.createConsultantOnboarding({
      fullName,
      email,
      phone: phone || '',
      discipline,
      specialties: specialization ? [specialization] : ['General Sustainable Engineering'],
      city: city || 'Bengaluru',
      statutoryRegNumber: statutoryRegNumber || 'SUBMITTED-DOC-PENDING',
      firmName: firmName || 'Independent Practice',
      yearsExp: Number(experienceYears) || 5,
      educationDegree: 'B.Arch / B.Tech or Equivalent',
      hourlyRateEst: '₹4,500 / hr',
      declarationAccepted: true,
    });

    store.recordSecurityAudit({
      actorId: user.id,
      action: 'CONSULTANT_APPLICATION_SUBMITTED',
      entityType: 'CONSULTANT',
      entityId: consultant.id,
      changes: { discipline, statutoryRegNumber, status: 'SUBMITTED', requestId: reqId },
    });

    const sessionToken = createSessionToken(user, true);
    setSessionCookie(res, sessionToken, true);

    return res.status(201).json({
      success: true,
      message: 'Consultant registration and credentials submitted for administrative verification.',
      user,
      consultant,
      token: sessionToken,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      requestId: reqId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Consultant onboarding failed.';
    console.error(`[BuildEcoGroup Auth][${reqId}] Consultant registration error:`, message);
    return res.status(500).json(safeAuthError('CONSULTANT_REGISTRATION_FAILED', 'Consultant onboarding failed.', reqId, 500));
  }
});

/**
 * GET /api/auth/status
 * Read-only auth configuration diagnostics (no secrets).
 */
authRouter.get('/status', (req: Request, res: Response) => {
  const admin = getFirebaseAdminStatus();
  return res.json({
    success: true,
    environment: env.NODE_ENV,
    firebaseAdmin: {
      configured: admin.ready,
      envPresent: admin.envPresent,
      privateKeyParsable: admin.privateKeyParsable,
      projectId: admin.projectId,
      initError: admin.ready ? null : (admin.initError ? 'initialization_failed' : 'not_ready'),
    },
    session: {
      cookieConfigured: Boolean(env.SESSION_SECRET && env.SESSION_SECRET.length >= 32),
      authenticated: Boolean(req.user),
    },
    authorizedDomainsHint: [
      'www.buildecogroup.com',
      'buildecogroup.com',
      'localhost',
    ],
    googleSignIn: 'redirect',
  });
});

/**
 * PATCH /api/auth/profile-interests
 */
authRouter.patch('/profile-interests', requireAuth, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { interests, customCategory } = req.body as { interests?: string[]; customCategory?: string };
    const updated = store.updateUserProfile(user.id, {
      interests: Array.isArray(interests) ? interests : [],
    });
    if (customCategory && customCategory.trim()) {
      store.suggestCustomCategory(user.id, customCategory.trim());
    }
    return res.json({ success: true, user: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save preferences.';
    return res.status(400).json({ success: false, error: message });
  }
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    user,
    permissions: ROLE_PERMISSIONS[user.role] || [],
  });
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  if (req.user) {
    store.recordSecurityAudit({
      actorId: req.user.id,
      action: 'LOGOUT',
      entityType: 'SESSION',
      entityId: req.user.id,
      ipAddress: req.ip,
    });
  }

  clearSessionCookie(res);
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * POST /api/auth/forgot-password
 * Privacy-safe password reset. Uses Firebase Admin reset link when available;
 * client also triggers Firebase client reset for delivery.
 */
authRouter.post('/forgot-password', passwordResetRateLimiter, async (req: Request, res: Response) => {
  const reqId = requestId();
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (email && email.includes('@')) {
    try {
      await sendFirebasePasswordResetLink(email);
      store.recordSecurityAudit({
        actorId: 'system',
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'USER',
        entityId: email,
        ipAddress: req.ip,
        changes: { requestId: reqId },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'reset failed';
      console.error(`[BuildEcoGroup Auth][${reqId}] Password reset error:`, message);
    }
  }

  return res.json({
    success: true,
    message: 'If an account is associated with this email address, password reset instructions have been dispatched.',
    requestId: reqId,
  });
});

// ==========================================
// Administrative RBAC Endpoints
// ==========================================

export const adminRouter = Router();

adminRouter.get('/users', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  const role = String(req.query.role || '').toUpperCase();
  const status = String(req.query.status || '').toUpperCase();

  let users = store.getAllUsers();
  if (q) {
    users = users.filter((u) =>
      u.email.includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.phone || '').includes(q)
    );
  }
  if (role && role !== 'ALL') {
    users = users.filter((u) => u.role === role);
  }
  if (status && status !== 'ALL') {
    users = users.filter((u) => u.status === status);
  }

  // Never expose secrets; SafeUser already omits passwords.
  return res.json({
    success: true,
    users,
    total: users.length,
  });
});

adminRouter.post('/users/:id/role', requireAuth, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const parseResult = RoleAssignmentSchema.safeParse({
      targetUserId: req.params.id,
      newRole: req.body.newRole,
      reason: req.body.reason,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: firstZodFieldMessage(parseResult.error),
        details: formatZodFieldErrors(parseResult.error),
      });
    }

    const updatedUser = store.updateUserRole(
      req.user!.id,
      parseResult.data.targetUserId,
      parseResult.data.newRole,
      parseResult.data.reason,
      req.ip
    );

    // Refresh actor session cookie if they changed themselves (should be rare/blocked)
    if (updatedUser.id === req.user!.id) {
      const token = createSessionToken(updatedUser, true);
      setSessionCookie(res, token, true);
    }

    return res.json({
      success: true,
      message: `User role successfully updated to ${updatedUser.role}`,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Role update failed';
    return res.status(400).json({ success: false, error: message });
  }
});

adminRouter.post('/users/:id/status', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const parseResult = StatusUpdateSchema.safeParse({
      targetUserId: req.params.id,
      newStatus: req.body.newStatus,
      reason: req.body.reason,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: firstZodFieldMessage(parseResult.error),
        details: formatZodFieldErrors(parseResult.error),
      });
    }

    const updatedUser = store.updateUserStatus(
      req.user!.id,
      parseResult.data.targetUserId,
      parseResult.data.newStatus,
      parseResult.data.reason,
      req.ip
    );

    return res.json({
      success: true,
      message: `User status successfully updated to ${updatedUser.status}`,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Status update failed';
    return res.status(400).json({ success: false, error: message });
  }
});

adminRouter.post('/users/:id/password-reset', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
  const reqId = requestId();
  try {
    const target = store.findUserById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (req.user!.role === 'ADMIN' && (target.role === 'SUPER_ADMIN' || target.role === 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Administrators cannot reset privileged accounts.' });
    }

    const link = await sendFirebasePasswordResetLink(target.email);
    store.recordSecurityAudit({
      actorId: req.user!.id,
      action: 'ADMIN_PASSWORD_RESET_SENT',
      entityType: 'USER',
      entityId: target.id,
      ipAddress: req.ip,
      changes: { requestId: reqId, delivered: Boolean(link) },
    });

    return res.json({
      success: true,
      message: 'If Firebase Auth is configured, a password reset link has been generated for this account.',
      delivered: Boolean(link),
      // Never return the raw reset link to browsers in production admin UI logs; allow Super Admin only for support copy.
      resetLink: req.user!.role === 'SUPER_ADMIN' ? link : undefined,
      requestId: reqId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Password reset failed';
    console.error(`[BuildEcoGroup Auth][${reqId}] Admin password reset error:`, message);
    return res.status(500).json({ success: false, error: 'Unable to send password reset link.', requestId: reqId });
  }
});

adminRouter.get('/audit-logs', requireAuth, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = store.getAuditLogs(limit);
  return res.json({
    success: true,
    logs,
    count: logs.length,
  });
});

adminRouter.post('/consultants/:id/verify', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const { verificationStatus } = req.body;
    if (!['VERIFIED', 'REJECTED', 'UNDER_REVIEW'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Valid verificationStatus is required: VERIFIED, REJECTED, or UNDER_REVIEW',
      });
    }

    const consultant = store.verifyConsultantStatus(
      req.user!.id,
      req.params.id,
      verificationStatus
    );

    return res.json({
      success: true,
      message: `Consultant verification status updated to ${verificationStatus}`,
      consultant,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return res.status(400).json({ success: false, error: message });
  }
});
