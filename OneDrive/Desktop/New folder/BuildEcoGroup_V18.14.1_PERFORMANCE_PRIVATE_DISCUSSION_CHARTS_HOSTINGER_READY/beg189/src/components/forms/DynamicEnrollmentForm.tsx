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
  Briefcase,
  Truck,
  Store,
  Factory,
  Tractor,
  Award,
  BadgeCheck,
  Hammer
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EnrollmentRole, ProviderEnrollmentRecord, FormAttachment } from '../../types/forms';
import { createEnrollmentApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/routes';
import { Link, useNavigate } from 'react-router-dom';

interface DynamicEnrollmentFormProps {
  initialRole?: EnrollmentRole;
  onSuccess?: (record: ProviderEnrollmentRecord) => void;
  onCancel?: () => void;
}

interface RoleOption {
  id: EnrollmentRole;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const ENROLLMENT_ROLES: RoleOption[] = [
  {
    id: 'PROFESSIONAL',
    title: 'Professional',
    subtitle: 'Architects, Structural Engineers, QS/BOQ Experts, Interior Designers, Vastu & Solar Consultants',
    icon: <Compass className="w-5 h-5 text-[var(--color-brand-brown)]" />,
    popular: true,
  },
  {
    id: 'SKILLED_PERSON',
    title: 'Skilled Person',
    subtitle: 'Plumbers, Electricians, Carpenters, Painters, Masons, Welders, HVAC & Solar Technicians',
    icon: <Wrench className="w-5 h-5 text-[#2B7A78]" />,
    popular: true,
  },
  {
    id: 'SERVICE_PROVIDER',
    title: 'Service Provider',
    subtitle: 'Solar EPC, Water/STP/ETP, Waste Systems, CCTV Surveillance, AMC & Facility Operations',
    icon: <Droplets className="w-5 h-5 text-[var(--color-primary)]" />,
    popular: true,
  },
  {
    id: 'CONTRACTOR',
    title: 'Contractor',
    subtitle: 'Civil contractors, Turnkey builders, MEP package execution & structural contractors',
    icon: <HardHat className="w-5 h-5 text-[#E67E22]" />,
  },
  {
    id: 'VENDOR_SUPPLIER',
    title: 'Vendor / Supplier',
    subtitle: 'TMT steel, Cement, AAC blocks, Bricks, RMC Concrete, Pipes & Building Supplies',
    icon: <Truck className="w-5 h-5 text-[#3A4D6B]" />,
  },
  {
    id: 'SHOP_DEALER',
    title: 'Shop / Dealer',
    subtitle: 'Hardware stores, Sanitary & tile showrooms, Electrical & paint retail dealers',
    icon: <Store className="w-5 h-5 text-[#8E44AD]" />,
  },
  {
    id: 'BRAND_DISTRIBUTOR',
    title: 'Brand / Distributor',
    subtitle: 'Manufacturing brands, Regional authorized distributors & OEM suppliers',
    icon: <Factory className="w-5 h-5 text-[#D35400]" />,
  },
  {
    id: 'MACHINERY_PROVIDER',
    title: 'Machinery Provider',
    subtitle: 'JCBs, Excavators, Tower Cranes, Concrete Boom Placers, Compactor & Generators',
    icon: <Tractor className="w-5 h-5 text-[#C0392B]" />,
  },
  {
    id: 'LAND_PROVIDER',
    title: 'Land Provider',
    subtitle: 'Direct landowners, Authorized mandate holders & Land aggregators for JV/Sale',
    icon: <Layers className="w-5 h-5 text-[#16A085]" />,
  },
  {
    id: 'DEVELOPER_BUILDER',
    title: 'Developer / Builder',
    subtitle: 'Township developers, Joint Venture partners & Real estate infrastructure firms',
    icon: <Building2 className="w-5 h-5 text-[#2C3E50]" />,
  },
];

export const DynamicEnrollmentForm: React.FC<DynamicEnrollmentFormProps> = ({
  initialRole = 'PROFESSIONAL',
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<EnrollmentRole>(initialRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ProviderEnrollmentRecord | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Common Contact & Identity
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState((user as any)?.city || 'Lucknow');
  const [pincode, setPincode] = useState('226010');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(50);
  const [consentAccepted, setConsentAccepted] = useState(true);

  // Documents State
  const [documents, setDocuments] = useState<FormAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill logged in user
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if ((user as any)?.city) setCity((user as any).city);
    }
  }, [user]);

  // 1. PROFESSIONAL Specific State
  const [profCategory, setProfCategory] = useState('Architect (CoA Registered)');
  const [profSpecialization, setProfSpecialization] = useState('Bioclimatic & Low-Carbon Eco-Villas');
  const [profQualification, setProfQualification] = useState('B.Arch / M.Arch (IIT / SPA)');
  const [profExperienceYears, setProfExperienceYears] = useState(8);
  const [profRegistrationNo, setProfRegistrationNo] = useState('CA/2018/98421');
  const [profConsultationType, setProfConsultationType] = useState('Both Online & Physical Site Vetting');
  const [profFeeRange, setProfFeeRange] = useState('₹45 - 85 / sq ft for Turnkey Design & BOQ');
  const [profAvailability, setProfAvailability] = useState('Immediate / Full Capacity');

  // 2. SKILLED PERSON Specific State
  const [skilledTrade, setSkilledTrade] = useState('Electrician & DB Wireman');
  const [skilledExpYears, setSkilledExpYears] = useState(6);
  const [skilledWorkType, setSkilledWorkType] = useState<'INDIVIDUAL' | 'TEAM'>('TEAM');
  const [skilledTeamSize, setSkilledTeamSize] = useState(4);
  const [skilledRateType, setSkilledRateType] = useState('Per Job / Unit Rate BOQ');
  const [skilledTools, setSkilledTools] = useState('Laser level, Groove cutter, Megger tester, Crimping tools');
  const [skilledCertificates, setSkilledCertificates] = useState('ITI Electrical / NSDC Level 4');

  // 3. SERVICE PROVIDER Specific State
  const [serviceSubcategory, setServiceSubcategory] = useState<'WATER' | 'SOLAR' | 'WASTE' | 'CCTV' | 'MAINTENANCE' | 'INTERIOR' | 'HVAC'>('WATER');
  // Water specific
  const [waterTechType, setWaterTechType] = useState('STP / ETP (MBBR & SBR Biological Technology)');
  const [waterCapacityKld, setWaterCapacityKld] = useState('10 to 250 KLD');
  const [waterScope, setWaterScope] = useState('Turnkey Design, Supply, Installation & O&M');
  const [waterAmcAvailable, setWaterAmcAvailable] = useState(true);
  const [waterOperatorAvailable, setWaterOperatorAvailable] = useState(true);
  // Solar specific
  const [solarSegment, setSolarSegment] = useState('Rooftop Commercial & Residential On-Grid/Hybrid');
  const [solarBrandsPanels, setSolarBrandsPanels] = useState('Tata Power Solar, Waaree, Adani Solar');
  const [solarBrandsInverters, setSolarBrandsInverters] = useState('Growatt, Sungrow, Havells, Luminous');
  const [solarCapacityHandled, setSolarCapacityHandled] = useState('Over 1.5 MW+ Cumulative Commissioned');

  // 4. VENDOR / SUPPLIER Specific State
  const [vendorProductCategory, setVendorProductCategory] = useState('TMT Steel & Primary Structural Sections');
  const [vendorBrands, setVendorBrands] = useState('Tata Tiscon, JSW Neosteel, SAIL, Jindal Panther');
  const [vendorSkuCount, setVendorSkuCount] = useState('45+ Standard Sizes & Grades (Fe 550D / 500D)');
  const [vendorStockStatus, setVendorStockStatus] = useState('Ready Stock with Direct Mill TC (Test Certificate)');
  const [vendorPriceListAvailable, setVendorPriceListAvailable] = useState(true);
  const [vendorTransportAvailable, setVendorTransportAvailable] = useState(true);
  const [vendorGstNumber, setVendorGstNumber] = useState('09AABCB1234F1Z8');

  // 5. MACHINERY PROVIDER Specific State
  const [machineryCategory, setMachineryCategory] = useState('Earthmoving & Excavation');
  const [machineryName, setMachineryName] = useState('JCB 3DX Super & 20-Ton Hydraulic Excavators');
  const [machineryModelYear, setMachineryModelYear] = useState('2022 - 2024 Models');
  const [machineryQuantity, setMachineryQuantity] = useState(3);
  const [machineryOwnership, setMachineryOwnership] = useState('Owned Commercial Fleet');
  const [machineryOperatorAvailable, setMachineryOperatorAvailable] = useState(true);
  const [machineryRateStructure, setMachineryRateStructure] = useState('₹1,200 / hr (with Operator + Fuel/Dry options)');

  // 6. LAND PROVIDER Specific State
  const [landRoleType, setLandRoleType] = useState('Direct Title Landowner');
  const [landParcelLocation, setLandParcelLocation] = useState('Kisan Path / Sultanpur Road, Lucknow');
  const [landParcelArea, setLandParcelArea] = useState('6.2 Acres');
  const [landParcelType, setLandParcelType] = useState('Agricultural with 143 Non-Agricultural Conversion Order');
  const [landRoadWidthFt, setLandRoadWidthFt] = useState('60 Feet Frontage');
  const [landExpectedPrice, setLandExpectedPrice] = useState('₹18 Crores (or 42% JV Revenue Share)');
  const [landDealModel, setLandDealModel] = useState('Joint Venture (JV) with Tier-1 Developer');

  // 7. CONTRACTOR & DEVELOPER Specific State
  const [contractorLicenseClass, setContractorLicenseClass] = useState('CPWD Class-A / PWD Registered');
  const [contractorSqftExecuted, setContractorSqftExecuted] = useState('2,50,000+ sq ft across Lucknow & NCR');
  const [contractorLaborStrength, setContractorLaborStrength] = useState('80+ Permanent Tradesmen');

  // Handle Attachment Upload Simulation
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: FormAttachment[] = Array.from(files).map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type || 'document',
      url: URL.createObjectURL(file),
    }));
    setDocuments((prev) => [...prev, ...newItems]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const getRoleDetails = () => {
    switch (role) {
      case 'PROFESSIONAL':
        return {
          category: profCategory,
          specialization: profSpecialization,
          qualification: profQualification,
          yearsExp: profExperienceYears,
          registrationNumber: profRegistrationNo,
          consultationType: profConsultationType,
          feeRange: profFeeRange,
          availability: profAvailability,
        };
      case 'SKILLED_PERSON':
        return {
          skill: skilledTrade,
          yearsExp: skilledExpYears,
          workType: skilledWorkType,
          teamSize: skilledTeamSize,
          rateType: skilledRateType,
          toolsAvailable: skilledTools,
          certificates: skilledCertificates,
        };
      case 'SERVICE_PROVIDER':
        return {
          subcategory: serviceSubcategory,
          waterDetails: serviceSubcategory === 'WATER' ? {
            techType: waterTechType,
            capacityKld: waterCapacityKld,
            scope: waterScope,
            amcAvailable: waterAmcAvailable,
            operatorAvailable: waterOperatorAvailable,
          } : undefined,
          solarDetails: serviceSubcategory === 'SOLAR' ? {
            segment: solarSegment,
            panelBrands: solarBrandsPanels,
            inverterBrands: solarBrandsInverters,
            capacityHandled: solarCapacityHandled,
          } : undefined,
        };
      case 'VENDOR_SUPPLIER':
      case 'SHOP_DEALER':
      case 'BRAND_DISTRIBUTOR':
        return {
          productCategory: vendorProductCategory,
          brandsSupplied: vendorBrands,
          skuCount: vendorSkuCount,
          stockStatus: vendorStockStatus,
          priceListAvailable: vendorPriceListAvailable,
          transportAvailable: vendorTransportAvailable,
          gstNumber: vendorGstNumber,
        };
      case 'MACHINERY_PROVIDER':
        return {
          machineryCategory,
          machineName: machineryName,
          modelYear: machineryModelYear,
          quantity: machineryQuantity,
          ownership: machineryOwnership,
          operatorAvailable: machineryOperatorAvailable,
          rateStructure: machineryRateStructure,
        };
      case 'LAND_PROVIDER':
        return {
          landRoleType,
          location: landParcelLocation,
          area: landParcelArea,
          type: landParcelType,
          roadWidth: landRoadWidthFt,
          expectedPrice: landExpectedPrice,
          dealModel: landDealModel,
        };
      case 'CONTRACTOR':
      case 'DEVELOPER_BUILDER':
        return {
          licenseClass: contractorLicenseClass,
          sqftExecuted: contractorSqftExecuted,
          laborStrength: contractorLaborStrength,
        };
      default:
        return { role };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const details = getRoleDetails();

      const result = await createEnrollmentApi({
        role,
        fullName: fullName || 'Verified Provider',
        businessName: businessName || fullName,
        email: email || 'provider@buildecogroup.com',
        phone: phone || '+91 70072 54932',
        city,
        pincode,
        serviceRadiusKm,
        details,
        documents,
        consentAccepted,
      });

      const record: ProviderEnrollmentRecord = {
        id: result.enrollmentReference,
        role: result.enrollment.role,
        fullName: result.enrollment.fullName,
        businessName: result.enrollment.businessName,
        email: result.enrollment.email,
        phone: result.enrollment.phone,
        city: result.enrollment.city,
        pincode: result.enrollment.pincode,
        serviceRadiusKm: result.enrollment.serviceRadiusKm,
        profileCompletion: result.enrollment.profileCompletion,
        kycStatus: result.enrollment.kycStatus,
        categoryVerification: result.enrollment.categoryVerification,
        serviceAreaStatus: result.enrollment.serviceAreaStatus,
        catalogStatus: result.enrollment.catalogStatus,
        createdAt: result.enrollment.createdAt,
        status: 'SUBMITTED',
        details: result.enrollment.details,
        documents: result.enrollment.documents as FormAttachment[],
      };

      setSubmittedRecord(record);
      setStep(4);
      if (onSuccess) onSuccess(record);
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setSubmitError(err?.message || 'Failed to submit enrollment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-xs overflow-hidden">
      
      {/* 4-Step Progress Header */}
      <div className="bg-[var(--color-background)] px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              1
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 1 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              Role Selection
            </span>
          </div>

          <div className="h-[2px] w-6 sm:w-12 bg-[#D6E8F0]" />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              2
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 2 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              Capability Details
            </span>
          </div>

          <div className="h-[2px] w-6 sm:w-12 bg-[#D6E8F0]" />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              3
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 3 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              KYC & Docs
            </span>
          </div>

          <div className="h-[2px] w-6 sm:w-12 bg-[#D6E8F0]" />

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 4 ? 'bg-[var(--color-primary)] text-white' : 'bg-[#D6E8F0] text-[var(--color-text-muted)]'
            }`}>
              4
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === 4 ? 'text-[var(--color-text)]' : 'text-[#7A837C]'}`}>
              Member Status
            </span>
          </div>

        </div>
      </div>

      <div className="p-6 sm:p-8">
        
        {/* ========================================================================= */}
        {/* STEP 1: SELECT ENROLLMENT ROLE */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                Join BuildEcoGroup Network • Ecosystem Empanelment
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--color-text)]">
                Select your professional or business category
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                Empanel your specialized services to receive direct milestone assignments, verified BOQ tenders, and enterprise client connections.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ENROLLMENT_ROLES.map((item) => {
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 relative group ${
                      isSelected
                        ? 'bg-[var(--color-surface-muted)] border-[#1697C4] shadow-xs'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[#1697C4]/40 hover:bg-[var(--color-background)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      {item.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[#D6E8F0]/60 px-2 py-0.5 rounded-md">
                          High Demand
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[var(--color-text)] flex items-center justify-between">
                        <span>{item.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] leading-snug mt-1 line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
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
                Proceed to Capability Fields
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CATEGORY-SPECIFIC CAPABILITY FIELDS */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                  Step 2 of 4 • {role.replace(/_/g, ' ')} Profile
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mt-0.5">
                  Enter your credentials, licenses & service parameters
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Change Role
              </button>
            </div>

            {/* 1. PROFESSIONAL FIELDS */}
            {role === 'PROFESSIONAL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Professional Category</label>
                  <select
                    value={profCategory}
                    onChange={(e) => setProfCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Architect (CoA Registered)">Architect (CoA Registered)</option>
                    <option value="Structural Engineer (IEI / Chartered)">Structural Engineer (IEI / Chartered)</option>
                    <option value="QS / BOQ & Cost Estimator">QS / BOQ & Cost Estimator</option>
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="Vastu & Bioclimatic Consultant">Vastu & Bioclimatic Consultant</option>
                    <option value="Geotechnical & Soil Engineer">Geotechnical & Soil Engineer</option>
                    <option value="Solar & Energy Modeling Specialist">Solar & Energy Modeling Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Specialization & Domain Focus</label>
                  <input
                    type="text"
                    value={profSpecialization}
                    onChange={(e) => setProfSpecialization(e.target.value)}
                    placeholder="e.g. Mass timber, Seismic retrofit, Eco-villas"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={profQualification}
                    onChange={(e) => setProfQualification(e.target.value)}
                    placeholder="e.g. B.Arch, M.Tech Structural, Ph.D"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Years of Professional Experience</label>
                  <input
                    type="number"
                    value={profExperienceYears}
                    onChange={(e) => setProfExperienceYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Statutory Registration / License Number</label>
                  <input
                    type="text"
                    value={profRegistrationNo}
                    onChange={(e) => setProfRegistrationNo(e.target.value)}
                    placeholder="e.g. CA/2018/98421 or IEI-M-14029"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Typical Fee Range Benchmark</label>
                  <input
                    type="text"
                    value={profFeeRange}
                    onChange={(e) => setProfFeeRange(e.target.value)}
                    placeholder="e.g. ₹50/sq ft or ₹6,500/hr"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 2. SKILLED PERSON FIELDS */}
            {role === 'SKILLED_PERSON' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Primary Trade / Skill</label>
                  <select
                    value={skilledTrade}
                    onChange={(e) => setSkilledTrade(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Plumber (CPVC / SWR Piping)">Plumber (CPVC / SWR Piping)</option>
                    <option value="Electrician & DB Wireman">Electrician & DB Wireman</option>
                    <option value="Carpenter & Modular Joinery">Carpenter & Modular Joinery</option>
                    <option value="Painter & Texture Finisher">Painter & Texture Finisher</option>
                    <option value="Mason & Tiler">Mason & Tiler</option>
                    <option value="Welder & Steel Fabricator">Welder & Steel Fabricator</option>
                    <option value="HVAC & Ducting Technician">HVAC & Ducting Technician</option>
                    <option value="Solar Panel & Inverter Technician">Solar Panel & Inverter Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Work Setup</label>
                  <select
                    value={skilledWorkType}
                    onChange={(e) => setSkilledWorkType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="INDIVIDUAL">Individual Master Craftsman</option>
                    <option value="TEAM">Team / Gang Leader with Helpers</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Team Strength (Persons)</label>
                  <input
                    type="number"
                    value={skilledTeamSize}
                    onChange={(e) => setSkilledTeamSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Preferred Rate Structure</label>
                  <select
                    value={skilledRateType}
                    onChange={(e) => setSkilledRateType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Per Job / Unit Rate BOQ">Per Job / Unit Rate BOQ (Itemized)</option>
                    <option value="Daily Wage / DLR Benchmark">Daily Wage / DLR Benchmark</option>
                    <option value="Monthly Turnkey Contract">Monthly Turnkey Contract</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[var(--color-text)] mb-1">Tools & Diagnostic Equipment Available</label>
                  <input
                    type="text"
                    value={skilledTools}
                    onChange={(e) => setSkilledTools(e.target.value)}
                    placeholder="e.g. Core cutting machine, Laser level, Pressure testing pump, Multimeter"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 3. SERVICE PROVIDER (DYNAMIC SUBCATEGORIES) */}
            {role === 'SERVICE_PROVIDER' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Service Subcategory</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'WATER', label: 'Water / STP / ETP' },
                      { id: 'SOLAR', label: 'Solar & Clean Energy' },
                      { id: 'WASTE', label: 'Waste Management' },
                      { id: 'CCTV', label: 'CCTV & Site IoT' },
                      { id: 'MAINTENANCE', label: 'Facility AMC' },
                      { id: 'INTERIOR', label: 'Interior Fitouts' },
                      { id: 'HVAC', label: 'HVAC & Ventilation' },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setServiceSubcategory(sub.id as any)}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-colors ${
                          serviceSubcategory === sub.id
                            ? 'bg-[var(--color-primary)] text-white border-[#1697C4]'
                            : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border-strong)] hover:bg-[var(--color-background)]'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {serviceSubcategory === 'WATER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)]">
                    <div>
                      <label className="block font-bold text-[var(--color-text)] mb-1">Treatment Technologies Deployed</label>
                      <input
                        type="text"
                        value={waterTechType}
                        onChange={(e) => setWaterTechType(e.target.value)}
                        placeholder="e.g. MBBR, SBR, MBR, Industrial RO, Softener"
                        className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[var(--color-text)] mb-1">Capacity Range Handled (KLD)</label>
                      <input
                        type="text"
                        value={waterCapacityKld}
                        onChange={(e) => setWaterCapacityKld(e.target.value)}
                        placeholder="e.g. 5 KLD to 500 KLD"
                        className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={waterAmcAvailable}
                          onChange={(e) => setWaterAmcAvailable(e.target.checked)}
                          className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                        />
                        <span>Annual Maintenance Contracts (AMC) Available</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={waterOperatorAvailable}
                          onChange={(e) => setWaterOperatorAvailable(e.target.checked)}
                          className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                        />
                        <span>Dedicated Certified STP/ETP Operators Available</span>
                      </label>
                    </div>
                  </div>
                )}

                {serviceSubcategory === 'SOLAR' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)]">
                    <div>
                      <label className="block font-bold text-[var(--color-text)] mb-1">Solar PV Segment</label>
                      <input
                        type="text"
                        value={solarSegment}
                        onChange={(e) => setSolarSegment(e.target.value)}
                        placeholder="e.g. Rooftop Commercial, Industrial MW, PM Surya Ghar"
                        className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[var(--color-text)] mb-1">Cumulative Capacity Commissioned</label>
                      <input
                        type="text"
                        value={solarCapacityHandled}
                        onChange={(e) => setSolarCapacityHandled(e.target.value)}
                        placeholder="e.g. 2 MW+ rooftop & ground mount"
                        className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[var(--color-text)] mb-1">Panel Brands Supplied</label>
                      <input
                        type="text"
                        value={solarBrandsPanels}
                        onChange={(e) => setSolarBrandsPanels(e.target.value)}
                        placeholder="e.g. Tata Power, Waaree, Adani"
                        className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[var(--color-text)] mb-1">Inverter Brands</label>
                      <input
                        type="text"
                        value={solarBrandsInverters}
                        onChange={(e) => setSolarBrandsInverters(e.target.value)}
                        placeholder="e.g. Growatt, Sungrow, Havells"
                        className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. VENDOR / SUPPLIER / DEALER / BRAND */}
            {['VENDOR_SUPPLIER', 'SHOP_DEALER', 'BRAND_DISTRIBUTOR'].includes(role) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Product Category</label>
                  <input
                    type="text"
                    value={vendorProductCategory}
                    onChange={(e) => setVendorProductCategory(e.target.value)}
                    placeholder="e.g. TMT Steel, AAC Blocks, RMC, Sanitary"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Brands Supplied</label>
                  <input
                    type="text"
                    value={vendorBrands}
                    onChange={(e) => setVendorBrands(e.target.value)}
                    placeholder="e.g. Tata Tiscon, Ultratech, Jaquar, Astral"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">SKUs / Product Range</label>
                  <input
                    type="text"
                    value={vendorSkuCount}
                    onChange={(e) => setVendorSkuCount(e.target.value)}
                    placeholder="e.g. 50+ item codes"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">GST Number</label>
                  <input
                    type="text"
                    value={vendorGstNumber}
                    onChange={(e) => setVendorGstNumber(e.target.value)}
                    placeholder="e.g. 09AABCB1234F1Z8"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={vendorPriceListAvailable}
                      onChange={(e) => setVendorPriceListAvailable(e.target.checked)}
                      className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                    />
                    <span>Digital Wholesale Price List Ready</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={vendorTransportAvailable}
                      onChange={(e) => setVendorTransportAvailable(e.target.checked)}
                      className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                    />
                    <span>Direct Site Delivery & Transport Fleet Available</span>
                  </label>
                </div>
              </div>
            )}

            {/* 5. MACHINERY PROVIDER */}
            {role === 'MACHINERY_PROVIDER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Machinery Category</label>
                  <select
                    value={machineryCategory}
                    onChange={(e) => setMachineryCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Earthmoving & Excavation (JCB / Excavator)">Earthmoving & Excavation (JCB / Excavator)</option>
                    <option value="Concrete Machinery (Boom Placer / Transit Mixer)">Concrete Machinery (Boom Placer / Transit Mixer)</option>
                    <option value="Lifting & Cranes (Hydra / Tower Crane)">Lifting & Cranes (Hydra / Tower Crane)</option>
                    <option value="Road & Compaction (Roller / Compactor)">Road & Compaction (Roller / Compactor)</option>
                    <option value="Power & Pumping (DG Sets / Dewatering Pumps)">Power & Pumping (DG Sets / Dewatering Pumps)</option>
                    <option value="Scaffolding & Shuttering (Cuplock / H-Frames)">Scaffolding & Shuttering (Cuplock / H-Frames)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Equipment Name & Make</label>
                  <input
                    type="text"
                    value={machineryName}
                    onChange={(e) => setMachineryName(e.target.value)}
                    placeholder="e.g. JCB 3DX, Tata Hitachi 210, 125 kVA DG"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Quantity Available</label>
                  <input
                    type="number"
                    value={machineryQuantity}
                    onChange={(e) => setMachineryQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Hourly / Daily Rate</label>
                  <input
                    type="text"
                    value={machineryRateStructure}
                    onChange={(e) => setMachineryRateStructure(e.target.value)}
                    placeholder="e.g. ₹1,200 / hr or ₹9,500 / day"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 6. LAND PROVIDER */}
            {role === 'LAND_PROVIDER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Role / Mandate</label>
                  <select
                    value={landRoleType}
                    onChange={(e) => setLandRoleType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Direct Title Landowner">Direct Title Landowner</option>
                    <option value="Authorized Mandate Holder">Authorized Mandate Holder</option>
                    <option value="Land Aggregator / Investor">Land Aggregator / Investor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Land Location / Tehsil</label>
                  <input
                    type="text"
                    value={landParcelLocation}
                    onChange={(e) => setLandParcelLocation(e.target.value)}
                    placeholder="e.g. Sultanpur Road, Lucknow"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Land Area (Acres / Sq Ft)</label>
                  <input
                    type="text"
                    value={landParcelArea}
                    onChange={(e) => setLandParcelArea(e.target.value)}
                    placeholder="e.g. 5.5 Acres"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Preferred Model</label>
                  <select
                    value={landDealModel}
                    onChange={(e) => setLandDealModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value="Joint Venture (JV) with Tier-1 Developer">Joint Venture (JV) with Tier-1 Developer</option>
                    <option value="Outright Sale">Outright Sale</option>
                    <option value="Long-Term Commercial Lease">Long-Term Commercial Lease</option>
                  </select>
                </div>
              </div>
            )}

            {/* Fallback */}
            {!['PROFESSIONAL', 'SKILLED_PERSON', 'SERVICE_PROVIDER', 'VENDOR_SUPPLIER', 'SHOP_DEALER', 'BRAND_DISTRIBUTOR', 'MACHINERY_PROVIDER', 'LAND_PROVIDER'].includes(role) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Contractor / Builder License Class</label>
                  <input
                    type="text"
                    value={contractorLicenseClass}
                    onChange={(e) => setContractorLicenseClass(e.target.value)}
                    placeholder="e.g. CPWD Class-A / PWD"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">Total Sq Ft Executed</label>
                  <input
                    type="text"
                    value={contractorSqftExecuted}
                    onChange={(e) => setContractorSqftExecuted(e.target.value)}
                    placeholder="e.g. 2,00,000 sq ft"
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
                Continue to KYC & Documents
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: KYC, REGISTRATION PROOF & SUBMIT */}
        {/* ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="pb-3 border-b border-[var(--color-border)]">
              <div className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                Step 3 of 4 • Identity, Service Radius & KYC Verification
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mt-0.5">
                Upload your identity, trade license, or business registration
              </h3>
            </div>

            {/* Document Upload Zone */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[var(--color-text)]">
                Upload Verification Documents (CoA Certificate, IEI / Trade License, GST Certificate, Machinery RC, or Portfolio)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--color-border-strong)] hover:border-[#1697C4] bg-[var(--color-background)] p-5 rounded-2xl text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <UploadCloud className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-2" />
                <div className="text-xs font-bold text-[var(--color-text)]">
                  Click or Drag & Drop verification files here
                </div>
                <div className="text-[10px] text-[#7A837C]">
                  PDF, JPG, PNG, GST docs up to 25MB each
                </div>
              </div>

              {/* Uploaded List */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[var(--color-text-muted)]">Attached KYC Documents ({documents.length}):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <BadgeCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                          <span className="truncate font-semibold text-[var(--color-text)]">{doc.name}</span>
                          <span className="text-[10px] text-[#7A837C] shrink-0">({doc.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1 text-[#7A837C] hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Contact & Service Area */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                Official Business Contact & Operational Territory
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Er. Rajeshwar Nath"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Business / Firm Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Nath Geotechnical & Infrastructure LLP"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Mobile Number (for SMS & Assignment alerts) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajeshwar@example.com"
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Operating City & PIN Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-2/3 p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                    />
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="PIN"
                      className="w-1/3 p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text)] mb-1">
                    Operational Radius (km from Base City)
                  </label>
                  <select
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-text)] focus:border-[#1697C4] focus:outline-hidden"
                  >
                    <option value={25}>Within 25 km (Local City Core)</option>
                    <option value={50}>Within 50 km (District & Suburbs)</option>
                    <option value={150}>Within 150 km (Regional)</option>
                    <option value={500}>Pan-State / National</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      required
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-[var(--color-primary)] focus:ring-[#1697C4]"
                    />
                    <span className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                      I declare that all professional qualifications, licenses, and business particulars submitted are genuine. I agree to the BuildEcoGroup Empanelment Code of Conduct & Escrow Milestone Delivery Standards.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)]">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Capabilities
              </Button>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold shadow-xs px-6"
                rightIcon={<Award className="w-4 h-4" />}
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Empanelment Application'}
              </Button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ENROLLMENT DASHBOARD STATE AFTER SUBMISSION */}
        {/* ========================================================================= */}
        {step === 4 && submittedRecord && (
          <div className="space-y-6">
            
            {/* Header with Member ID */}
            <div className="p-6 rounded-3xl bg-[var(--color-surface-muted)] border border-[#B9DDEA] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                    Empanelment Dossier Submitted
                  </div>
                  <div className="text-xl font-extrabold text-[var(--color-text)]">
                    Member ID: <span className="font-mono text-[var(--color-primary)]">{submittedRecord.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md">
                  {submittedRecord.role.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Provider Enrollment Dashboard Status Matrix */}
            <div className="p-6 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] space-y-6">
              
              {/* Profile Completion Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--color-text)] uppercase tracking-wider">Profile Completion</span>
                  <span className="text-[var(--color-primary)]">{submittedRecord.profileCompletion}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#D6E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                    style={{ width: `${submittedRecord.profileCompletion}%` }}
                  />
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                
                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#7A837C]">KYC Status</div>
                  <div className="font-extrabold text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Under Review</span>
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">Desk verification underway</div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#7A837C]">Category Verification</div>
                  <div className="font-extrabold text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Pending Peer Review</span>
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">Technical license check</div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#7A837C]">Service Area</div>
                  <div className="font-extrabold text-[var(--color-primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Complete</span>
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{submittedRecord.city} ({submittedRecord.serviceRadiusKm} km radius)</div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#7A837C]">Catalog / Portfolio</div>
                  <div className="font-extrabold text-[var(--color-brand-brown)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-brand-brown)]" />
                    <span>Incomplete</span>
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">Upload project photos/rates</div>
                </div>

              </div>

            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/track/${submittedRecord.id}`}>
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Track KYC & Application Live
                  </Button>
                </Link>

                <Link to={ROUTES.DASHBOARD}>
                  <Button
                    variant="secondary"
                    size="md"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setSubmittedRecord(null);
                  setStep(1);
                }}
              >
                Enroll Another Entity / Category
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
