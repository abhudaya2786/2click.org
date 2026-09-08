import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../session';
import { store } from '../store';
import { SafeUser, UserRole, Permission } from '../../src/types/auth';
import { hasPermission } from '../../src/lib/permissions';
import { userCanAccessCase } from '../security/caseAccess';

// Extend Express Request interface to hold authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      sessionToken?: string;
    }
  }
}

/**
 * Middleware that extracts and validates the server session cookie or Bearer header
 */
export async function authenticateSession(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check HttpOnly Cookie first
  if (req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    token = req.cookies[SESSION_COOKIE_NAME];
  }

  // 2. Check Authorization Header fallback
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token) {
    return next();
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return next();
  }

  // Fetch authoritative user record from store/Postgres
  const user = store.findUserById(payload.userId);
  if (!user) {
    return next();
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

/**
 * Middleware requiring authenticated user with active account status
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this resource.',
    });
  }

  // Check account status
  if (req.user.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      error: 'Your BuildEcoGroup account has been suspended. Please contact platform compliance.',
      status: 'SUSPENDED',
    });
  }

  if (req.user.status === 'DISABLED') {
    return res.status(403).json({
      success: false,
      error: 'This account has been disabled.',
      status: 'DISABLED',
    });
  }

  next();
}

/**
 * Middleware requiring one of the specified roles
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}

/**
 * Middleware requiring specific permission from RBAC matrix
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Insufficient permissions for '${permission}'.`,
      });
    }

    next();
  };
}

/**
 * Middleware strictly isolating case access:
 * - Customers can ONLY access their own cases
 * - Consultants can ONLY access assigned cases
 * - Admin, Super Admin, and Employees can access any case
 */
export function validateCaseAccess(req: Request, res: Response, next: NextFunction) {
  const caseIdOrRef = req.params.id || req.params.caseId;
  if (!caseIdOrRef) {
    return res.status(400).json({ success: false, error: 'Case ID parameter missing' });
  }

  const targetCase = store.getCase(caseIdOrRef);
  if (!targetCase) {
    return res.status(404).json({ success: false, error: 'Case record not found' });
  }

  // If unauthenticated (e.g. public intake brief tracking if allowed), check rules
  if (!req.user) {
    // In strict mode, cases require authentication
    return res.status(401).json({ success: false, error: 'Authentication required to inspect case workspace.' });
  }

  const assignments = store.getAssignmentsForCase(targetCase.id);
  if (!userCanAccessCase(req.user, targetCase, assignments)) {
    const message = req.user.role === 'CUSTOMER'
      ? 'Access denied: You do not have permission to view this client case record.'
      : req.user.role === 'CONSULTANT'
      ? 'Access denied: This case has not been assigned to your consultant practice.'
      : 'Unauthorized access to case record.';
    return res.status(403).json({ success: false, error: message });
  }

  return next();
}

/**
 * Middleware isolating BOQ/commercial records via parent case ownership.
 */
export function validateBOQAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const boqId = req.params.id || req.params.boqId;
  if (!boqId) {
    return res.status(400).json({ success: false, error: 'BOQ ID parameter missing' });
  }

  const boq = store.getBOQRecordRaw(boqId);
  if (!boq) {
    return res.status(404).json({ success: false, error: `BOQ not found: ${boqId}` });
  }

  const targetCase = store.getCase(boq.caseId);
  if (!targetCase) {
    return res.status(404).json({ success: false, error: 'Associated case record not found' });
  }

  const assignments = store.getAssignmentsForCase(targetCase.id);
  if (!userCanAccessCase(req.user, targetCase, assignments)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: You do not have permission to access commercial records for this case.',
    });
  }

  return next();
}

/**
 * Middleware isolating quotation records via parent case or provider ownership.
 */
export function validateQuotationAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const quotationId = req.params.id;
  if (!quotationId) {
    return res.status(400).json({ success: false, error: 'Quotation ID parameter missing' });
  }

  const quote = store.getQuotationRecordRaw(quotationId);
  if (!quote) {
    return res.status(404).json({ success: false, error: `Quotation not found: ${quotationId}` });
  }

  if (quote.providerId === req.user.id) {
    return next();
  }

  const targetCase = store.getCase(quote.caseId);
  if (!targetCase) {
    return res.status(404).json({ success: false, error: 'Associated case record not found' });
  }

  const assignments = store.getAssignmentsForCase(targetCase.id);
  if (!userCanAccessCase(req.user, targetCase, assignments)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: You do not have permission to view this quotation.',
    });
  }

  return next();
}
