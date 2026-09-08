import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  UploadCloud, 
  Compass, 
  Sparkles,
  Zap,
  Check,
  FileCheck,
  Download,
  Eye,
  AlertCircle,
  HardHat,
  Camera,
  Sun,
  Droplets,
  Trash2,
  Phone,
  Mail,
  Wrench,
  Flame,
  Home,
  Clock,
  Send,
  HelpCircle,
  Copy,
  ChevronRight,
  Globe,
  Users,
  FileSpreadsheet,
  Plus,
  MessageSquare
} from 'lucide-react';
import { ServiceRegistryIcon } from '../ui/AppIcon';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { QueryCategory, CustomerQueryRecord, FormAttachment } from '../../types/forms';
import { createCaseApi } from '../../lib/api';
import { buildCaseIntakeFromDynamicForm } from '../../lib/caseIntakeMapper';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/routes';
import { Link, useNavigate } from 'react-router-dom';
import { SERVICES_CATALOG, getServiceById, ServiceDefinition } from '../../lib/servicesRegistry';

interface DynamicQueryFormProps {
  initialCategory?: QueryCategory;
  initialServiceId?: string;
  defaultObjective?: string;
  onSuccess?: (query: any) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const DynamicQueryForm: React.FC<DynamicQueryFormProps> = ({
  initialCategory,
  initialServiceId,
  defaultObjective,
  onSuccess,
  onCancel,
  isModal = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Determine initial service definition
  const getInitialService = (): ServiceDefinition => {
    if (initialServiceId) {
      const found = getServiceById(initialServiceId);
      if (found) return found;
    }
    if (initialCategory) {
      const found = SERVICES_CATALOG.find(s => s.queryCategory === initialCategory);
      if (found) return found;
    }
    return SERVICES_CATALOG[0]; // Construction default
  };

  const [selectedService, setSelectedService] = useState<ServiceDefinition>(getInitialService);
  const [category, setCategory] = useState<QueryCategory>(selectedService.queryCategory);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdFormRecord, setCreatedFormRecord] = useState<{ id: string; title: string; assignedTo?: { name: string }; status: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Multi-service project bundle selections
  const [bundledServices, setBundledServices] = useState<string[]>([]);

  // Step 3 Contact & Location fields
  const [clientName, setClientName] = useState(user?.fullName || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [locationCity, setLocationCity] = useState((user as any)?.city || 'Lucknow');
  const [pincode, setPincode] = useState('226010');
  const [siteAddress, setSiteAddress] = useState('');
  const [targetTimeline, setTargetTimeline] = useState('Within 1-3 Months');
  const [preferredContact, setPreferredContact] = useState<'CALL' | 'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState<FormAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill logged in user
  useEffect(() => {
    if (user) {
      if (!clientName) setClientName(user.fullName);
      if (!clientEmail) setClientEmail(user.email);
      if (!clientPhone && user.phone) setClientPhone(user.phone);
      if ((user as any)?.city) setLocationCity((user as any).city);
    }
  }, [user]);

  // Sync category when selectedService changes
  const handleSelectService = (svc: ServiceDefinition) => {
    setSelectedService(svc);
    setCategory(svc.queryCategory);
  };

  // Toggle multi-service bundling
  const toggleBundledService = (serviceId: string) => {
    setBundledServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  // =========================================================================
  // SERVICE SPECIFIC FORM STATES
  // =========================================================================

  // 1. CONSTRUCTION
  const [constructionType, setConstructionType] = useState('New Construction (Turnkey / Core & Shell)');
  const [buildingType, setBuildingType] = useState('Residential Multi-Floor Villa');
  const [plotArea, setPlotArea] = useState('2,400 sq ft');
  const [builtUpArea, setBuiltUpArea] = useState('4,200 sq ft');
  const [floors, setFloors] = useState('G + 2 Floors');
  const [constBudget, setConstBudget] = useState('₹75 Lakhs - ₹1.2 Crore');
  const [currentStage, setCurrentStage] = useState('Plot Purchased, Need Drawings & BOQ');
  const [needArchitect, setNeedArchitect] = useState(true);
  const [needBOQ, setNeedBOQ] = useState(true);
  const [needContractor, setNeedContractor] = useState(true);
  const [needMaterials, setNeedMaterials] = useState(true);

  // 2. LAND
  const [landOwnership, setLandOwnership] = useState<'I Own Land' | 'Need Land / Looking to Buy'>('I Own Land');
  const [landArea, setLandArea] = useState('3.5 Acres (approx 1,52,000 sq ft)');
  const [landPurpose, setLandPurpose] = useState('Joint Venture (JV) / Township Development');
  const [landExpectedBudget, setLandExpectedBudget] = useState('₹8 - 12 Crores (GDV)');
  const [landRoadWidth, setLandRoadWidth] = useState('45 Feet Master Plan Road');
  const [landDocsAvailable, setLandDocsAvailable] = useState('Khatauni + Registry + 143 Order');
  const [landDescription, setLandDescription] = useState('Seeking best-use feasibility study, high-level FAR planning, joint development structuring, and vetted developer matchmaking.');

  // 3. SOLAR
  const [solarCustomerType, setSolarCustomerType] = useState('Commercial / Institutional');
  const [solarMonthlyBill, setSolarMonthlyBill] = useState('₹25,000 - ₹45,000 / month');
  const [solarRoofArea, setSolarRoofArea] = useState('1,500 sq ft shadow-free RCC roof');
  const [solarPlantType, setSolarPlantType] = useState('On-Grid (Net-Metering with DISCOM)');
  const [solarBatteryNeeded, setSolarBatteryNeeded] = useState(false);
  const [solarSubsidyNeeded, setSolarSubsidyNeeded] = useState(true);
  const [solarFinanceNeeded, setSolarFinanceNeeded] = useState(true);

  // 4. BOQ
  const [boqProjectType, setBoqProjectType] = useState('Residential Independent House / Villa');
  const [boqPlotBuiltUp, setBoqPlotBuiltUp] = useState('3,200 sq ft built-up area');
  const [boqQuality, setBoqQuality] = useState('Standard Premium (Grade-A TMT, AAC, Kohler/Jaquar)');
  const [boqScope, setBoqScope] = useState('Complete Turnkey BOQ (Civil + MEP + Finishes)');
  const [boqHasDrawings, setBoqHasDrawings] = useState('Yes, 2D Floor Plan & Elevations Ready');
  const [boqNeedQuotes, setBoqNeedQuotes] = useState(true);

  // 5. SURVEILLANCE & TECH
  const [cameraCount, setCameraCount] = useState('4 Solar 4G PTZ Cameras');
  const [survSiteType, setSurvSiteType] = useState('Active Construction Site (Unpowered)');
  const [survFeatures, setSurvFeatures] = useState('AI Boundary Intrusion + 24/7 Time-lapse Recording');
  const [survDuration, setSurvDuration] = useState('6-12 Months Construction Duration');

  // 6. WATER / STP
  const [waterSource, setWaterSource] = useState('Borewell + Rainwater Runoff');
  const [waterRequiredUse, setWaterRequiredUse] = useState('Drinking, Domestic & Landscaping Reuse');
  const [waterSystemType, setWaterSystemType] = useState('Sewage Treatment Plant (STP - MBBR / SBR)');
  const [waterDailyCapacity, setWaterDailyCapacity] = useState('50 KLD (50,000 Litres / day)');
  const [waterExistingSystem, setWaterExistingSystem] = useState('New Turnkey Installation & Commissioning');

  // 7. SOLID WASTE & OWC
  const [wasteSourceType, setWasteSourceType] = useState('Residential Township / Housing Society');
  const [wasteDailyQty, setWasteDailyQty] = useState('250 kg/day organic waste');
  const [wasteTreatmentType, setWasteTreatmentType] = useState('Automatic Organic Waste Composter (OWC)');

  // 8. MAINTENANCE & AMC
  const [facilityType, setFacilityType] = useState('Residential Society / Commercial Complex');
  const [maintScope, setMaintScope] = useState('Comprehensive Annual Maintenance Contract (AMC)');
  const [maintUrgency, setMaintUrgency] = useState('Standard AMC Setup');

  // 9. GIS & DRONE CONTOUR
  const [gisLandSize, setGisLandSize] = useState('5 to 15 Acres');
  const [gisRequiredOutput, setGisRequiredOutput] = useState('0.5m Contours + DGPS Boundary Pegging + DEM Model');

  // 10. INTERIORS
  const [interiorSpaceType, setInteriorSpaceType] = useState('3 BHK Villa / Premium Apartment');
  const [interiorScope, setInteriorScope] = useState('Complete Turnkey Interiors (Kitchen, Wardrobes, False Ceiling, Lighting)');
  const [interiorBudget, setInteriorBudget] = useState('₹12 - ₹20 Lakhs');

  // 11. CONSULTANTS & STRUCTURAL VETTING
  const [consultantDiscipline, setConsultantDiscipline] = useState('Structural Calculation STAAD Peer Review (IS 456 / IS 1893)');
  const [consultantDeliverable, setConsultantDeliverable] = useState('Formal Stability Certification with Vetted Rebar Details');

  // 12. MATERIAL PROCUREMENT
  const [materialItemTypes, setMaterialItemTypes] = useState('Primary Fe550D TMT Rebar + 53-Grade OPC Cement');
  const [materialEstimatedQty, setMaterialEstimatedQty] = useState('15 MT Steel + 600 Bags Cement');

  // 13. ELECTRICAL & PLUMBING
  const [elecServiceType, setElecServiceType] = useState('Complete Concealed Wiring + DB Panel + Earthing');
  const [plumbWorkType, setPlumbWorkType] = useState('New Concealed CPVC Piping & SWR Drainage');

  // Attachments handler
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: FormAttachment[] = Array.from(files).map((file, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type || 'document',
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }));
    setAttachments(prev => [...prev, ...newItems]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Compile full dynamic details payload
  const compileProjectDetails = () => {
    let specific: Record<string, any> = {};

    switch (selectedService.id) {
      case 'construction':
        specific = {
          constructionType,
          buildingType,
          plotArea,
          builtUpArea,
          floors,
          budget: constBudget,
          currentStage,
          servicesNeeded: {
            architect: needArchitect,
            boq: needBOQ,
            contractor: needContractor,
            materials: needMaterials,
          }
        };
        break;
      case 'land':
        specific = {
          ownership: landOwnership,
          landArea,
          purpose: landPurpose,
          expectedBudget: landExpectedBudget,
          roadWidth: landRoadWidth,
          hasDocuments: landDocsAvailable,
          description: landDescription,
        };
        break;
      case 'solar':
        specific = {
          customerType: solarCustomerType,
          monthlyBill: solarMonthlyBill,
          roofArea: solarRoofArea,
          plantType: solarPlantType,
          batteryNeeded: solarBatteryNeeded,
          subsidyAssistance: solarSubsidyNeeded,
          financeAssistance: solarFinanceNeeded,
        };
        break;
      case 'boq':
        specific = {
          projectType: boqProjectType,
          plotBuiltUpArea: boqPlotBuiltUp,
          qualityTier: boqQuality,
          boqScope,
          hasDrawings: boqHasDrawings,
          needSupplierQuotes: boqNeedQuotes,
        };
        break;
      case 'surveillance':
        specific = {
          cameraCount,
          siteType: survSiteType,
          features: survFeatures,
          duration: survDuration,
        };
        break;
      case 'water':
        specific = {
          waterSource,
          requiredUse: waterRequiredUse,
          systemType: waterSystemType,
          dailyCapacity: waterDailyCapacity,
          existingSystem: waterExistingSystem,
        };
        break;
      case 'waste':
        specific = {
          sourceType: wasteSourceType,
          dailyQuantity: wasteDailyQty,
          treatmentType: wasteTreatmentType,
        };
        break;
      case 'maintenance':
        specific = {
          facilityType,
          scope: maintScope,
          urgency: maintUrgency,
        };
        break;
      case 'gis':
        specific = {
          landSize: gisLandSize,
          requiredOutput: gisRequiredOutput,
        };
        break;
      case 'interior':
        specific = {
          spaceType: interiorSpaceType,
          scope: interiorScope,
          budget: interiorBudget,
        };
        break;
      case 'consultants':
        specific = {
          discipline: consultantDiscipline,
          deliverable: consultantDeliverable,
        };
        break;
      case 'material':
        specific = {
          materialTypes: materialItemTypes,
          estimatedQuantity: materialEstimatedQty,
        };
        break;
      default:
        specific = {
          service: selectedService.title,
          category,
        };
    }

    return {
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      categoryGroup: selectedService.categoryGroupLabel,
      assignedDesk: selectedService.assignedDesk,
      standards: selectedService.standards,
      bundledServices: bundledServices.map(id => {
        const found = getServiceById(id);
        return found ? found.title : id;
      }),
      targetTimeline,
      siteAddress,
      ...specific,
    };
  };

  const getFormTitle = () => {
    if (defaultObjective) return defaultObjective;
    switch (selectedService.id) {
      case 'construction':
        return `${buildingType} Construction (${floors}) • ${locationCity}`;
      case 'land':
        return `${landOwnership} • ${landArea} • ${landPurpose}`;
      case 'solar':
        return `Solar Microgrid (${solarPlantType}) • ${locationCity}`;
      case 'boq':
        return `Normalized BOQ Estimation • ${boqProjectType}`;
      case 'surveillance':
        return `Autonomous Site Surveillance (${cameraCount}) • ${locationCity}`;
      case 'water':
        return `${waterSystemType} (${waterDailyCapacity}) • ${locationCity}`;
      case 'waste':
        return `Zero-Waste Composting (${wasteTreatmentType})`;
      case 'maintenance':
        return `${facilityType} Maintenance AMC • ${locationCity}`;
      case 'gis':
        return `GIS Contouring & Drone Photogrammetry (${gisLandSize})`;
      case 'interior':
        return `Turnkey Interiors • ${interiorSpaceType}`;
      case 'consultants':
        return `Consultant Vetting • ${consultantDiscipline}`;
      case 'material':
        return `Bulk Material Procurement (${materialItemTypes})`;
      default:
        return `${selectedService.title} Requirement in ${locationCity}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const details = compileProjectDetails();
      const title = getFormTitle();

      const intake = buildCaseIntakeFromDynamicForm({
        selectedService,
        title,
        details,
        clientName,
        clientEmail,
        clientPhone,
        locationCity,
        pincode,
        siteAddress,
        targetTimeline,
        preferredContact,
        attachments,
        bundledServices,
      });

      const result = await createCaseApi(intake);

      const record = {
        id: result.caseReference,
        caseId: result.caseId,
        title,
        status: result.status,
        assignedTo: {
          name: selectedService.assignedDesk,
        },
      };

      setCreatedFormRecord(record);
      setStep(4);
      if (onSuccess) onSuccess(record);
    } catch (err: any) {
      console.error('Error submitting project requirement:', err);
      setSubmitError(err?.message || 'Failed to submit requirement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRecordId = () => {
    if (!createdFormRecord) return;
    navigator.clipboard.writeText(createdFormRecord.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-xs overflow-hidden'}`}>
      
      {/* 4-Step Progress Header */}
      <div className="bg-[var(--color-background)] px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              1
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 1 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              Service
            </span>
          </div>

          <div className="h-[2px] w-6 sm:w-12 bg-[#D6E8F0]" />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 2 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              2
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 2 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              Scope Details
            </span>
          </div>

          <div className="h-[2px] w-6 sm:w-12 bg-[#D6E8F0]" />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 3 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              3
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 3 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              Site & Contact
            </span>
          </div>

          <div className="h-[2px] w-6 sm:w-12 bg-[#D6E8F0]" />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === 4 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              4
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 4 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              Confirmation
            </span>
          </div>

        </div>
      </div>

      <div className="p-6 sm:p-8">
        
        {/* ========================================================================= */}
        {/* STEP 1: SELECT PRIMARY SERVICE & OPTIONAL ADD-ONS */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  BuildEcoGroup Service Integration
                </Badge>
                <span className="text-xs font-semibold text-[var(--color-brand-brown)]">
                  Unified Project Intake
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--color-text)] tracking-tight">
                Select Your Primary Project Service
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                Start a requirement under any specialized discipline. Every service is backed by verified specialists, transparent BOQ metrics, and direct desk allocation.
              </p>
            </div>

            {/* Service Grid Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SERVICES_CATALOG.map((svc) => {
                const isSelected = selectedService.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleSelectService(svc)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 relative group ${
                      isSelected
                        ? 'bg-[var(--color-surface-muted)] border-[#1697C4] shadow-xs ring-1 ring-[#1697C4]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[#1697C4]/40 hover:bg-[var(--color-background)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-primary)] shadow-2xs group-hover:scale-105 transition-transform">
                        <ServiceRegistryIcon iconName={svc.iconName} size="md" />
                      </div>

                      {svc.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[#D6E8F0]/60 px-2 py-0.5 rounded-md">
                          Core Pillar
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[var(--color-text)] flex items-center justify-between">
                        <span>{svc.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] leading-snug mt-1 line-clamp-2">
                        {svc.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between text-[11px] font-medium text-[#7A837C]">
                      <span>{svc.turnaroundSLA}</span>
                      <span className="text-[var(--color-brand-brown)] font-semibold">{svc.categoryGroupLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Service Add-on Bundle Selector */}
            <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-bold text-[var(--color-text)]">
                    Add Complementary Services to this Project (Optional Bundle)
                  </span>
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  Bundled under single Case & Trackable ID
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {SERVICES_CATALOG.filter(s => s.id !== selectedService.id).map(addon => {
                  const isBundled = bundledServices.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleBundledService(addon.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isBundled
                          ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[#1697C4]'
                      }`}
                    >
                      {isBundled ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{addon.shortTitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
              {onCancel ? (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              ) : (
                <div />
              )}
              <Button
                variant="primary"
                size="md"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to {selectedService.shortTitle} Scope
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DYNAMIC SERVICE SPECIFIC DETAILS */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
              <div>
                <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                  Step 2 of 4 • {selectedService.title} Scope
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mt-0.5">
                  Specify your project parameters
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline self-start sm:self-auto"
              >
                ← Switch Service ({selectedService.shortTitle})
              </button>
            </div>

            {/* Quick Service Deliverables Banner */}
            <div className="p-3.5 bg-[var(--color-surface-muted)] rounded-2xl border border-[#D5E2D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Assigned Desk: {selectedService.assignedDesk}</span>
                </div>
                <div className="text-[var(--color-text-muted)]">
                  Governed under standard: <span className="font-semibold text-[var(--color-text)]">{selectedService.standards}</span>
                </div>
              </div>
              <div className="text-right sm:border-l sm:border-[#D5E2D2] sm:pl-4 text-[11px] text-[#7A837C]">
                Turnaround: <span className="font-bold text-[var(--color-primary)]">{selectedService.turnaroundSLA}</span>
              </div>
            </div>

            {/* 1. CONSTRUCTION SCOPE */}
            {selectedService.id === 'construction' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Construction Scope
                  </label>
                  <select
                    value={constructionType}
                    onChange={(e) => setConstructionType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="New Construction (Turnkey / Core & Shell)">New Construction (Turnkey / Core & Shell)</option>
                    <option value="Major Renovation / Structural Remodeling">Major Renovation / Structural Remodeling</option>
                    <option value="Floor Addition / Vertical Expansion">Floor Addition / Vertical Expansion</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Building Typology
                  </label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Residential Multi-Floor Villa">Residential Multi-Floor Villa</option>
                    <option value="Independent Bungalow / House">Independent Bungalow / House</option>
                    <option value="Commercial Office / Retail Complex">Commercial Office / Retail Complex</option>
                    <option value="Industrial Shed / Warehouse">Industrial Shed / Warehouse</option>
                    <option value="Institutional / Hospital / School">Institutional / Hospital / School</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Plot Area (Sq Ft)
                  </label>
                  <input
                    type="text"
                    value={plotArea}
                    onChange={(e) => setPlotArea(e.target.value)}
                    placeholder="e.g. 2,400 sq ft"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Built-up Area & Number of Floors
                  </label>
                  <input
                    type="text"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(e.target.value)}
                    placeholder="e.g. 4,200 sq ft (G+2 Floors)"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Estimated Budget Range
                  </label>
                  <input
                    type="text"
                    value={constBudget}
                    onChange={(e) => setConstBudget(e.target.value)}
                    placeholder="e.g. ₹75 Lakhs - ₹1.2 Crore"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Current Stage
                  </label>
                  <select
                    value={currentStage}
                    onChange={(e) => setCurrentStage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Plot Purchased, Need Drawings & BOQ">Plot Purchased, Need Drawings & BOQ</option>
                    <option value="Drawings Ready, Need Contractor Tender">Drawings Ready, Need Contractor Tender</option>
                    <option value="Ongoing Construction, Need Milestone Supervision">Ongoing Construction, Need Milestone Supervision</option>
                  </select>
                </div>

                <div className="sm:col-span-2 p-3.5 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] space-y-2">
                  <div className="font-bold text-[var(--color-text)]">Services Needed from BuildEcoGroup Network:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needArchitect}
                        onChange={(e) => setNeedArchitect(e.target.checked)}
                        className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                      />
                      <span>CoA Architect</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needBOQ}
                        onChange={(e) => setNeedBOQ(e.target.checked)}
                        className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                      />
                      <span>Normalized BOQ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needContractor}
                        onChange={(e) => setNeedContractor(e.target.checked)}
                        className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                      />
                      <span>Vetted Contractor</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needMaterials}
                        onChange={(e) => setNeedMaterials(e.target.checked)}
                        className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                      />
                      <span>Factory Materials</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LAND SCOPE */}
            {selectedService.id === 'land' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Land Ownership Status
                  </label>
                  <select
                    value={landOwnership}
                    onChange={(e) => setLandOwnership(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="I Own Land">I Own Land (Landowner / Representative)</option>
                    <option value="Need Land / Looking to Buy">Need Land / Looking to Buy (Investor / Developer)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Land Area (Acres / Sq Ft / Bigha)
                  </label>
                  <input
                    type="text"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder="e.g. 3.5 Acres or 25,000 sq ft"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Primary Purpose / Development Model
                  </label>
                  <select
                    value={landPurpose}
                    onChange={(e) => setLandPurpose(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Joint Venture (JV) / Township Development">Joint Venture (JV) / Township Development</option>
                    <option value="Outright Sale">Outright Sale</option>
                    <option value="Long-term Commercial Lease">Long-term Commercial Lease</option>
                    <option value="Master Planning & Plotted Layout">Master Planning & Plotted Layout</option>
                    <option value="Zoning 143/CLU & Title Clearance">Zoning 143/CLU & Title Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Road Access Width
                  </label>
                  <input
                    type="text"
                    value={landRoadWidth}
                    onChange={(e) => setLandRoadWidth(e.target.value)}
                    placeholder="e.g. 45 Feet Master Plan Sector Road"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Expected GDV / Monetization Target
                  </label>
                  <input
                    type="text"
                    value={landExpectedBudget}
                    onChange={(e) => setLandExpectedBudget(e.target.value)}
                    placeholder="e.g. ₹8 - 12 Crores"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Available Legal Documents
                  </label>
                  <input
                    type="text"
                    value={landDocsAvailable}
                    onChange={(e) => setLandDocsAvailable(e.target.value)}
                    placeholder="e.g. Khatauni, Registry, 143 Order, Survey Map"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Project Vision / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={landDescription}
                    onChange={(e) => setLandDescription(e.target.value)}
                    placeholder="Provide land coordinates, proximity to highways, or developer matchmaking notes..."
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 3. SOLAR SCOPE */}
            {selectedService.id === 'solar' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Establishment Type</label>
                  <select
                    value={solarCustomerType}
                    onChange={(e) => setSolarCustomerType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Residential House / Villa">Residential House / Villa</option>
                    <option value="Commercial / Hospital / Hotel">Commercial / Hospital / Hotel</option>
                    <option value="Industrial Factory / Warehouse">Industrial Factory / Warehouse</option>
                    <option value="Agricultural Solar Pump">Agricultural Solar Pump</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Average Monthly Electricity Bill</label>
                  <input
                    type="text"
                    value={solarMonthlyBill}
                    onChange={(e) => setSolarMonthlyBill(e.target.value)}
                    placeholder="e.g. ₹25,000 / month"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Shadow-Free Roof / Ground Area</label>
                  <input
                    type="text"
                    value={solarRoofArea}
                    onChange={(e) => setSolarRoofArea(e.target.value)}
                    placeholder="e.g. 1,500 sq ft RCC roof"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Plant Architecture</label>
                  <select
                    value={solarPlantType}
                    onChange={(e) => setSolarPlantType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="On-Grid (Net-Metering with DISCOM)">On-Grid (Net-Metering with DISCOM)</option>
                    <option value="Hybrid (Grid + Lithium Battery Storage)">Hybrid (Grid + Lithium Battery Storage)</option>
                    <option value="Off-Grid Standalone">Off-Grid Standalone</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={solarSubsidyNeeded}
                      onChange={(e) => setSolarSubsidyNeeded(e.target.checked)}
                      className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                    />
                    <span>PM Surya Ghar + UP NEDA Subsidy Processing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={solarFinanceNeeded}
                      onChange={(e) => setSolarFinanceNeeded(e.target.checked)}
                      className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                    />
                    <span>Solar Green Loan / Zero-Down EMI</span>
                  </label>
                </div>
              </div>
            )}

            {/* 4. BOQ SCOPE */}
            {selectedService.id === 'boq' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Project Typology</label>
                  <input
                    type="text"
                    value={boqProjectType}
                    onChange={(e) => setBoqProjectType(e.target.value)}
                    placeholder="e.g. Luxury Villa, Commercial Complex"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Built-up Area</label>
                  <input
                    type="text"
                    value={boqPlotBuiltUp}
                    onChange={(e) => setBoqPlotBuiltUp(e.target.value)}
                    placeholder="e.g. 3,200 sq ft built-up area"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Specification Quality Tier</label>
                  <select
                    value={boqQuality}
                    onChange={(e) => setBoqQuality(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Standard Premium (Grade-A TMT, AAC, Kohler/Jaquar)">Standard Premium (Grade-A TMT, AAC, Kohler/Jaquar)</option>
                    <option value="Economy (CPWD / Basic Benchmark)">Economy (CPWD / Basic Benchmark)</option>
                    <option value="Ultra Luxury (Italian Marble, Mass Timber, Automation)">Ultra Luxury (Italian Marble, Mass Timber, Automation)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">BOQ Scope Schedule</label>
                  <select
                    value={boqScope}
                    onChange={(e) => setBoqScope(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Complete Turnkey BOQ (Civil + MEP + Finishes)">Complete Turnkey BOQ (Civil + MEP + Finishes)</option>
                    <option value="Civil Structure & Foundation Only">Civil Structure & Foundation Only</option>
                    <option value="MEP & Plumbing BOQ Only">MEP & Plumbing BOQ Only</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]">
                    <input
                      type="checkbox"
                      checked={boqNeedQuotes}
                      onChange={(e) => setBoqNeedQuotes(e.target.checked)}
                      className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                    />
                    <span className="font-bold text-[var(--color-text)]">
                      Auto-generate competitive supplier quotes from verified brands for steel, cement & bricks
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* 5. SURVEILLANCE SCOPE */}
            {selectedService.id === 'surveillance' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Camera Unit Count</label>
                  <select
                    value={cameraCount}
                    onChange={(e) => setCameraCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="2 Solar 4G PTZ Cameras (Small Plot / Villa)">2 Solar 4G PTZ Cameras (Small Plot / Villa)</option>
                    <option value="4 Solar 4G PTZ Cameras (Multi-Storey Site)">4 Solar 4G PTZ Cameras (Multi-Storey Site)</option>
                    <option value="8+ Multi-Node Autonomous Network (Township)">8+ Multi-Node Autonomous Network (Township)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Site Power & Connectivity</label>
                  <select
                    value={survSiteType}
                    onChange={(e) => setSurvSiteType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Active Construction Site (Unpowered - Solar 4G Required)">Active Construction Site (Unpowered - Solar 4G Required)</option>
                    <option value="Site with Grid Power Available">Site with Grid Power Available</option>
                    <option value="Remote Open Land / Boundary">Remote Open Land / Boundary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Intelligence Features</label>
                  <input
                    type="text"
                    value={survFeatures}
                    onChange={(e) => setSurvFeatures(e.target.value)}
                    placeholder="e.g. AI Perimeter Tripwire + Daily Time-lapse"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Deployment Duration</label>
                  <select
                    value={survDuration}
                    onChange={(e) => setSurvDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="6-12 Months Construction Duration">6-12 Months Construction Duration</option>
                    <option value="3-6 Months Project Phase">3-6 Months Project Phase</option>
                    <option value="Permanent Ownership Installation">Permanent Ownership Installation</option>
                  </select>
                </div>
              </div>
            )}

            {/* 6. WATER / STP SCOPE */}
            {selectedService.id === 'water' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Required System</label>
                  <select
                    value={waterSystemType}
                    onChange={(e) => setWaterSystemType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Sewage Treatment Plant (STP - MBBR / SBR)">Sewage Treatment Plant (STP - MBBR / SBR)</option>
                    <option value="Effluent Treatment Plant (ETP - Industrial)">Effluent Treatment Plant (ETP - Industrial)</option>
                    <option value="Rooftop Rainwater Harvesting & Recharge Well">Rooftop Rainwater Harvesting & Recharge Well</option>
                    <option value="Water Treatment Plant (WTP / Softener)">Water Treatment Plant (WTP / Softener)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Daily Capacity (KLD / Litres)</label>
                  <input
                    type="text"
                    value={waterDailyCapacity}
                    onChange={(e) => setWaterDailyCapacity(e.target.value)}
                    placeholder="e.g. 50 KLD (50,000 Litres / day)"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Water Source</label>
                  <input
                    type="text"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    placeholder="e.g. Domestic Sewage, Borewell, Drain"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Execution Model</label>
                  <select
                    value={waterExistingSystem}
                    onChange={(e) => setWaterExistingSystem(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="New Turnkey Installation & Commissioning">New Turnkey Installation & Commissioning</option>
                    <option value="Retrofit / Upgrade of Existing Plant">Retrofit / Upgrade of Existing Plant</option>
                    <option value="Annual Maintenance Contract (AMC) & Operator">Annual Maintenance Contract (AMC) & Operator</option>
                  </select>
                </div>
              </div>
            )}

            {/* 7. SOLID WASTE & OWC */}
            {selectedService.id === 'waste' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Establishment Source</label>
                  <input
                    type="text"
                    value={wasteSourceType}
                    onChange={(e) => setWasteSourceType(e.target.value)}
                    placeholder="e.g. 200-Unit Residential Society, Hotel"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Estimated Daily Organic Waste</label>
                  <input
                    type="text"
                    value={wasteDailyQty}
                    onChange={(e) => setWasteDailyQty(e.target.value)}
                    placeholder="e.g. 250 kg / day"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[var(--color-text)] mb-1">Processing Technology</label>
                  <select
                    value={wasteTreatmentType}
                    onChange={(e) => setWasteTreatmentType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Automatic Organic Waste Composter (OWC 24-hr cycle)">Automatic Organic Waste Composter (OWC 24-hr cycle)</option>
                    <option value="Decentralized Bio-Bins with Aerobic Curing">Decentralized Bio-Bins with Aerobic Curing</option>
                    <option value="Zero-Landfill Comprehensive Facility Strategy">Zero-Landfill Comprehensive Facility Strategy</option>
                  </select>
                </div>
              </div>
            )}

            {/* 8. MAINTENANCE & AMC */}
            {selectedService.id === 'maintenance' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Facility Type</label>
                  <input
                    type="text"
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    placeholder="e.g. Residential Society, Hospital, Office"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">AMC Scope</label>
                  <select
                    value={maintScope}
                    onChange={(e) => setMaintScope(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Comprehensive Annual Maintenance Contract (MEP + Pumps + DG)">Comprehensive Annual Maintenance Contract (MEP + Pumps + DG)</option>
                    <option value="Submersible Pump & Hydro-Pneumatic Room AMC">Submersible Pump & Hydro-Pneumatic Room AMC</option>
                    <option value="DG Set & Electrical DB Panel Preventive Care">DG Set & Electrical DB Panel Preventive Care</option>
                    <option value="Waterproofing & Structural Health Audit">Waterproofing & Structural Health Audit</option>
                  </select>
                </div>
              </div>
            )}

            {/* 9. GIS & DRONE */}
            {selectedService.id === 'gis' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Land Size / Parcel Extent</label>
                  <input
                    type="text"
                    value={gisLandSize}
                    onChange={(e) => setGisLandSize(e.target.value)}
                    placeholder="e.g. 10 Acres"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Required Survey Outputs</label>
                  <select
                    value={gisRequiredOutput}
                    onChange={(e) => setGisRequiredOutput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="0.5m Contours + DGPS Boundary Pegging + DEM Model">0.5m Contours + DGPS Boundary Pegging + DEM Model</option>
                    <option value="Cut & Fill Earthwork Volume Matrix">Cut & Fill Earthwork Volume Matrix</option>
                    <option value="Khasra Cadastral GIS Overlay">Khasra Cadastral GIS Overlay</option>
                  </select>
                </div>
              </div>
            )}

            {/* 10. INTERIORS */}
            {selectedService.id === 'interior' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Property Type</label>
                  <input
                    type="text"
                    value={interiorSpaceType}
                    onChange={(e) => setInteriorSpaceType(e.target.value)}
                    placeholder="e.g. 3 BHK Villa, Luxury Penthouse, Office"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    value={interiorBudget}
                    onChange={(e) => setInteriorBudget(e.target.value)}
                    placeholder="e.g. ₹15 - 25 Lakhs"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[var(--color-text)] mb-1">Interior Scope</label>
                  <select
                    value={interiorScope}
                    onChange={(e) => setInteriorScope(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Complete Turnkey Interiors (Kitchen, Wardrobes, False Ceiling, Lighting)">Complete Turnkey Interiors (Kitchen, Wardrobes, False Ceiling, Lighting)</option>
                    <option value="Modular Kitchen & Wardrobe Joinery Only">Modular Kitchen & Wardrobe Joinery Only</option>
                    <option value="Commercial Office / Retail Fitout">Commercial Office / Retail Fitout</option>
                  </select>
                </div>
              </div>
            )}

            {/* 11. CONSULTANTS / VETTING */}
            {selectedService.id === 'consultants' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Consulting Discipline</label>
                  <select
                    value={consultantDiscipline}
                    onChange={(e) => setConsultantDiscipline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Structural Calculation STAAD Peer Review (IS 456 / IS 1893)">Structural Calculation STAAD Peer Review (IS 456 / IS 1893)</option>
                    <option value="Architectural Drawing Sanction & Vetting">Architectural Drawing Sanction & Vetting</option>
                    <option value="Scientific Vastu Spatial Harmonization">Scientific Vastu Spatial Harmonization</option>
                    <option value="MEP & Firefighting Clash Detection">MEP & Firefighting Clash Detection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Expected Deliverable</label>
                  <input
                    type="text"
                    value={consultantDeliverable}
                    onChange={(e) => setConsultantDeliverable(e.target.value)}
                    placeholder="e.g. Formal Stability Certificate"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 12. MATERIAL PROCUREMENT */}
            {selectedService.id === 'material' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Material Categories</label>
                  <input
                    type="text"
                    value={materialItemTypes}
                    onChange={(e) => setMaterialItemTypes(e.target.value)}
                    placeholder="e.g. Fe550D TMT Steel, 53 Grade Cement, AAC Blocks"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Estimated Quantity Required</label>
                  <input
                    type="text"
                    value={materialEstimatedQty}
                    onChange={(e) => setMaterialEstimatedQty(e.target.value)}
                    placeholder="e.g. 20 MT Steel, 800 Bags Cement"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold"
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Site & Contact
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SITE LOCATION, CONTACT & DOCUMENT ATTACHMENTS */}
        {/* ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                  Step 3 of 4 • Site & Contact Details
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mt-0.5">
                  Where is your project located & how should we reach you?
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  Full Name / Entity *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Aditya Sharma / Green Infra LLP"
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  Mobile Number (WhatsApp Enabled) *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  Project City / Hub *
                </label>
                <select
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                >
                  <option value="Lucknow">Lucknow (Amar Shaheed Path / Sultanpur Rd / Gomti Nagar)</option>
                  <option value="Gorakhpur">Gorakhpur (Taramandal / Medical Road / GIDA)</option>
                  <option value="Kanpur">Kanpur (Civil Lines / Swaroop Nagar / GT Rd)</option>
                  <option value="Varanasi">Varanasi (Ring Road / Shivpur / Sigra)</option>
                  <option value="Ayodhya">Ayodhya (Bypass / Ram Janmabhoomi Corridor)</option>
                  <option value="Prayagraj">Prayagraj (Civil Lines / Naini)</option>
                  <option value="Noida / NCR">Noida / Greater Noida / Yamuna Expressway</option>
                  <option value="Other Location">Other UP / National Location</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  Exact Site Address / Locality Landmark
                </label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="e.g. Sector 7, Gomti Nagar Extension, Near Police HQ, Lucknow - 226010"
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  Target Execution Timeline
                </label>
                <select
                  value={targetTimeline}
                  onChange={(e) => setTargetTimeline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                >
                  <option value="Immediate (Within 7-15 Days)">Immediate (Within 7-15 Days)</option>
                  <option value="Within 1-3 Months">Within 1-3 Months</option>
                  <option value="Planning Phase (3-6 Months)">Planning Phase (3-6 Months)</option>
                  <option value="Exploring Feasibility / Budgeting">Exploring Feasibility / Budgeting</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text)] mb-1">
                  Preferred Contact Channel
                </label>
                <div className="flex gap-2">
                  {(['WHATSAPP', 'CALL', 'EMAIL'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setPreferredContact(ch)}
                      className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-colors ${
                        preferredContact === ch
                          ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[#1697C4]'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--color-text)]">
                    Attach Project Documents / Drawings (Optional)
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    PDF, DWG, JPG, PNG, Excel BOQ or Khasra map up to 25MB each
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<UploadCloud className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                >
                  Upload Files
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                        <span className="truncate font-medium text-[var(--color-text)]">{att.name}</span>
                        <span className="text-[10px] text-[#7A837C]">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-[#991B1B] hover:text-red-700 font-bold ml-2 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consent acceptance */}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <label className="flex items-start gap-2.5 text-xs text-[var(--color-text-muted)] cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="rounded text-[var(--color-primary)] focus:ring-[#1697C4] mt-0.5"
              />
              <span>
                I agree to BuildEcoGroup using these details to respond to this requirement and assign the relevant service desk. See our <Link to={`${ROUTES.ABOUT}#privacy`} className="font-bold text-[var(--color-primary)] underline">Privacy Policy</Link>.
              </span>
            </label>

            <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Scope
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || !consentAccepted}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold shadow-md px-6"
                rightIcon={isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Registering Project Case...' : `Submit ${selectedService.shortTitle} Requirement`}
              </Button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUCCESS CONFIRMATION & LIVE TRACKING */}
        {/* ========================================================================= */}
        {step === 4 && createdFormRecord && (
          <div className="space-y-6 text-center sm:text-left animate-fadeIn">
            
            <div className="p-6 bg-[var(--color-primary-subtle)] rounded-3xl border border-[#C2E7CE] flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 flex-1">
                <div className="inline-flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    Requirement Registered Successfully
                  </Badge>
                  <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                    Desk Assignment Confirmed
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-[var(--color-text)]">
                  {createdFormRecord.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Your project requirement has been routed directly to <span className="font-bold text-[var(--color-primary)]">{createdFormRecord.assignedTo?.name || selectedService.assignedDesk}</span>. A senior coordinator will review technical specifications and reach out within 2 hours.
                </p>

                {/* ID Ribbon */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <div className="flex items-center gap-2 bg-[var(--color-surface)] px-3.5 py-2 rounded-xl border border-[#C2E7CE] shadow-2xs">
                    <span className="text-xs font-medium text-[var(--color-text-muted)]">Case ID:</span>
                    <span className="font-mono text-sm font-bold text-[var(--color-primary)]">
                      {createdFormRecord.id}
                    </span>
                    <button
                      type="button"
                      onClick={copyRecordId}
                      className="p-1 text-[#7A837C] hover:text-[var(--color-primary)] rounded transition-colors"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="text-xs font-semibold text-[var(--color-brand-brown)]">
                    Status: <span className="uppercase text-[var(--color-primary)] font-bold">SUBMITTED</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={`https://wa.me/917007254932?text=Hello%20BuildEcoGroup,%20I%20have%20submitted%20project%20requirement%20ID:%20${createdFormRecord.id}%20for%20${encodeURIComponent(selectedService.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Direct WhatsApp Helpline</span>
              </a>

              <Link
                to={`/track/${createdFormRecord.id}`}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-[var(--color-text)] font-bold text-xs hover:border-[#1697C4] hover:bg-[var(--color-background)] transition-colors"
              >
                <Compass className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Track Request Live</span>
              </Link>

              <Link
                to={ROUTES.CUSTOMER_DASHBOARD}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-xs hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Open in My Dashboard</span>
              </Link>
            </div>

            {/* Reset / Start another requirement */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setCreatedFormRecord(null);
                  setAttachments([]);
                }}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                + Submit Another Service Requirement
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
