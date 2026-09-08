import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageContainer } from '../components/ui/PageContainer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { APP_CONFIG } from '../lib/constants';
import { 
  Send, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  FileText,
  Building,
  UserCheck
} from 'lucide-react';

const requirementSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name (minimum 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid contact phone number'),
  projectCity: z.string().min(2, 'Please specify the project location city'),
  servicePillar: z.string().min(1, 'Please select a primary service category or pillar'),
  projectStage: z.string().min(1, 'Please select current project status'),
  projectNotes: z.string().min(10, 'Please provide brief details about your project scope (minimum 10 characters)'),
});

type RequirementFormValues = z.infer<typeof requirementSchema>;

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'requirement';
  const preselectedPillar = searchParams.get('pillar') || '';
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedCaseId, setGeneratedCaseId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      projectCity: '',
      servicePillar: preselectedPillar || 'construction-services',
      projectStage: 'planning',
      projectNotes: '',
    },
  });

  const onSubmit = async (data: RequirementFormValues) => {
    // Phase 1 UI simulation
    await new Promise((resolve) => setTimeout(resolve, 800));
    const randomCaseNum = Math.floor(1000 + Math.random() * 9000);
    const mockCaseId = `BEG-CASE-${new Date().getFullYear()}-${randomCaseNum}`;
    setGeneratedCaseId(mockCaseId);
    setIsSubmitted(true);
  };

  const pillarOptions = [
    { value: 'construction-services', label: 'Pillar 01: Construction-related Services & MEP' },
    { value: 'surveillance-site-tech', label: 'Pillar 02: Surveillance & Site Technology' },
    { value: 'land-property-assistance', label: 'Pillar 03: Land & Property Assistance (GIS / Contour)' },
    { value: 'consultant-departments', label: 'Pillar 04: Consultant for Specific Department' },
    { value: 'innovation-startups', label: 'Pillar 05: Innovation & Startup Products' },
    { value: 'boq-estimation', label: 'Specialized: BOQ Normalization & Cost Estimation' },
    { value: 'solar-microgrid', label: 'Specialized: Solar PV & Microgrid Sizing' },
  ];

  const stageOptions = [
    { value: 'planning', label: 'Early Concept & Planning' },
    { value: 'land-acquisition', label: 'Land Acquired / Due Diligence Stage' },
    { value: 'architectural-design', label: 'Architectural Drawings in Progress' },
    { value: 'tendering', label: 'BOQ & Contractor Tendering Stage' },
    { value: 'active-site', label: 'Active Construction on Site' },
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16">
      <PageContainer>
        
        {/* Header Intro */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md">
              {mode === 'consultant-onboarding'
                ? 'Consultant Empanelment Desk'
                : mode === 'startup-gateway'
                ? 'Innovation Gateway'
                : 'Requirement Intake & Case Generation'}
            </Badge>
            <span className="text-xs font-mono-code text-[var(--color-brand-brown)]">
              Phase 1 Form Foundation
            </span>
          </div>
          <h1 className="text-h1 text-[var(--color-text)]">
            {mode === 'consultant-onboarding'
              ? 'Apply for Independent Empanelment'
              : mode === 'startup-gateway'
              ? 'Submit Climate-Tech Solution'
              : 'Submit Your Project Requirement'}
          </h1>
          <p className="text-body-large text-[var(--color-text-muted)] leading-relaxed">
            Structure your project requirement with zero sales bias. A BuildEcoGroup coordinator will organize your parameters into a standardized Case Specification.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-6">
          
          {/* Left Column: The Form */}
          <div className="lg:col-span-7">
            <Card variant="default" className="p-6 sm:p-8">
              
              {isSubmitted ? (
                <div className="text-center py-10 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#EAF6EE] text-[#1B7340] flex items-center justify-center mx-auto border border-[#C2E7CE]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[var(--color-text)]">
                      Requirement Structured Successfully!
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                      Your inputs have been compiled into a preliminary Case File. A coordinator will review technical bounds and reach out.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#EAF4F8] border border-[#C6DEE8] max-w-xs mx-auto">
                    <span className="text-[10px] font-mono-code uppercase font-bold text-[var(--color-brand-brown)] block">
                      Generated Case Reference ID
                    </span>
                    <span className="text-base font-extrabold font-mono-code text-[#071C27] block mt-1">
                      {generatedCaseId}
                    </span>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsSubmitted(false);
                        reset();
                      }}
                    >
                      Submit Another Requirement
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name / Representative"
                      placeholder="e.g. Anand Sharma"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@organization.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Phone Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />

                    <Input
                      label="Project Location (City / Region)"
                      placeholder="e.g. Bengaluru, Karnataka"
                      error={errors.projectCity?.message}
                      {...register('projectCity')}
                    />
                  </div>

                  <Select
                    label="Primary Service Vertical / Pillar"
                    options={pillarOptions}
                    error={errors.servicePillar?.message}
                    {...register('servicePillar')}
                  />

                  <Select
                    label="Current Project Stage"
                    options={stageOptions}
                    error={errors.projectStage?.message}
                    {...register('projectStage')}
                  />

                  <Textarea
                    label="Project Scope Summary & Technical Priorities"
                    placeholder="Describe your parcel area, proposed building typology, target dates, or specific engineering challenges..."
                    rows={4}
                    error={errors.projectNotes?.message}
                    helperText="Your notes remain confidential and will only be shared with assigned coordinators."
                    {...register('projectNotes')}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={isSubmitting}
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      Generate Structured Case ID
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] justify-center pt-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>Protected by BuildEcoGroup Confidentiality Standard</span>
                  </div>

                </form>
              )}

            </Card>
          </div>

          {/* Right Column: Platform Contacts & Office Hubs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Coordinator Contacts */}
            <Card variant="surface" className="p-6 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">
                Direct Coordination Desk
              </h4>
              <div className="space-y-3 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[var(--color-text-subtle)] block text-[10px]">Email Inquiries</span>
                    <span className="font-semibold text-[var(--color-text)]">{APP_CONFIG.contactEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[var(--color-text-subtle)] block text-[10px]">Orchestration Helpline</span>
                    <span className="font-semibold text-[var(--color-text)]">{APP_CONFIG.supportPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-brand-brown)] mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[var(--color-text-subtle)] block text-[10px]">Coordination Hubs</span>
                    <span className="font-semibold text-[var(--color-text)]">{APP_CONFIG.officeLocations.join(' • ')}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Workflow Guarantee Note */}
            <Card variant="default" className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                <ShieldCheck className="w-4 h-4" />
                <span>Next Steps After Submission</span>
              </div>
              <ol className="space-y-2 text-xs text-[var(--color-text-muted)] list-decimal list-inside leading-relaxed">
                <li>Your requirement receives a permanent Case ID.</li>
                <li>An orchestration coordinator reviews location & regulatory constraints.</li>
                <li>Qualified independent specialists receive blinded scopes.</li>
                <li>You receive transparent, itemized BOQ comparison matrices.</li>
              </ol>
            </Card>

          </div>

        </div>

      </PageContainer>
    </div>
  );
};
