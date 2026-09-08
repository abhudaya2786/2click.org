import { z } from 'zod';

export type UserRole = 'CUSTOMER' | 'CONSULTANT' | 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN' | 'VENDOR';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface SafeUser {
  id: string;
  firebaseUid?: string | null;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  mustChangePassword?: boolean;
  profile?: {
    organization?: string | null;
    designation?: string | null;
    city?: string | null;
    stateRegion?: string | null;
    avatarUrl?: string | null;
    stakeholderType?: 'CLIENT' | 'CONSULTANT' | 'CONTRACTOR' | 'PARTNER' | null;
    projectScale?: string | null;
    primaryPurpose?: string | null;
    projectStage?: string | null;
    budgetRange?: string | null;
    preferredLanguage?: string | null;
    country?: string | null;
    website?: string | null;
    licenseNumber?: string | null;
    gstin?: string | null;
    experienceYears?: string | null;
    serviceArea?: string | null;
    referralSource?: string | null;
    pincode?: string | null;
    district?: string | null;
    interests?: string[] | null;
  } | null;
}

export type Permission =
  | 'case:create'
  | 'case:read:own'
  | 'case:read:assigned'
  | 'case:read:any'
  | 'case:update:own'
  | 'case:update:assigned'
  | 'consultant:profile:update:own'
  | 'consultant:verify'
  | 'project:read:own'
  | 'project:read:assigned'
  | 'project:read:any'
  | 'admin:operations'
  | 'admin:users'
  | 'admin:assignments'
  | 'superadmin:platform';

/** Normalize Indian mobile to +91XXXXXXXXXX when possible. */
export function normalizeIndianMobile(value: string): string {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    return `+91${digits.slice(1)}`;
  }
  return digits ? `+${digits}` : '';
}

export const indianMobileSchema = z
  .string()
  .min(8, 'Valid Indian mobile number is required')
  .transform((value) => normalizeIndianMobile(value))
  .refine((value) => /^\+91[6-9]\d{9}$/.test(value), {
    message: 'Enter a valid 10-digit Indian mobile number starting with 6–9',
  });

export const CustomerRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(120),
  email: z.string().email('Please enter a valid email address').transform((v) => v.trim().toLowerCase()),
  password: z.string().optional().default(''),
  confirmPassword: z.string().optional().default(''),
  phone: indianMobileSchema,
  pincode: z
    .string()
    .transform((value) => value.replace(/\D/g, '').slice(0, 6))
    .pipe(z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Indian pincode')),
  city: z.string().min(2, 'City is required'),
  district: z.string().optional().default(''),
  stateRegion: z.string().min(2, 'State / Region is required'),
  country: z.string().min(2).default('India'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the BuildEcoGroup Terms of Service and Privacy Policy',
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Privacy Policy and consent to account data processing',
  }),
  idToken: z.string().optional(),
  // Public registration must never accept a privileged role from the client.
  role: z.any().optional(),
}).superRefine((data, ctx) => {
  const isGoogleOrTokenOnly = Boolean(data.idToken) && !data.password;
  if (isGoogleOrTokenOnly) return;

  if (data.password.length < 8) {
    ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must be at least 8 characters' });
  }
  if (!/[A-Z]/.test(data.password)) {
    ctx.addIssue({ code: 'custom', path: ['password'], message: 'Must contain at least one uppercase letter' });
  }
  if (!/[0-9]/.test(data.password)) {
    ctx.addIssue({ code: 'custom', path: ['password'], message: 'Must contain at least one number' });
  }
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: "Passwords don't match" });
  }
});

export type CustomerRegistrationInput = z.infer<typeof CustomerRegistrationSchema>;

export const LoginCredentialsSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password is required'),
  rememberMe: z.boolean().default(false),
  idToken: z.string().optional(),
});

export type LoginCredentialsInput = z.infer<typeof LoginCredentialsSchema>;

export const RoleAssignmentSchema = z.object({
  targetUserId: z.string().min(1, 'Valid user ID is required'),
  newRole: z.enum(['CUSTOMER', 'CONSULTANT', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'VENDOR']),
  reason: z.string().min(3, 'Audit justification reason is required'),
});

export type RoleAssignmentInput = z.infer<typeof RoleAssignmentSchema>;

export const StatusUpdateSchema = z.object({
  targetUserId: z.string().min(1, 'Valid user ID is required'),
  newStatus: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED']),
  reason: z.string().min(3, 'Audit justification reason is required'),
});

export type StatusUpdateInput = z.infer<typeof StatusUpdateSchema>;

export function formatZodFieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

export function firstZodFieldMessage(error: z.ZodError): string {
  const flat = error.flatten();
  const fieldEntries = Object.entries(flat.fieldErrors);
  for (const [, messages] of fieldEntries) {
    if (messages && messages[0]) return messages[0];
  }
  return flat.formErrors[0] || 'Invalid registration details';
}
