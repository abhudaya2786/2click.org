import { Router, Request, Response } from 'express';
import { 
  CaseIntakeSchema, 
  ConsultantOnboardingSchema, 
  LeadActionSchema,
  QualificationChecklistSchema,
  AssignmentActionSchema,
  EnrollmentIntakeSchema,
  EnrollmentActionSchema,
  CaseStatus,
  CreateBOQRequestSchema,
  SaveBOQRevisionInputSchema,
  BOQApprovalInputSchema,
  CreateQuotationInputSchema,
  CreateWorkPackageInputSchema,
  UpdateServiceCommercialRuleInputSchema,
  SubmitFreelancerBidInputSchema,
  CreateReferralInputSchema,
} from '../src/types/backend';
import { store } from './store';
import { checkDatabaseConnection } from '../src/db';
import { env, isDatabaseConfigured } from './env';
import { authRouter, adminRouter } from './authRoutes';
import { assistantRouter } from './assistantRoutes';
import { requireAuth, requireRole, validateCaseAccess, validateBOQAccess, validateQuotationAccess } from './middleware/auth';
import { syncCaseLeadToHubSpot } from './integrations/hubspot';
import { sanitizeCaseForRole } from './security/casePrivacy';
import { getFirebaseAdminStatus } from './firebaseAdmin';

export const apiRouter = Router();

// Mount Authentication & RBAC Routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/assistant', assistantRouter);

// 1. System Health & Reality Check
apiRouter.get('/health', async (req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  const firebaseAdmin = getFirebaseAdminStatus();
  
  res.json({
    status: dbStatus.connected && firebaseAdmin.ready ? 'ok' : 'degraded',
    version: '18.15.0',
    environment: env.NODE_ENV,
    database: {
      type: 'PostgreSQL',
      configured: dbStatus.configured,
      connected: dbStatus.connected,
      latencyMs: dbStatus.latencyMs,
      persistence: dbStatus.connected ? 'postgresql' : 'memory-fallback',
    },
    auth: {
      sessionCookieConfigured: Boolean(env.SESSION_SECRET && env.SESSION_SECRET.length >= 32),
      firebaseAdminReady: firebaseAdmin.ready,
      firebaseAdminEnvPresent: firebaseAdmin.envPresent,
      firebasePrivateKeyParsable: firebaseAdmin.privateKeyParsable,
      authenticated: Boolean(req.user),
      role: req.user?.role || null,
    },
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 1.2 Indian Pincode lookup (public, no auth required)
apiRouter.get('/pincode/:code', async (req: Request, res: Response) => {
  const code = String(req.params.code || '').replace(/\D/g, '').slice(0, 6);
  if (code.length !== 6) {
    return res.status(400).json({ success: false, error: 'Enter a valid 6-digit Indian pincode.' });
  }
  try {
    const upstream = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const data = await upstream.json();
    const entry = Array.isArray(data) ? data[0] : data;
    if (!entry || entry.Status !== 'Success' || !entry.PostOffice?.length) {
      return res.status(404).json({ success: false, error: 'Pincode not found. Enter city and state manually.' });
    }
    const office = entry.PostOffice[0];
    const district = office.District || office.Block || office.Name;
    const city = office.Block || office.District || office.Name;
    return res.json({
      success: true,
      pincode: code,
      city,
      district,
      state: office.State,
      country: 'India',
    });
  } catch {
    return res.status(502).json({ success: false, error: 'Pincode lookup service unavailable. Enter location manually.' });
  }
});

// 1.3 Reverse geolocation (optional helper for registration — never required)
apiRouter.get('/geolocation/reverse', async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ success: false, error: 'Valid latitude and longitude are required.' });
  }
  try {
    const upstream = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { Accept: 'application/json', 'User-Agent': 'BuildEcoGroup/18.14.1' } },
    );
    const data = await upstream.json();
    const addr = data.address || {};
    const district = addr.state_district || addr.county || addr.city_district || '';
    const city = addr.city || addr.town || addr.village || addr.suburb || district;
    const state = addr.state || '';
    const country = addr.country || 'India';
    const pincode = String(addr.postcode || '').replace(/\D/g, '').slice(0, 6);
    return res.json({
      success: true,
      city,
      district: district || city,
      state,
      country,
      pincode: pincode.length === 6 ? pincode : '',
    });
  } catch {
    return res.status(502).json({ success: false, error: 'Geolocation lookup unavailable. Enter location manually.' });
  }
});

// 1.1 Dedicated Database Status & Diagnostics
apiRouter.get('/db/status', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    success: true,
    ...dbStatus,
    envConfigured: isDatabaseConfigured(),
    driver: 'drizzle-orm/node-postgres',
  });
});

// ==========================================
// 2. Service Catalog (Pillars & Categories)
// ==========================================

apiRouter.get('/services', (req: Request, res: Response) => {
  try {
    const pillar = req.query.pillar as string | undefined;
    const services = store.getServiceCatalog(pillar);
    res.json({
      success: true,
      count: services.length,
      pillar: pillar || 'ALL',
      services,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/services/:slug', (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const service = store.getServiceCategory(slug);
    if (!service) {
      return res.status(404).json({ success: false, error: `Service category '${slug}' not found` });
    }
    res.json({ success: true, service });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. Case Intake & Creation
// ==========================================

apiRouter.post('/cases', (req: Request, res: Response) => {
  try {
    const parseResult = CaseIntakeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const payload = parseResult.data;
    let clientUserId: string | undefined = undefined;

    // If authenticated user is submitting, link customer email and ID
    if (req.user) {
      payload.clientEmail = req.user.email;
      payload.clientName = req.user.fullName;
      clientUserId = req.user.id;
      if (req.user.phone) {
        payload.clientPhone = req.user.phone;
      }
    }

    const { caseRecord, event } = store.createCase(payload, clientUserId);

    // Downstream CRM mirror only; never block authoritative case creation.
    void syncCaseLeadToHubSpot({
      caseReference: caseRecord.caseReference,
      serviceSlug: caseRecord.serviceSlug,
      projectTitle: caseRecord.projectTitle,
      city: caseRecord.city,
      stateRegion: caseRecord.stateRegion,
      clientName: caseRecord.clientName,
      clientEmail: caseRecord.clientEmail,
      clientPhone: caseRecord.clientPhone,
    });

    return res.status(201).json({
      success: true,
      caseId: caseRecord.id,
      caseReference: caseRecord.caseReference,
      status: caseRecord.status,
      pillar: caseRecord.pillar,
      serviceSlug: caseRecord.serviceSlug,
      createdAt: caseRecord.createdAt,
      case: caseRecord,
      event,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create case record',
      message: error?.message || 'Internal server error',
    });
  }
});

// ==========================================
// 3.1 Provider Enrollment Intake & Approval
// ==========================================

apiRouter.post('/enrollments', (req: Request, res: Response) => {
  try {
    const parseResult = EnrollmentIntakeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const payload = parseResult.data;
    const submittedByUserId = req.user?.id;
    const record = store.createEnrollment(payload, submittedByUserId);

    return res.status(201).json({
      success: true,
      enrollmentId: record.id,
      enrollmentReference: record.enrollmentReference,
      status: record.status,
      enrollment: record,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create enrollment record',
      message: error?.message || 'Internal server error',
    });
  }
});

apiRouter.get('/enrollments/mine', requireAuth, (req: Request, res: Response) => {
  try {
    const enrollments = store.getAllEnrollments().filter(e =>
      e.email.toLowerCase() === req.user!.email.toLowerCase() ||
      e.submittedByUserId === req.user!.id
    );
    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/enrollments', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'EMPLOYEE'), (req: Request, res: Response) => {
  try {
    let enrollments = store.getAllEnrollments();
    const statusFilter = req.query.status as string | undefined;
    if (statusFilter && statusFilter !== 'ALL') {
      enrollments = enrollments.filter(e => e.status === statusFilter);
    }
    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/enrollments/:idOrRef', requireAuth, (req: Request, res: Response) => {
  try {
    const record = store.getEnrollment(req.params.idOrRef);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'EMPLOYEE'].includes(req.user!.role);
    const isOwner = record.email.toLowerCase() === req.user!.email.toLowerCase() || record.submittedByUserId === req.user!.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    res.json({ success: true, enrollment: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/enrollments/:idOrRef/approve', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const parseResult = EnrollmentActionSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parseResult.error.format() });
    }
    const record = store.updateEnrollmentStatus(req.params.idOrRef, 'APPROVED', req.user!.id, parseResult.data.notes);
    res.json({ success: true, message: 'Enrollment approved', enrollment: record });
  } catch (error: any) {
    res.status(error.message?.includes('not found') ? 404 : 500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/enrollments/:idOrRef/reject', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const parseResult = EnrollmentActionSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parseResult.error.format() });
    }
    const record = store.updateEnrollmentStatus(req.params.idOrRef, 'REJECTED', req.user!.id, parseResult.data.reason || parseResult.data.notes);
    res.json({ success: true, message: 'Enrollment rejected', enrollment: record });
  } catch (error: any) {
    res.status(error.message?.includes('not found') ? 404 : 500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3.2 Public Track Lookup (sanitized, authoritative backend)
// ==========================================

apiRouter.get('/track/:idOrRef', (req: Request, res: Response) => {
  try {
    const track = store.getTrackView(req.params.idOrRef, req.user);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'No record found for this tracking ID. Please verify your Case ID (BEG-2026-XXXXXXXX) or Enrollment ID (BEG-ENR-2026-XXXXX).',
      });
    }
    return res.json({ success: true, track });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. Get Cases (Strictly Scoped by User RBAC Role)
// ==========================================

apiRouter.get('/cases', requireAuth, (req: Request, res: Response) => {
  try {
    const allCases = store.getAllCases();
    let visibleCases = allCases;

    if (req.user) {
      if (req.user.role === 'CUSTOMER') {
        // Customer can only view their own cases (demo seed cases are scoped by clientId/email, not global)
        visibleCases = allCases.filter(c => 
          (c.clientEmail && c.clientEmail.toLowerCase() === req.user!.email.toLowerCase()) ||
          c.clientId === req.user!.id
        );
      } else if (req.user.role === 'CONSULTANT') {
        // Consultant views assigned cases
        const consultantAssignments = store.getAssignmentsForConsultant(req.user.id);
        const assignedCaseIds = new Set(consultantAssignments.map(a => a.caseId));

        visibleCases = allCases.filter(c => 
          assignedCaseIds.has(c.id) ||
          c.assignedConsultantId === req.user!.id ||
          c.leadSpecialistName?.toLowerCase().includes(req.user!.fullName.toLowerCase()) ||
          c.targetSpecialist?.toLowerCase().includes(req.user!.fullName.toLowerCase())
        );
      }
      // ADMIN, SUPER_ADMIN, and EMPLOYEE view all cases
    }

    res.json({
      success: true,
      count: visibleCases.length,
      cases: visibleCases.map((caseRecord) => sanitizeCaseForRole(caseRecord, req.user?.role)),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. Get Single Case Details (Enforced Object Isolation)
// ==========================================

apiRouter.get('/cases/:id', validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const caseRecord = store.getCase(caseIdOrRef);

    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        error: `Case '${caseIdOrRef}' not found`,
      });
    }

    const milestones = store.getMilestones(caseRecord.caseReference);
    const documents = store.getDocuments(caseRecord.caseReference);
    const events = store.getEvents(caseRecord.id);
    const statusHistory = store.getCaseStatusHistory(caseRecord.id);
    const assignments = store.getAssignmentsForCase(caseRecord.id);
    const infoRequests = store.getInformationRequests(caseRecord.id);
    const callerRole = req.user ? req.user.role : 'CUSTOMER';
    const notes = store.getCaseNotes(caseRecord.id, callerRole);
    const messages = store.getCaseMessages(caseRecord.id);

    return res.json({
      success: true,
      case: sanitizeCaseForRole(caseRecord, req.user?.role),
      milestones,
      documents,
      events,
      statusHistory,
      assignments,
      infoRequests,
      notes,
      messages,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. Case State Machine Transitions
// ==========================================

apiRouter.post('/cases/:id/transition', requireAuth, validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const { nextStatus, reason, metadata } = req.body;

    if (!nextStatus || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: nextStatus and reason are mandatory.',
      });
    }

    const result = store.transitionCaseStatus({
      caseIdOrRef,
      nextStatus: nextStatus as CaseStatus,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      reason,
      metadata,
    });

    return res.json({
      success: true,
      message: `Status transitioned successfully to ${nextStatus}`,
      case: sanitizeCaseForRole(result.caseRecord, req.user?.role),
      history: result.history,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

apiRouter.get('/cases/:id/history', validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const history = store.getCaseStatusHistory(caseIdOrRef);
    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 7. Coordinator Queues & Workflow
// ==========================================

// Qualification Queue (Cases awaiting initial verification)
apiRouter.get('/coordinator/queue/qualification', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const allCases = store.getAllCases();
    const queue = allCases.filter(c => c.status === 'NEW' || c.status === 'QUALIFICATION_PENDING' || c.status === 'QUALIFICATION' || c.status === 'NEEDS_INFORMATION');
    res.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Matching Queue (Cases qualified, awaiting consultant match/dispatch)
apiRouter.get('/coordinator/queue/matching', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const allCases = store.getAllCases();
    const queue = allCases.filter(c => 
      c.status === 'QUALIFIED' || 
      c.status === 'COORDINATOR_ASSIGNED' || 
      c.status === 'MATCHING' || 
      c.status === 'SPECIALIST_MATCHING' || 
      c.status === 'CONSULTANT_DECLINED'
    );
    res.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Active Coordination Queue (Cases in active scope discovery / execution)
apiRouter.get('/coordinator/queue/active', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const allCases = store.getAllCases();
    const queue = allCases.filter(c => 
      c.status === 'CONSULTANT_ASSIGNED' || 
      c.status === 'ASSIGNED' || 
      c.status === 'CONSULTANT_ACCEPTED' || 
      c.status === 'SCOPE_DISCOVERY' || 
      c.status === 'IN_PROGRESS' || 
      c.status === 'PROPOSAL_PENDING' || 
      c.status === 'CUSTOMER_REVIEW'
    );
    res.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Qualify a Case
apiRouter.post('/cases/:id/qualify', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const parseResult = QualificationChecklistSchema.safeParse(req.body.checklist);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'All 5 qualification checklist items must be confirmed (true).',
        details: parseResult.error.format(),
      });
    }

    const updatedCase = store.qualifyCase({
      caseIdOrRef,
      checklist: parseResult.data,
      notes: req.body.notes,
      coordinatorUserId: req.user!.id,
    });

    res.json({
      success: true,
      message: `Case ${updatedCase.caseReference} successfully qualified.`,
      case: updatedCase,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Assign Coordinator to Case
apiRouter.post('/cases/:id/assign-coordinator', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const { coordinatorId, notes } = req.body;

    if (!coordinatorId) {
      return res.status(400).json({ success: false, error: 'coordinatorId is required.' });
    }

    const updatedCase = store.assignCoordinator({
      caseIdOrRef,
      coordinatorId,
      assignedByUserId: req.user!.id,
      notes,
    });

    res.json({
      success: true,
      message: `Coordinator assigned to ${updatedCase.caseReference}`,
      case: updatedCase,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get Deterministic Consultant Matches for a Case
apiRouter.get('/cases/:id/matches', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const matches = store.getConsultantMatchesForCase(caseIdOrRef);
    res.json({
      success: true,
      caseId: caseIdOrRef,
      count: matches.length,
      matches,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Dispatch Consultant Assignment
apiRouter.post('/cases/:id/assign-consultant', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const { consultantUserId, feeEstimate, responseDueHours, notes, overrideJustification } = req.body;

    if (!consultantUserId) {
      return res.status(400).json({ success: false, error: 'consultantUserId is required.' });
    }

    const assignment = store.assignConsultant({
      caseIdOrRef,
      consultantUserId,
      assignedByUserId: req.user!.id,
      feeEstimate,
      responseDueHours: responseDueHours ? parseInt(responseDueHours, 10) : 48,
      notes,
      overrideJustification,
    });

    res.status(201).json({
      success: true,
      message: `Assignment dispatched to consultant. Response required within ${assignment.responseDueAt}.`,
      assignment,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 8. Consultant Assignment & Response Workflow
// ==========================================

// Get Assignments for Authenticated Consultant
apiRouter.get('/consultant/assignments', requireAuth, requireRole('CONSULTANT', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const assignments = store.getAssignmentsForConsultant(req.user!.id);
    res.json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Respond to an Assignment (Accept / Decline)
apiRouter.post('/assignments/:id/respond', requireAuth, requireRole('CONSULTANT', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const parseResult = AssignmentActionSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assignment response payload.',
        details: parseResult.error.format(),
      });
    }

    const { action, reason, responseNotes } = parseResult.data;
    const result = store.respondToAssignment({
      assignmentId,
      consultantUserId: req.user!.id,
      action,
      reason,
      responseNotes,
    });

    res.json({
      success: true,
      message: action === 'accept'
        ? 'Assignment accepted! Technical scope discovery activated.'
        : 'Assignment declined. Case returned to coordinator matching pool.',
      assignment: result.assignment,
      case: sanitizeCaseForRole(result.caseRecord, req.user?.role),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Backward compatible legacy lead action route
apiRouter.post('/leads/:id/action', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const leadId = req.params.id;
    const parseResult = LeadActionSchema.safeParse({
      leadId,
      ...req.body,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead action parameters',
        details: parseResult.error.format(),
      });
    }

    const { action, consultantId, reason } = parseResult.data;
    const eventType = action === 'accept' ? 'ASSIGNMENT_ACCEPTED' : 'ASSIGNMENT_DECLINED';

    const event = store.recordEvent({
      case_id: leadId,
      case_reference: leadId,
      event_type: eventType,
      user_id: consultantId || req.user?.id || 'c-1',
      role: 'CONSULTANT',
      service: 'Structural Engineering',
      location: 'Bengaluru, KA',
      metadata: {
        leadId,
        action,
        reason: reason || null,
        timestamp: new Date().toISOString(),
      },
    });

    return res.json({
      success: true,
      leadId,
      action,
      eventType,
      message: action === 'accept' 
        ? `Lead ${leadId} accepted. Engagement scope dispatched to coordinator.`
        : `Lead ${leadId} declined. Reassigned to specialist pool.`,
      event,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 9. Information Requests (Customer Clarifications)
// ==========================================

apiRouter.get('/cases/:id/info-requests', validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const requests = store.getInformationRequests(caseIdOrRef);
    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/cases/:id/info-requests', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'CONSULTANT'), (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Question text is required.' });
    }

    const requestRecord = store.createInformationRequest({
      caseIdOrRef,
      requestedByUserId: req.user!.id,
      question: question.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Information request sent to customer.',
      request: requestRecord,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/info-requests/:id/respond', requireAuth, (req: Request, res: Response) => {
  try {
    const requestId = req.params.id;
    const { response } = req.body;

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Response text is required.' });
    }

    const result = store.respondToInformationRequest({
      requestId,
      customerUserId: req.user!.id,
      response: response.trim(),
    });

    res.json({
      success: true,
      message: 'Response submitted successfully. Case returned to active coordination queue.',
      request: result.request,
      case: sanitizeCaseForRole(result.caseRecord, req.user?.role),
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 10. Notes & Case Chat Messages
// ==========================================

apiRouter.get('/cases/:id/notes', validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const callerRole = req.user ? req.user.role : 'CUSTOMER';
    const notes = store.getCaseNotes(caseIdOrRef, callerRole);
    res.json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/cases/:id/notes', requireAuth, validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const { note, visibility } = req.body;

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Note content is required.' });
    }

    const noteRecord = store.createCaseNote({
      caseIdOrRef,
      authorUserId: req.user!.id,
      note: note.trim(),
      visibility: visibility === 'CUSTOMER_VISIBLE' ? 'CUSTOMER_VISIBLE' : 'INTERNAL',
    });

    res.status(201).json({
      success: true,
      note: noteRecord,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.get('/cases/:id/messages', validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const messages = store.getCaseMessages(caseIdOrRef);
    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/cases/:id/messages', requireAuth, validateCaseAccess, (req: Request, res: Response) => {
  try {
    const caseIdOrRef = req.params.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const msgRecord = store.createCaseMessage({
      caseIdOrRef,
      senderUserId: req.user!.id,
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      messageRecord: msgRecord,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// 11. In-App Notifications
// ==========================================

apiRouter.get('/notifications', requireAuth, (req: Request, res: Response) => {
  try {
    const notifications = store.getUserNotifications(req.user!.id);
    res.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      notifications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  try {
    const notifId = req.params.id;
    store.markNotificationRead(notifId, req.user!.id);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 12. Consultant Directory & Onboarding
// ==========================================

apiRouter.post('/consultants/onboarding', (req: Request, res: Response) => {
  try {
    const parseResult = ConsultantOnboardingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for consultant application',
        details: parseResult.error.format(),
      });
    }

    const consultant = store.createConsultantOnboarding(parseResult.data);

    return res.status(201).json({
      success: true,
      consultantId: consultant.id,
      verificationStatus: consultant.verificationStatus,
      message: 'Application received. Statutory council credentials queued for independent review.',
      consultant,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to process consultant empanelment application',
      message: error?.message || 'Internal server error',
    });
  }
});

apiRouter.get('/consultants', (req: Request, res: Response) => {
  try {
    const consultants = store.getAllConsultants();
    res.json({
      success: true,
      count: consultants.length,
      consultants,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 13. Event Log & Metrics
// ==========================================

apiRouter.get('/events', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const caseId = req.query.caseId as string | undefined;
    const events = store.getEvents(caseId);
    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/metrics', requireAuth, requireRole('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const metrics = store.getMetrics();
    res.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 14. Phase 6: Commercial Engine Endpoints
// ==========================================

// Tax Codes
apiRouter.get('/tax-codes', (req: Request, res: Response) => {
  try {
    const taxCodes = store.getTaxCodes();
    res.json({
      success: true,
      count: taxCodes.length,
      taxCodes,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/tax-codes', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const { code, name, rate, hsnSacCode } = req.body;
    if (!code || !name || rate === undefined) {
      return res.status(400).json({ success: false, error: 'Tax code, name, and rate are required.' });
    }

    const created = store.createTaxCode({
      code,
      name,
      rate: Number(rate),
      hsnSacCode,
      actorId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: 'Statutory tax code registered successfully.',
      taxCode: created,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// BOQ Creation & Retrieval
apiRouter.post('/cases/:id/boqs', requireAuth, validateCaseAccess, requireRole('CONSULTANT', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const parseResult = CreateBOQRequestSchema.safeParse({
      ...req.body,
      caseId: req.params.id,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for BOQ request',
        details: parseResult.error.format(),
      });
    }

    const boq = store.createBOQRequest({
      ...parseResult.data,
      createdBy: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: 'Commercial Bill of Quantities request initialized.',
      boq,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.get('/cases/:id/boqs', requireAuth, validateCaseAccess, (req: Request, res: Response) => {
  try {
    const userContext = req.user;
    const boqs = store.getBOQsForCase(req.params.id, userContext);
    res.json({
      success: true,
      count: boqs.length,
      boqs,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

apiRouter.get('/boqs/:id', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const boq = store.getBOQByIdOrRef(req.params.id, req.user);
    if (!boq) {
      return res.status(404).json({ success: false, error: `BOQ not found: ${req.params.id}` });
    }

    res.json({
      success: true,
      boq,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

// BOQ Revisions & Items Management
apiRouter.post('/boqs/:id/revisions', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const revision = store.createBOQRevision({
      boqId: req.params.id,
      notes,
      createdBy: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: `Revision ${revision.revisionNumber} initialized.`,
      revision,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/boqs/:id/revisions/:revisionId', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const parseResult = SaveBOQRevisionInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for BOQ revision items',
        details: parseResult.error.format(),
      });
    }

    const updated = store.updateBOQRevisionItems({
      boqId: req.params.id,
      revisionId: req.params.revisionId,
      items: parseResult.data.items,
      adjustments: parseResult.data.adjustments,
      notes: parseResult.data.notes,
      actorId: req.user!.id,
      actorRole: req.user!.role,
    });

    res.json({
      success: true,
      message: 'BOQ revision lines recalculated and saved.',
      revision: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Submit BOQ For Customer Review
apiRouter.post('/boqs/:id/revisions/:revisionId/submit', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const boq = store.submitBOQForReview({
      boqId: req.params.id,
      revisionId: req.params.revisionId,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      notes,
    });

    res.json({
      success: true,
      message: 'BOQ submitted for customer commercial review.',
      boq,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Customer Requests BOQ Changes
apiRouter.post('/boqs/:id/revisions/:revisionId/request-changes', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const { reasonCategory, comment } = req.body;
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Change request comment is required.' });
    }

    const result = store.requestBOQChanges({
      boqId: req.params.id,
      revisionId: req.params.revisionId,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      reasonCategory,
      comment,
    });

    res.json({
      success: true,
      message: 'Change request submitted to specialist.',
      boq: result.boq,
      approval: result.approval,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Customer Approves BOQ
apiRouter.post('/boqs/:id/revisions/:revisionId/approve', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const { comment } = req.body;
    const result = store.approveBOQ({
      boqId: req.params.id,
      revisionId: req.params.revisionId,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      comment,
    });

    res.json({
      success: true,
      message: 'Commercial estimate formally approved and locked.',
      boq: result.boq,
      approval: result.approval,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Quotations (Independent Suppliers / Providers)
apiRouter.get('/boqs/:id/quotations', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const quotations = store.getQuotationsForBOQ(req.params.id, req.user);
    res.json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/boqs/:id/quotations', requireAuth, (req: Request, res: Response) => {
  try {
    const parseResult = CreateQuotationInputSchema.safeParse({
      ...req.body,
      boqId: req.params.id,
    });

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for quotation submission',
        details: parseResult.error.format(),
      });
    }

    const quotation = store.createQuotation({
      ...parseResult.data,
      providerId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: `Quotation ${quotation.quotationReference} submitted successfully.`,
      quotation,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.get('/quotations/:id', requireAuth, validateQuotationAccess, (req: Request, res: Response) => {
  try {
    const quote = store.getQuotationById(req.params.id, req.user);
    if (!quote) {
      return res.status(404).json({ success: false, error: `Quotation not found: ${req.params.id}` });
    }

    res.json({
      success: true,
      quotation: quote,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

apiRouter.post('/quotations/:id/accept', requireAuth, validateQuotationAccess, (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const result = store.acceptQuotation({
      quotationId: req.params.id,
      customerId: req.user!.id,
      notes,
    });

    res.json({
      success: true,
      message: `Quotation ${result.quotation.quotationReference} accepted. Procurement scope initialized.`,
      quotation: result.quotation,
      boq: result.boq,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Normalized Comparison
apiRouter.get('/boqs/:id/compare', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const quotesParam = req.query.quotes as string | undefined;
    const quoteIds = quotesParam ? quotesParam.split(',') : undefined;

    const comparison = store.compareQuotations(req.params.id, quoteIds, req.user);
    res.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Document / Printable PDF Export Data
apiRouter.get('/boqs/:id/document', requireAuth, validateBOQAccess, (req: Request, res: Response) => {
  try {
    const revNum = req.query.revision ? Number(req.query.revision) : undefined;
    const docData = store.generateBOQDocumentData(req.params.id, revNum, req.user);
    res.json({
      success: true,
      document: docData,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// =========================================================================
// Phase 9: Category-wise Outsourcing & Commercial Engine Endpoints
// =========================================================================

// 1. Service Commercial Rules Master
apiRouter.get('/commercial/rules', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const serviceSlug = req.query.service as string | undefined;
    const rules = store.getServiceCommercialRules(serviceSlug);
    res.json({
      success: true,
      count: rules.length,
      rules,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/commercial/rules', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const parsed = UpdateServiceCommercialRuleInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for commercial rule parameters',
        details: parsed.error.format(),
      });
    }

    const updated = store.updateServiceCommercialRule(parsed.data, req.user!.id);
    res.json({
      success: true,
      message: `Commercial rule for ${updated.serviceName} updated (v${updated.version}).`,
      rule: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Multi-Party Revenue Sharing Split & Margin Simulation Engine
apiRouter.post('/commercial/simulate', requireAuth, (req: Request, res: Response) => {
  try {
    const { serviceSlug, quoteAmount, workModel, urgency, customOverrides } = req.body;
    if (!serviceSlug || quoteAmount === undefined) {
      return res.status(400).json({ success: false, error: 'serviceSlug and quoteAmount are required' });
    }

    const simulation = store.calculateMultiPartySplit({
      serviceSlug,
      quoteAmount: Number(quoteAmount),
      workModel,
      urgency,
      customOverrides,
    });

    res.json({
      success: true,
      simulation,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Work Packages Management (Work Package Builder)
apiRouter.get('/work-packages', requireAuth, (req: Request, res: Response) => {
  try {
    const { caseId, projectId, status, service, assignedPartyId } = req.query;
    const packages = store.getWorkPackages({
      caseId: caseId as string,
      projectId: projectId as string,
      status: status as string,
      serviceSlug: service as string,
      assignedPartyId: assignedPartyId as string,
    });

    res.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/work-packages/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const wp = store.getWorkPackageById(req.params.id);
    if (!wp) {
      return res.status(404).json({ success: false, error: `Work package not found: ${req.params.id}` });
    }
    res.json({ success: true, workPackage: wp });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/work-packages', requireAuth, (req: Request, res: Response) => {
  try {
    const parsed = CreateWorkPackageInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for work package creation',
        details: parsed.error.format(),
      });
    }

    const record = store.createWorkPackage(parsed.data, req.user!.id);
    res.status(201).json({
      success: true,
      message: `Work package ${record.packageReference} created successfully.`,
      workPackage: record,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/work-packages/:id/status', requireAuth, (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updated = store.updateWorkPackageStatus(req.params.id, status, notes, req.user!.id);
    res.json({
      success: true,
      message: `Work package status updated to ${status}.`,
      workPackage: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/work-packages/:id/assign', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'EMPLOYEE'), (req: Request, res: Response) => {
  try {
    const { partyId, partyName, partyRole, email } = req.body;
    if (!partyId || !partyName) {
      return res.status(400).json({ success: false, error: 'partyId and partyName are required' });
    }

    const updated = store.assignWorkPackage(
      req.params.id,
      { partyId, partyName, partyRole, email },
      req.user!.id
    );

    res.json({
      success: true,
      message: `Work package assigned to ${partyName} (${partyRole}).`,
      workPackage: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/work-packages/:id/payout-status', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const { payoutStatus, notes } = req.body;
    if (!payoutStatus) {
      return res.status(400).json({ success: false, error: 'payoutStatus is required' });
    }

    const updated = store.updateWorkPackagePayoutStatus(req.params.id, payoutStatus, notes, req.user!.id);
    res.json({
      success: true,
      message: `Work package payout status set to ${payoutStatus}.`,
      workPackage: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Freelancer Marketplace Opportunities & Bidding
apiRouter.get('/freelancer/opportunities', (req: Request, res: Response) => {
  try {
    const { service, status, search } = req.query;
    const opportunities = store.getFreelancerOpportunities({
      service: service as string,
      status: status as string,
      search: search as string,
    });

    res.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/freelancer/opportunities/:id', (req: Request, res: Response) => {
  try {
    const details = store.getFreelancerOpportunityById(req.params.id);
    if (!details) {
      return res.status(404).json({ success: false, error: `Opportunity not found: ${req.params.id}` });
    }
    res.json({
      success: true,
      opportunity: details.opportunity,
      bids: details.bids,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/freelancer/bids', requireAuth, (req: Request, res: Response) => {
  try {
    const parsed = SubmitFreelancerBidInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for freelancer bid submission',
        details: parsed.error.format(),
      });
    }

    const bid = store.submitFreelancerBid(parsed.data, {
      id: req.user!.id,
      name: req.user!.fullName,
      city: req.user!.profile?.city,
    });

    res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully to client review desk.',
      bid,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/freelancer/opportunities/:oppId/bids/:bidId/status', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN', 'EMPLOYEE'), (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['SHORTLISTED', 'ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid status is required' });
    }

    const result = store.updateBidStatus(req.params.oppId, req.params.bidId, status, req.user!.id);
    res.json({
      success: true,
      message: `Bid status updated to ${status}.`,
      bid: result.bid,
      opportunity: result.opportunity,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Freelancer Profiles Directory
apiRouter.get('/freelancer/profiles', (req: Request, res: Response) => {
  try {
    const { category, verifiedOnly } = req.query;
    const profiles = store.getFreelancerProfiles({
      category: category as string,
      verifiedOnly: verifiedOnly === 'true',
    });

    res.json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/freelancer/profiles/:id', (req: Request, res: Response) => {
  try {
    const profile = store.getFreelancerProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: `Freelancer profile not found: ${req.params.id}` });
    }
    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Referrals & Partner Sharing
apiRouter.get('/referrals', requireAuth, (req: Request, res: Response) => {
  try {
    const { referrerId, status } = req.query;
    const referrals = store.getReferrals({
      referrerId: referrerId as string,
      status: status as string,
    });

    res.json({
      success: true,
      count: referrals.length,
      referrals,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/referrals', requireAuth, (req: Request, res: Response) => {
  try {
    const parsed = CreateReferralInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for referral submission',
        details: parsed.error.format(),
      });
    }

    const referral = store.createReferral(parsed.data, {
      id: req.user!.id,
      name: req.user!.fullName,
      role: req.user!.role,
    });

    res.status(201).json({
      success: true,
      message: `Referral registered with Tracking Code ${referral.referralCode}.`,
      referral,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/referrals/:id/status', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updated = store.updateReferralStatus(req.params.id, status, req.user!.id);
    res.json({
      success: true,
      message: `Referral ${updated.referralCode} status changed to ${status}.`,
      referral: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 7. Partner Wallet & Ledger
apiRouter.get('/partner/ledger/:partnerId', requireAuth, (req: Request, res: Response) => {
  try {
    const ledger = store.getPartnerLedger(req.params.partnerId);
    res.json({
      success: true,
      ledger,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Commercial & Financial Analytics
apiRouter.get('/commercial/analytics', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), (req: Request, res: Response) => {
  try {
    const analytics = store.getCommercialAnalytics();
    res.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
