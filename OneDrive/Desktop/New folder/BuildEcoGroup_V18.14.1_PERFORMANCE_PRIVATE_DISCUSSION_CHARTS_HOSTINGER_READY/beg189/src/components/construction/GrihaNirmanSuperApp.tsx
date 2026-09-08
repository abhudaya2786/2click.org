import React, { useState, useMemo, useRef } from 'react';
import {
  HardHat,
  Layers,
  FileSpreadsheet,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Calculator,
  Building2,
  Sparkles,
  Search,
  Filter,
  Sliders,
  Compass,
  Check,
  X,
  Plus,
  Trash2,
  Download,
  Share2,
  FileText,
  Lock,
  Zap,
  Eye,
  Database,
  Activity,
  Award,
  MapPin,
  Maximize2,
  Layout,
  List,
  Crosshair,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Circle,
  Square,
  MoveRight,
  Eraser,
  Undo2,
  EyeOff,
  MousePointer2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { AppIcon } from '../ui/AppIcon';
import type { IconToken } from '../../lib/iconSystem';

interface GrihaNirmanSuperAppProps {
  onOpenIntake?: (objective: string, category?: string) => void;
  className?: string;
}

// 2D FLOOR PLAN BLUEPRINT ROOM DEFINITION
interface BlueprintRoom {
  key: string;
  name: string;
  dimensions: string;
  x: number; // left %
  y: number; // top %
  w: number; // width %
  h: number; // height %
  colorClass: string;
  defaultPinX: number;
  defaultPinY: number;
}

// 2D BLUEPRINT MARKUP SKETCH ELEMENT DEFINITION
export interface MarkupShape {
  id: string;
  type: 'circle' | 'freehand' | 'rectangle' | 'arrow';
  color: string;
  strokeWidth: number;
  label?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
  snagId?: string;
}

const BLUEPRINT_ROOMS: BlueprintRoom[] = [
  { key: 'master_bed', name: 'Master Bedroom', dimensions: "14' × 16'", x: 4, y: 6, w: 42, h: 42, colorClass: 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300', defaultPinX: 25, defaultPinY: 27 },
  { key: 'master_bath', name: 'Master En-Suite Bath', dimensions: "8' × 7'", x: 4, y: 50, w: 22, h: 26, colorClass: 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300', defaultPinX: 15, defaultPinY: 63 },
  { key: 'common_bath', name: 'Common Toilet', dimensions: "6' × 7'", x: 28, y: 50, w: 18, h: 26, colorClass: 'bg-sky-950/30 border-sky-500/40 text-sky-300', defaultPinX: 37, defaultPinY: 63 },
  { key: 'guest_bed', name: 'Bedroom 2 / Guest Suite', dimensions: "12' × 13'", x: 4, y: 78, w: 42, h: 18, colorClass: 'bg-blue-950/30 border-blue-500/40 text-blue-300', defaultPinX: 25, defaultPinY: 87 },
  { key: 'kitchen', name: 'Modular Kitchen & Utility', dimensions: "11' × 12'", x: 50, y: 6, w: 46, h: 32, colorClass: 'bg-amber-950/30 border-amber-500/40 text-amber-300', defaultPinX: 73, defaultPinY: 22 },
  { key: 'living', name: 'Living & Dining Hall', dimensions: "18' × 16'", x: 50, y: 40, w: 46, h: 36, colorClass: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300', defaultPinX: 73, defaultPinY: 58 },
  { key: 'balcony', name: 'Sit-out Balcony & Terrace', dimensions: "14' × 5'", x: 50, y: 78, w: 46, h: 18, colorClass: 'bg-teal-950/30 border-teal-500/40 text-teal-300', defaultPinX: 73, defaultPinY: 87 },
];

// 1. LIFECYCLE PHASES DATA
interface LifecyclePhase {
  id: number;
  stageNum: string;
  title: string;
  subtitle: string;
  icon: IconToken;
  activities: string[];
  codes: string;
  qualityMetrics: string;
  executionRule: string;
}

const LIFECYCLE_PHASES: LifecyclePhase[] = [
  {
    id: 1,
    stageNum: "01",
    title: "Phase 1: Land & Pre-Construction",
    subtitle: "Zamin Parikshan & Approved Architectural Design",
    icon: "land",
    activities: [
      "Total Station Digital Cadastral Boundary & Contour Survey",
      "Geotechnical Subsoil Borehole Drilling (IS 1892 & IS 2720)",
      "Architectural Spatial Planning & IS 456 Structural FEA STAAD.Pro Analysis",
      "Municipal Sanction Plan Approval (LDA/GDA) & RERA Registration"
    ],
    codes: "IS 1892, IS 2720, IS 456, NBC 2016",
    qualityMetrics: "Safe Bearing Capacity (SBC in kN/m²), Soil Chloride/Sulfate limits, Sanctioned Setback clearances.",
    executionRule: "Structural drawing sign-off directly controls site excavation permits."
  },
  {
    id: 2,
    stageNum: "02",
    title: "Phase 2: Substructure & Ground",
    subtitle: "Neenv & Plinth Level Execution",
    icon: "construction",
    activities: [
      "Grid Line Centerline Marking & Mechanical Trench Excavation",
      "Subterranean Anti-Termite Soil Poisoning (Chlorpyrifos Emulsion)",
      "PCC Mud-Mat (M7.5 / M10) Leveling Bed Placement",
      "RCC Footings, Pedestals & Continuous Plinth Tie Beam Casting"
    ],
    codes: "IS 6313, IS 456, IS 1786 (Fe 500D)",
    qualityMetrics: "Concrete Slump (75-100mm), 28-day Cube Compressive Strength, Sand Silt content (<5%).",
    executionRule: "Maintain minimum 50mm clear cover block for footings to prevent groundwater rebar corrosion."
  },
  {
    id: 3,
    stageNum: "03",
    title: "Phase 3: Superstructure Frame",
    subtitle: "Column, Slab & Masonry Skeleton",
    icon: "property",
    activities: [
      "Column Rebar Cages with IS 13920 Seismic Confinement Ties",
      "Masonry Infill (AAC Blocks / Fly Ash Bricks Class 7.5)",
      "Continuous RCC Lintel Bands over all openings to prevent shear cracks",
      "Monolithic Slab Shuttering, Conduit Embedding & M25 Concrete Pour"
    ],
    codes: "IS 456, IS 13920, IS 2185, IS 12894",
    qualityMetrics: "Deflection limits, 14-day continuous pond curing, plumb line vertical tolerance (±3mm).",
    executionRule: "Needle vibrators must be used during slab pour to completely prevent honeycombing."
  },
  {
    id: 4,
    stageNum: "04",
    title: "Phase 4: MEP Infrastructure",
    subtitle: "Electrical & Plumbing Rough-in",
    icon: "material",
    activities: [
      "FRLS PVC Wall Chasing (Strictly Vertical paths only, zero deep horizontal cuts)",
      "CPVC SDR-11 Hot/Cold Potable Water Supply Lines (IS 15778)",
      "SWR-PVC (IS 13592) Gravity Drainage Shaft Installation",
      "Pre-installed HVAC Wall Sleeves with 1:100 Condensate Slope"
    ],
    codes: "IS 732, IS 694, IS 15778, IS 13592",
    qualityMetrics: "Hydrostatic 10 bar pressure hold for 24 hrs, Electrical Insulation Megger test (>1 MΩ).",
    executionRule: "Never chase load-bearing walls horizontally beyond 1/3rd wall depth."
  },
  {
    id: 5,
    stageNum: "05",
    title: "Phase 5: Finishing & Waterproofing",
    subtitle: "Plaster, Tiling & Paint Fit-Out",
    icon: "interior",
    activities: [
      "20mm Dual-Coat Waterproof Sand-face Plastering",
      "Sunken Bath & Terrace Elastomeric Membrane Waterproofing",
      "Vitrified Tile Installation using IS 15477 Polymer Modified Adhesive",
      "Acrylic Wall Putty, Primer & Low-VOC Emulsion Paint Coats"
    ],
    codes: "IS 2645, IS 15477, IS 15808",
    qualityMetrics: "72-Hour Water Ponding Test zero drop, Tile hollow sound tapping check, Zero brush stippling.",
    executionRule: "Terrace screed must maintain minimum 1:100 slope toward rainwater downspouts."
  },
  {
    id: 6,
    stageNum: "06",
    title: "Phase 6: Snagging & Grihapravesh",
    subtitle: "Testing, Commissioning, OC Certificate & Handover",
    icon: "approval",
    activities: [
      "Integrated Testing & Commissioning (Earthing pit resistance <1.0 Ω)",
      "Digital Snag List Clearing with Subcontractor Sign-offs",
      "Municipal Occupancy Certificate (OC) & Completion Cert (CC)",
      "Final Deep Cleaning & Key Handover Dossier Transfer"
    ],
    codes: "NBC 2016 Part 8, Local Municipal Bylaws",
    qualityMetrics: "Zero open snags, verified earth resistance, valid OC document seal.",
    executionRule: "Final contractor payment released only upon receipt of formal Occupancy Certificate."
  }
];

// 2. MATERIAL TAXONOMY DATA
interface MaterialSpec {
  name: string;
  category: 'structural' | 'masonry' | 'mep' | 'finishing';
  isCode: string;
  grades: string;
  testing: string;
  benchmark: string;
}

const MATERIALS_DATA: MaterialSpec[] = [
  {
    name: "Cement (OPC / PPC / PSC)",
    category: "structural",
    isCode: "IS 269 / IS 1489",
    grades: "OPC 43/53 Grade, PPC, Slag Cement",
    testing: "Fineness (>225 m²/kg), Initial Setting (>30 min), Le-Chatelier Soundness (<10mm).",
    benchmark: "28-Day Strength: ≥53 MPa for OPC 53"
  },
  {
    name: "Reinforcement TMT Steel",
    category: "structural",
    isCode: "IS 1786 : 2008",
    grades: "Fe 500D, Fe 550D High Ductility",
    testing: "Yield stress (>500 N/mm²), Elongation (>16%), 180° Bend-Rebend test.",
    benchmark: "High seismic energy absorption & elongation"
  },
  {
    name: "Aggregates (Sand & Stone)",
    category: "masonry",
    isCode: "IS 383 : 2016",
    grades: "M-Sand Zone II, P-Sand, 20mm/10mm Stone",
    testing: "Silt content (<5% in sand), Aggregates crushing value (<30%).",
    benchmark: "Zero organic impurities or marine salts"
  },
  {
    name: "AAC Blocks / Bricks",
    category: "masonry",
    isCode: "IS 2185 / IS 12894",
    grades: "AAC 4-5 N/mm², Fly Ash Class 7.5/10",
    testing: "Water absorption (<15%), Crushing strength, Dimensional tolerance ±2mm.",
    benchmark: "Thermal conductivity: 0.16 W/m-K"
  },
  {
    name: "Plumbing Conduits (CPVC/SWR)",
    category: "mep",
    isCode: "IS 15778 / IS 13592",
    grades: "CPVC SDR-11 Class 1/2, SWR PVC Type A/B",
    testing: "10 bar continuous hydrostatic pressure, Flattening test.",
    benchmark: "Lead-free, NSF certified potable water"
  },
  {
    name: "Electrical Wires & Switches",
    category: "mep",
    isCode: "IS 694 / IS 732 / IS 8828",
    grades: "FRLS Copper Wires (1.5 - 6.0 sq mm), MCB Type B/C",
    testing: "Spark test, Insulation resistance (>1 MΩ), Earth loop fault clearance <0.1s.",
    benchmark: "Halogen-free fire retardant casing"
  },
  {
    name: "Waterproofing Membranes",
    category: "finishing",
    isCode: "IS 2645 / IS 15808",
    grades: "2K Acrylic Polymer, Polyurethane (PU) Hybrid",
    testing: "Elongation at break (>200%), 72-hr ponding test, Crack bridging 2mm.",
    benchmark: "Hydrostatic head resistance > 5 bar"
  },
  {
    name: "Vitrified Tiles & Adhesives",
    category: "finishing",
    isCode: "IS 15477 / IS 13753",
    grades: "Type 2/3 Polymer Modified Adhesive",
    testing: "Shear bond strength, Zero hollow tap sound, Stain resistance Class 5.",
    benchmark: "Water absorption < 0.05%"
  }
];

// 3. DATABASE SCHEMA EXPLORER DATA
interface DbEntity {
  name: string;
  table: string;
  pk: string;
  fk: string;
  description: string;
  fields: string[];
}

const DB_SCHEMA_DATA: Record<string, DbEntity> = {
  Users: {
    name: "Users & RBAC",
    table: "users",
    pk: "user_id (UUID)",
    fk: "None (Root Entity)",
    description: "Core identity, roles (Owner, Contractor, Structural Engineer, QA Auditor) and auth sessions.",
    fields: [
      "id: uuid DEFAULT gen_random_uuid() PRIMARY KEY",
      "email: varchar(255) UNIQUE NOT NULL",
      "full_name: varchar(255) NOT NULL",
      "phone: varchar(20) NOT NULL",
      "role: enum('SUPER_ADMIN','CONSULTANT','CUSTOMER','CONTRACTOR')",
      "is_active: boolean DEFAULT true",
      "created_at: timestamp DEFAULT now()"
    ]
  },
  Projects: {
    name: "Projects & Sites",
    table: "projects",
    pk: "project_id (UUID)",
    fk: "owner_id -> users(id)",
    description: "Real estate construction projects with plot geometry, built-up area, FAR, and target budget.",
    fields: [
      "id: uuid PRIMARY KEY",
      "owner_id: uuid REFERENCES users(id)",
      "title: varchar(255) NOT NULL",
      "plot_area_sqft: numeric(10,2) NOT NULL",
      "builtup_area_sqft: numeric(10,2) NOT NULL",
      "city: varchar(100) NOT NULL",
      "specification_tier: enum('BASIC','STANDARD','PREMIUM')",
      "budget_target_inr: numeric(12,2)",
      "current_stage: varchar(50) DEFAULT 'PHASE_1_PLANNING'",
      "status: enum('PLANNING','EXCAVATION','STRUCTURE','MEP','FINISHING','HANDOVER')"
    ]
  },
  WBS_Stages: {
    name: "WBS & Stage Gates",
    table: "wbs_stages",
    pk: "stage_id (UUID)",
    fk: "project_id -> projects(id)",
    description: "Critical Path Method (CPM) milestone gates governing physical lock on consecutive construction steps.",
    fields: [
      "id: uuid PRIMARY KEY",
      "project_id: uuid REFERENCES projects(id)",
      "stage_number: integer NOT NULL (1 to 6)",
      "stage_name: varchar(100) NOT NULL",
      "is_code_governance: varchar(100)",
      "escrow_percentage: numeric(5,2)",
      "status: enum('PENDING','IN_PROGRESS','AUDIT_READY','PASSED','LOCKED')",
      "signed_off_by: uuid REFERENCES users(id)",
      "sign_off_date: timestamp"
    ]
  },
  BOQ_Items: {
    name: "BOQ Line Items",
    table: "boq_items",
    pk: "boq_id (UUID)",
    fk: "project_id -> projects(id)",
    description: "Itemized CPWD-DSR bill of quantities tracking standardized consumption coefficients and unit rates.",
    fields: [
      "id: uuid PRIMARY KEY",
      "project_id: uuid REFERENCES projects(id)",
      "item_code: varchar(50) NOT NULL",
      "category: enum('CIVIL','MEP','FINISHING','JOINERY','MISC')",
      "material_name: varchar(150) NOT NULL",
      "unit_of_measure: varchar(20) (Bags, MT, CFT, Sq.Ft)",
      "consumption_coefficient: numeric(8,4)",
      "estimated_quantity: numeric(10,2)",
      "contractor_rate_inr: numeric(10,2)",
      "total_item_cost_inr: numeric(12,2)"
    ]
  },
  Quality_Checklists: {
    name: "IS Quality Checklists",
    table: "quality_checklists",
    pk: "check_id (UUID)",
    fk: "stage_id -> wbs_stages(id), auditor_id -> users(id)",
    description: "On-site digital field audit inspections verifying slump tests, cube tests, Megger tests, and hydro-tests.",
    fields: [
      "id: uuid PRIMARY KEY",
      "stage_id: uuid REFERENCES wbs_stages(id)",
      "auditor_id: uuid REFERENCES users(id)",
      "test_name: varchar(150) NOT NULL",
      "is_standard_code: varchar(50) (e.g. 'IS 456', 'IS 15778')",
      "target_benchmark: varchar(100)",
      "field_observed_value: varchar(100)",
      "status: enum('PASS','FAIL','CONDITIONAL_APPROVAL')",
      "geo_lat_lng: point",
      "photo_evidence_url: text"
    ]
  },
  Snag_List: {
    name: "Snags & Defect Registry",
    table: "snag_items",
    pk: "snag_id (UUID)",
    fk: "project_id -> projects(id), assigned_to -> users(id)",
    description: "Pre-handover defect tracking pinned to 2D CAD floor plans with contractor resolution deadlines.",
    fields: [
      "id: uuid PRIMARY KEY",
      "project_id: uuid REFERENCES projects(id)",
      "location_tag: varchar(100) NOT NULL",
      "defect_description: text NOT NULL",
      "severity: enum('MINOR','MAJOR','CRITICAL')",
      "assigned_contractor_id: uuid REFERENCES users(id)",
      "status: enum('OPEN','IN_RECTIFICATION','RESOLVED','VERIFIED')",
      "rectification_deadline: date",
      "resolved_at: timestamp"
    ]
  }
};

interface SnagItem {
  id: string;
  location: string;
  desc: string;
  severity: 'Minor' | 'Major' | 'Critical';
  status: 'OPEN' | 'RESOLVED';
  assignedTo: string;
  createdAt: string;
  x: number;
  y: number;
  roomKey: string;
}

export const GrihaNirmanSuperApp: React.FC<GrihaNirmanSuperAppProps> = ({
  onOpenIntake,
  className = ''
}) => {
  // Navigation Section Selector
  const [activeSection, setActiveSection] = useState<'lifecycle' | 'materials' | 'calculator' | 'superapp' | 'simulator'>('simulator');

  // Section 1: Lifecycle State
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1);
  const selectedPhase = useMemo(() => {
    return LIFECYCLE_PHASES.find(p => p.id === selectedPhaseId) || LIFECYCLE_PHASES[0];
  }, [selectedPhaseId]);

  // Section 2: Material Filter State
  const [materialFilter, setMaterialFilter] = useState<'all' | 'structural' | 'masonry' | 'mep' | 'finishing'>('all');
  const filteredMaterials = useMemo(() => {
    if (materialFilter === 'all') return MATERIALS_DATA;
    return MATERIALS_DATA.filter(m => m.category === materialFilter);
  }, [materialFilter]);

  // Section 3: Calculator State
  const [builtupArea, setBuiltupArea] = useState<number>(2000);
  const [qualityTier, setQualityTier] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [calcTab, setCalcTab] = useState<'budget' | 'boq'>('budget');

  const tierRates = {
    basic: { rate: 1600, label: 'Basic Finish (CPWD Spec)' },
    standard: { rate: 2200, label: 'Standard Mid-Range (Engineered)' },
    premium: { rate: 3500, label: 'Premium / High-End Villa' }
  };

  const currentRate = tierRates[qualityTier].rate;
  const totalEstimatedCost = builtupArea * currentRate;

  // Budget Splits (Standard 70:30 material-labor civil baseline)
  const budgetSplits = useMemo(() => {
    return [
      { name: 'Civil Structure', pct: 48, amount: totalEstimatedCost * 0.48, color: '#0F172A', desc: 'Foundation, RCC frame, masonry & plaster' },
      { name: 'MEP Services', pct: 14, amount: totalEstimatedCost * 0.14, color: '#D97706', desc: 'Electrical wiring, CPVC plumbing & HVAC sleeves' },
      { name: 'Finishing & Tiles', pct: 20, amount: totalEstimatedCost * 0.20, color: '#10B981', desc: 'Vitrified tiles, paint, waterproofing & sanitary' },
      { name: 'Joinery & Windows', pct: 12, amount: totalEstimatedCost * 0.12, color: '#6366F1', desc: 'UPVC/Al windows, flush doors & hardware' },
      { name: 'Approvals & NOCs', pct: 3, amount: totalEstimatedCost * 0.03, color: '#8B5CF6', desc: 'LDA/GDA map sanction, soil test & vetting' },
      { name: 'Contingency', pct: 3, amount: totalEstimatedCost * 0.03, color: '#64748B', desc: 'Material price buffer & unforeseen works' }
    ];
  }, [totalEstimatedCost]);

  // Calculated BOQ quantities based on civil engineering empirical constants
  const boqQuantities = useMemo(() => {
    return [
      { item: 'Cement (OPC 53 & PPC)', factor: '0.40 Bags / sq.ft', qty: `${Math.round(builtupArea * 0.40).toLocaleString('en-IN')} Bags`, rateRange: '₹380 - ₹430 / bag', estTotal: Math.round(builtupArea * 0.40 * 405) },
      { item: 'TMT Reinforcement Steel (Fe 500D/550D)', factor: '3.25 kg / sq.ft', qty: `${(builtupArea * 3.25 / 1000).toFixed(2)} MT`, rateRange: '₹65 - ₹80 / kg', estTotal: Math.round(builtupArea * 3.25 * 72) },
      { item: 'M-Sand (Concreting Sand Zone-II)', factor: '1.70 cft / sq.ft', qty: `${Math.round(builtupArea * 1.70).toLocaleString('en-IN')} cft`, rateRange: '₹50 - ₹65 / cft', estTotal: Math.round(builtupArea * 1.70 * 58) },
      { item: 'P-Sand (Plastering Fine Sand)', factor: '0.55 cft / sq.ft', qty: `${Math.round(builtupArea * 0.55).toLocaleString('en-IN')} cft`, rateRange: '₹55 - ₹70 / cft', estTotal: Math.round(builtupArea * 0.55 * 62) },
      { item: 'Coarse Aggregate (20mm & 10mm)', factor: '1.30 cft / sq.ft', qty: `${Math.round(builtupArea * 1.30).toLocaleString('en-IN')} cft`, rateRange: '₹40 - ₹55 / cft', estTotal: Math.round(builtupArea * 1.30 * 48) },
      { item: 'AAC Lightweight Blocks (600x200x150)', factor: '20 Units / sq.ft', qty: `${Math.round(builtupArea * 20).toLocaleString('en-IN')} Nos`, rateRange: '₹9 - ₹12 / block', estTotal: Math.round(builtupArea * 20 * 10.5) },
      { item: 'Vitrified Flooring & Wall Tiles', factor: '1.30 sq.ft / sq.ft', qty: `${Math.round(builtupArea * 1.30).toLocaleString('en-IN')} sq.ft`, rateRange: '₹55 - ₹90 / sq.ft', estTotal: Math.round(builtupArea * 1.30 * 70) }
    ];
  }, [builtupArea]);

  // Section 4: DB Schema State
  const [selectedDbTable, setSelectedDbTable] = useState<string>('Users');

  // Section 5: Simulator State
  const [slumpStatus, setSlumpStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [hydroStatus, setHydroStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [pondStatus, setPondStatus] = useState<'PASS' | 'FAIL'>('PASS');
  const [coverStatus, setCoverStatus] = useState<'PASS' | 'FAIL'>('PASS');

  const allAuditsPassed = slumpStatus === 'PASS' && hydroStatus === 'PASS' && pondStatus === 'PASS' && coverStatus === 'PASS';

  // Digital Snags & 2D Floor Plan Visualization State
  const [snagViewMode, setSnagViewMode] = useState<'blueprint' | 'list'>('blueprint');
  const [selectedRoomKey, setSelectedRoomKey] = useState<string>('master_bed');
  const [activePinId, setActivePinId] = useState<string | null>('snag-1');
  const [snagSeverityFilter, setSnagSeverityFilter] = useState<'ALL' | 'OPEN' | 'CRITICAL' | 'RESOLVED'>('ALL');
  const [clickedPinTarget, setClickedPinTarget] = useState<{ x: number; y: number } | null>(null);

  // 2D Floor Plan Drawing / Sketch Markup Tool State
  const [drawingTool, setDrawingTool] = useState<'select' | 'circle' | 'freehand' | 'rectangle' | 'arrow'>('select');
  const [drawColor, setDrawColor] = useState<string>('#EF4444');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState<number>(3);
  const [showMarkups, setShowMarkups] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentShape, setCurrentShape] = useState<MarkupShape | null>(null);
  const [activeMarkupId, setActiveMarkupId] = useState<string | null>(null);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const blueprintContainerRef = useRef<HTMLDivElement>(null);

  // Preloaded interactive sketch markups around defects
  const [markups, setMarkups] = useState<MarkupShape[]>([
    {
      id: 'markup-1',
      type: 'circle',
      color: '#F59E0B',
      strokeWidth: 3,
      label: 'En-Suite Grout Inspection Zone',
      startX: 9,
      startY: 55,
      endX: 21,
      endY: 71,
      snagId: 'snag-1'
    },
    {
      id: 'markup-2',
      type: 'circle',
      color: '#EF4444',
      strokeWidth: 3,
      label: '16A Power Point Earthing Ring',
      startX: 67,
      startY: 52,
      endX: 79,
      endY: 64,
      snagId: 'snag-3'
    },
    {
      id: 'markup-3',
      type: 'arrow',
      color: '#F97316',
      strokeWidth: 3,
      label: 'SWR Collar Joint Re-Check Vector',
      startX: 60,
      startY: 15,
      endX: 72,
      endY: 22,
      snagId: 'snag-2'
    }
  ]);

  const [snagLocation, setSnagLocation] = useState<string>('Master Bedroom');
  const [snagDesc, setSnagDesc] = useState<string>('');
  const [snagSeverity, setSnagSeverity] = useState<'Minor' | 'Major' | 'Critical'>('Minor');
  
  const [snags, setSnags] = useState<SnagItem[]>([
    {
      id: 'snag-1',
      location: 'Master En-Suite Bath',
      desc: 'Tile grout hairline gap near shower drain trap',
      severity: 'Minor',
      status: 'OPEN',
      assignedTo: 'Tiling Contractor (Civil Team B)',
      createdAt: 'Today, 10:45 AM',
      x: 15,
      y: 63,
      roomKey: 'master_bath'
    },
    {
      id: 'snag-2',
      location: 'Modular Kitchen & Utility',
      desc: 'SWR PVC collar joint needs silicone solvent weld re-check',
      severity: 'Major',
      status: 'OPEN',
      assignedTo: 'Plumbing Subcontractor',
      createdAt: 'Yesterday, 04:20 PM',
      x: 73,
      y: 22,
      roomKey: 'kitchen'
    },
    {
      id: 'snag-3',
      location: 'Living & Dining Hall',
      desc: '16A power point earthing loop resistance high (>2.5Ω)',
      severity: 'Critical',
      status: 'OPEN',
      assignedTo: 'Electrical Lead Engineer',
      createdAt: 'Today, 02:15 PM',
      x: 73,
      y: 58,
      roomKey: 'living'
    },
    {
      id: 'snag-4',
      location: 'Sit-out Balcony & Terrace',
      desc: 'Parapet coping plaster slope correction required towards drain',
      severity: 'Minor',
      status: 'RESOLVED',
      assignedTo: 'Finishing Supervisor',
      createdAt: '2 days ago',
      x: 73,
      y: 87,
      roomKey: 'balcony'
    }
  ]);

  // Handle Room Selection from dropdown/presets
  const handleSelectRoom = (roomKey: string) => {
    const room = BLUEPRINT_ROOMS.find(r => r.key === roomKey);
    if (room) {
      setSelectedRoomKey(roomKey);
      setSnagLocation(room.name);
      setClickedPinTarget({ x: room.defaultPinX, y: room.defaultPinY });
    }
  };

  // Helper to extract normalized percentage coordinates (0 - 100%) from pointer events
  const getCanvasRelativeCoords = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const x = Math.min(99, Math.max(1, rawX));
    const y = Math.min(99, Math.max(1, rawY));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  // Drawing Tool Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drawingTool === 'select') {
      return; // Handled by canvas click for placing pin
    }
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const { x, y } = getCanvasRelativeCoords(e);
    setIsDrawing(true);

    const activeSnag = snags.find(s => s.id === activePinId);
    const newShape: MarkupShape = {
      id: `markup-${Date.now()}`,
      type: drawingTool,
      color: drawColor,
      strokeWidth: drawStrokeWidth,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      points: drawingTool === 'freehand' ? [{ x, y }] : undefined,
      snagId: activePinId || undefined,
      label: activeSnag ? `Markup for ${activeSnag.location}` : undefined
    };

    setCurrentShape(newShape);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentShape) return;
    e.preventDefault();
    const { x, y } = getCanvasRelativeCoords(e);

    if (currentShape.type === 'freehand') {
      setCurrentShape(prev => prev ? {
        ...prev,
        endX: x,
        endY: y,
        points: [...(prev.points || []), { x, y }]
      } : null);
    } else {
      setCurrentShape(prev => prev ? {
        ...prev,
        endX: x,
        endY: y
      } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentShape) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDrawing(false);

    const dx = Math.abs(currentShape.endX - currentShape.startX);
    const dy = Math.abs(currentShape.endY - currentShape.startY);
    const isFreehandLongEnough = currentShape.type === 'freehand' && (currentShape.points?.length || 0) > 2;

    if (dx > 1 || dy > 1 || isFreehandLongEnough) {
      setMarkups(prev => [...prev, currentShape]);
      setActiveMarkupId(currentShape.id);
    }
    setCurrentShape(null);
  };

  // Instant Auto-Circle Around Selected / Active Snag
  const handleAutoCircleSnag = (snag: SnagItem) => {
    const radius = 6;
    const newCircleMarkup: MarkupShape = {
      id: `markup-auto-${Date.now()}`,
      type: 'circle',
      color: snag.severity === 'Critical' ? '#EF4444' : snag.severity === 'Major' ? '#F97316' : '#F59E0B',
      strokeWidth: 3,
      startX: Math.max(2, snag.x - radius),
      startY: Math.max(2, snag.y - radius),
      endX: Math.min(98, snag.x + radius),
      endY: Math.min(98, snag.y + radius),
      label: `Circle Annotation: ${snag.location}`,
      snagId: snag.id
    };
    setMarkups(prev => [...prev, newCircleMarkup]);
    setActiveMarkupId(newCircleMarkup.id);
    setShowMarkups(true);
  };

  // Undo Last Markup
  const handleUndoMarkup = () => {
    setMarkups(prev => prev.slice(0, -1));
  };

  // Clear All Markups
  const handleClearAllMarkups = () => {
    setMarkups([]);
    setActiveMarkupId(null);
  };

  // Export / Print Markup Summary
  const handleExportMarkupPlan = () => {
    setExportNotification(`CAD Floor Plan with ${markups.length} Markup Annotations exported successfully.`);
    setTimeout(() => setExportNotification(null), 4500);
  };

  // Handle Blueprint Canvas Click to drop/target pin
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawingTool !== 'select') return; // Do not place pins if currently in sketch mode

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Detect which room was clicked
    const matchedRoom = BLUEPRINT_ROOMS.find(r => 
      clickX >= r.x && clickX <= (r.x + r.w) &&
      clickY >= r.y && clickY <= (r.y + r.h)
    );

    const targetX = Math.round(clickX);
    const targetY = Math.round(clickY);

    setClickedPinTarget({ x: targetX, y: targetY });

    if (matchedRoom) {
      setSelectedRoomKey(matchedRoom.key);
      setSnagLocation(matchedRoom.name);
    } else {
      setSnagLocation(`Corridor Point (${targetX}%, ${targetY}%)`);
    }
  };

  const handleAddSnag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snagLocation || !snagDesc) return;

    const matchedRoom = BLUEPRINT_ROOMS.find(r => r.key === selectedRoomKey);
    const pinX = clickedPinTarget ? clickedPinTarget.x : (matchedRoom ? matchedRoom.defaultPinX : 50);
    const pinY = clickedPinTarget ? clickedPinTarget.y : (matchedRoom ? matchedRoom.defaultPinY : 50);

    const newSnag: SnagItem = {
      id: `snag-${Date.now()}`,
      location: snagLocation,
      desc: snagDesc,
      severity: snagSeverity,
      status: 'OPEN',
      assignedTo: snagSeverity === 'Critical' ? 'Structural/Safety Lead' : 'On-Site Finishing Supervisor',
      createdAt: 'Just now',
      x: pinX,
      y: pinY,
      roomKey: selectedRoomKey
    };

    setSnags([newSnag, ...snags]);
    setActivePinId(newSnag.id);
    setSnagDesc('');
    setClickedPinTarget(null);
  };

  const handleToggleSnagStatus = (id: string) => {
    setSnags(snags.map(s => s.id === id ? { ...s, status: s.status === 'OPEN' ? 'RESOLVED' : 'OPEN' } : s));
  };

  const handleDeleteSnag = (id: string) => {
    setSnags(snags.filter(s => s.id !== id));
    if (activePinId === id) setActivePinId(null);
  };

  // Filtered snags for floor plan & list
  const displayedSnags = useMemo(() => {
    if (snagSeverityFilter === 'OPEN') return snags.filter(s => s.status === 'OPEN');
    if (snagSeverityFilter === 'CRITICAL') return snags.filter(s => s.severity === 'Critical');
    if (snagSeverityFilter === 'RESOLVED') return snags.filter(s => s.status === 'RESOLVED');
    return snags;
  }, [snags, snagSeverityFilter]);

  const activeSelectedSnag = useMemo(() => {
    return snags.find(s => s.id === activePinId) || null;
  }, [snags, activePinId]);

  const openSnagsCount = useMemo(() => snags.filter(s => s.status === 'OPEN').length, [snags]);
  const criticalSnagsCount = useMemo(() => snags.filter(s => s.severity === 'Critical' && s.status === 'OPEN').length, [snags]);
  const resolvedSnagsCount = useMemo(() => snags.filter(s => s.status === 'RESOLVED').length, [snags]);

  return (
    <div className={`space-y-10 ${className}`}>
      
      {/* =========================================================================
          HERO BANNER: GRIHA NIRMAN 360° SUPER-APP OS
         ========================================================================= */}
      <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wide">
              <AppIcon name="construction" size="sm" decorative className="text-amber-400" />
              <span>Griha Nirman 360° Construction Super-App OS</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              NBC 2016 & BIS Engineering Standard Compliant
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Zamin se lekar <span className="text-amber-400">Grihapravesh</span> tak ka complete solution
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              Integrated stage-gate execution roadmap, Bureau of Indian Standards (BIS) material taxonomy, dynamic BOQ quantity surveyor, relational database architecture, and live digital snagging simulator.
            </p>
          </div>

          {/* 4 Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
              <div className="text-amber-400 text-xl font-black">6 Stages</div>
              <div className="text-slate-400 text-[11px]">Integrated Milestone Gates</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
              <div className="text-amber-400 text-xl font-black">15+ IS Codes</div>
              <div className="text-slate-400 text-[11px]">BIS Tested Specifications</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
              <div className="text-amber-400 text-xl font-black">6 DB Modules</div>
              <div className="text-slate-400 text-[11px]">Enterprise Cloud Schema</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
              <div className="text-amber-400 text-xl font-black">70 : 30</div>
              <div className="text-slate-400 text-[11px]">Material-to-Labor Ratio</div>
            </div>
          </div>

          {/* Interactive Top-Level Nav Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {[
              { id: 'lifecycle', label: '1. 6-Phase Lifecycle', icon: Layers },
              { id: 'materials', label: '2. Material & IS Codes', icon: ShieldCheck },
              { id: 'calculator', label: '3. Budget & BOQ Estimator', icon: Calculator },
              { id: 'superapp', label: '4. Super-App Architecture', icon: Database },
              { id: 'simulator', label: '5. Quality & Snag Simulator', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* =========================================================================
          SECTION 1: 6-PHASE CONSTRUCTION LIFECYCLE (Zamin to Grihapravesh)
         ========================================================================= */}
      {activeSection === 'lifecycle' && (
        <section className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-amber-700 font-bold text-xs uppercase tracking-wider block">
                Phase-Wise Engineering Roadmap
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                1. Land Acquisition to Grihapravesh Handover
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Click each stage to inspect core deliverables, BIS standards & gate rules.
            </span>
          </div>

          {/* 6 Stage Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {LIFECYCLE_PHASES.map((phase) => {
              const isSelected = selectedPhaseId === phase.id;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => setSelectedPhaseId(phase.id)}
                  className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500 shadow-sm'
                      : 'bg-[var(--color-surface)] border-slate-200 hover:border-amber-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <AppIcon name={phase.icon} size="lg" decorative className="text-amber-500" />
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-500'
                    }`}>
                      Phase {phase.stageNum}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-black text-slate-900 leading-tight">
                      {phase.title.replace(/^Phase \d+: /, '')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Phase Details Display Card */}
          <Card className="bg-[var(--color-surface)] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3.5">
                <span className="p-3 bg-amber-100 rounded-2xl inline-flex"><AppIcon name={selectedPhase.icon} size="xl" decorative className="text-amber-600" /></span>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{selectedPhase.title}</h3>
                  <p className="text-xs text-amber-700 font-bold">{selectedPhase.subtitle}</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-xl font-bold border border-slate-200">
                {selectedPhase.codes}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
              
              {/* Deliverables Column */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] text-amber-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Core Engineering Deliverables</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedPhase.activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality & Execution Gate Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Quality Verification Metrics</span>
                  </h4>
                  <p className="text-slate-800 font-semibold leading-relaxed">
                    {selectedPhase.qualityMetrics}
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Critical Execution Gate Rule</span>
                  </h4>
                  <p className="text-amber-950 font-bold leading-relaxed">
                    {selectedPhase.executionRule}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold"
                    onClick={() => onOpenIntake?.(`Supervise Phase ${selectedPhase.stageNum}: ${selectedPhase.title}`, 'CONSTRUCTION')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 text-amber-400" />}
                  >
                    Deploy Supervision for Phase {selectedPhase.stageNum}
                  </Button>
                </div>
              </div>

            </div>
          </Card>

        </section>
      )}

      {/* =========================================================================
          SECTION 2: MATERIAL TAXONOMY & BIS COMPLIANCE
         ========================================================================= */}
      {activeSection === 'materials' && (
        <section className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-amber-700 font-bold text-xs uppercase tracking-wider block">
                BIS Specifications & Field Quality Benchmarks
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                2. Construction Material Taxonomy & Testing Standards
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Filter by material category to check standard grades & mandatory tests.
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Materials' },
              { id: 'structural', label: 'Structural (Cement & Steel)' },
              { id: 'masonry', label: 'Masonry & Aggregates' },
              { id: 'mep', label: 'MEP (Plumbing & Electrical)' },
              { id: 'finishing', label: 'Finishing & Waterproofing' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMaterialFilter(f.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  materialFilter === f.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-[var(--color-surface)] text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMaterials.map((item, idx) => (
              <Card key={idx} className="bg-[var(--color-surface)] border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{item.name}</h3>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded shrink-0">
                      {item.isCode}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Standard Grades</span>
                      <span className="text-slate-800 font-bold">{item.grades}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Mandatory Field Testing</span>
                      <span className="text-slate-600 leading-relaxed block">{item.testing}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-semibold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span>Benchmark: {item.benchmark}</span>
                </div>
              </Card>
            ))}
          </div>

        </section>
      )}

      {/* =========================================================================
          SECTION 3: BUDGET & BOQ RAW MATERIAL CALCULATOR
         ========================================================================= */}
      {activeSection === 'calculator' && (
        <section className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-amber-700 font-bold text-xs uppercase tracking-wider block">
                Quantity Surveying & Cost Estimation
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                3. Project Budget & Raw Material BOQ Estimator
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Empirical formulas calculate exact cement, steel, sand & aggregate quantities.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Controls (5 cols) */}
            <Card className="lg:col-span-5 bg-[var(--color-surface)] border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Project Parameters</span>
              </h3>

              <div className="space-y-5 text-xs">
                {/* Builtup Area Input */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Built-Up Area (sq. ft.):</span>
                    <span className="text-slate-900 font-extrabold text-sm">
                      {builtupArea.toLocaleString('en-IN')} sq. ft.
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="100"
                    value={builtupArea}
                    onChange={(e) => setBuiltupArea(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[1000, 1500, 2000, 3000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBuiltupArea(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          builtupArea === preset ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {preset.toLocaleString()} sq.ft
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Tier Select */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Specification / Quality Tier</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(tierRates) as Array<keyof typeof tierRates>).map((tierKey) => (
                      <button
                        key={tierKey}
                        type="button"
                        onClick={() => setQualityTier(tierKey)}
                        className={`p-3 rounded-2xl border text-left flex justify-between items-center transition-all ${
                          qualityTier === tierKey
                            ? 'border-amber-500 bg-amber-50/50 text-slate-900 ring-1 ring-amber-500'
                            : 'border-slate-200 bg-[var(--color-surface)] text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-xs">{tierRates[tierKey].label}</div>
                          <div className="text-[10px] text-slate-500 font-mono">₹{tierRates[tierKey].rate} / sq.ft</div>
                        </div>
                        {qualityTier === tierKey && <Check className="w-4 h-4 text-amber-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Investment Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 space-y-1 text-center">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block">
                    Estimated Total Civil & Finishing Budget
                  </span>
                  <div className="text-3xl font-black text-amber-900">
                    ₹{totalEstimatedCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-amber-800 font-bold">
                    ~{(totalEstimatedCost / 100000).toFixed(2)} Lakhs INR (@ ₹{currentRate}/sq.ft)
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold"
                  onClick={() => onOpenIntake?.(`Get Verified BOQ Tender for ${builtupArea} sq.ft (${qualityTier} finish)`, 'CONSTRUCTION')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Request Contractor BOQ Tender Quote
                </Button>
              </div>
            </Card>

            {/* Right Side Visualizations & Tables (7 cols) */}
            <div className="lg:col-span-7 bg-[var(--color-surface)] border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcTab('budget')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      calcTab === 'budget' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Budget Allocation Split (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcTab('boq')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      calcTab === 'boq' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Raw Material Quantities (BOQ)
                  </button>
                </div>
              </div>

              {/* View 1: Budget Allocation Split */}
              {calcTab === 'budget' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-3">
                    {budgetSplits.map((item, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-slate-900">{item.name} ({item.pct}%)</span>
                          <span className="font-mono font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                        </div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Distribution based on 70:30 Material-to-Labor standard civil benchmarks.
                  </p>
                </div>
              )}

              {/* View 2: Raw Material BOQ Table */}
              {calcTab === 'boq' && (
                <div className="overflow-x-auto animate-fadeIn">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-900 font-extrabold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Material Specification</th>
                        <th className="p-2.5">Consumption Factor</th>
                        <th className="p-2.5">Required Quantity</th>
                        <th className="p-2.5">Unit Rate Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {boqQuantities.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{row.item}</td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">{row.factor}</td>
                          <td className="p-2.5 font-extrabold text-amber-700">{row.qty}</td>
                          <td className="p-2.5 font-mono text-slate-600 text-[11px]">{row.rateRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>

        </section>
      )}

      {/* =========================================================================
          SECTION 4: ENTERPRISE SUPER-APP ARCHITECTURE & DB SCHEMA
         ========================================================================= */}
      {activeSection === 'superapp' && (
        <section className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-amber-700 font-bold text-xs uppercase tracking-wider block">
                Digital Operating System Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                4. Construction Super-App Digital Blueprint
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              6 functional cloud modules & interactive relational PostgreSQL schema explorer.
            </span>
          </div>

          {/* 6 Super-App Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'WBS & Stage-Gate Governance', desc: 'CPM/PERT schedule tracking. Automatically locks slab pour tasks until structural engineers sign off on rebar checklists.' },
              { num: '02', title: 'Automated Material & BOM Engine', desc: 'Links built-up sq ft to live BOM models. Automated PO generation, site GRN receipt OCR scan, and stock re-order triggers.' },
              { num: '03', title: 'DPR & Labor HRMS', desc: 'Geo-fenced facial attendance for labor, daily progress logs, concrete pour records, and client WhatsApp status updates.' },
              { num: '04', title: 'Quality Assurance & Digital Snagging', desc: 'Mobile BIS inspection checklists. Pin geotagged defect photos to 2D CAD floor plans with contractor resolution deadlines.' },
              { num: '05', title: 'Financial Ledger & Milestone Escrow', desc: 'Milestone-linked contractor disbursements. Automatic billing statements and real-time cost variance vs initial budget.' },
              { num: '06', title: 'Document Vault & Handover Portal', desc: 'Central storage for OC/CC certificates, structural calculations, warranties, and final Grihapravesh digital handover pack.' },
            ].map((m) => (
              <Card key={m.num} className="bg-[var(--color-surface)] border border-slate-200 p-5 rounded-3xl space-y-2 hover:border-amber-400 transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold text-xs">
                  {m.num}
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">{m.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{m.desc}</p>
              </Card>
            ))}
          </div>

          {/* Tech Stack Bar */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 text-white space-y-4">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Enterprise Super-App Production Tech Stack
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 text-[11px]">Mobile & Web</span>
                <strong className="text-white font-bold">React 19 / Vite / Tailwind</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 text-[11px]">Backend Services</span>
                <strong className="text-white font-bold">Node.js (Express/NestJS)</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 text-[11px]">Database & Cache</span>
                <strong className="text-white font-bold">PostgreSQL / Drizzle ORM</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 text-[11px]">Document & AI</span>
                <strong className="text-white font-bold">Gemini 2.5 / OCR Vision</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 text-[11px]">Cloud Ingress</span>
                <strong className="text-white font-bold">Google Cloud Run / Nginx</strong>
              </div>
            </div>
          </div>

          {/* Interactive Database Entity Inspector */}
          <Card className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 text-white space-y-5">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Interactive Relational Database Schema Explorer</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a database entity to view its Primary Keys, Foreign Key relations, and Core Drizzle/PostgreSQL schema attributes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Entity Selector Buttons */}
              <div className="md:col-span-4 space-y-2">
                {Object.keys(DB_SCHEMA_DATA).map((key) => {
                  const isSelected = selectedDbTable === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDbTable(key)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{DB_SCHEMA_DATA[key].name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {DB_SCHEMA_DATA[key].table}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Entity Details Card */}
              <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white font-mono">
                      Table: {DB_SCHEMA_DATA[selectedDbTable].table}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{DB_SCHEMA_DATA[selectedDbTable].description}</p>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-2.5 py-1 rounded-full border border-slate-700">
                    PostgreSQL Table
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">Primary Key</span>
                    <span className="font-mono text-amber-300 font-bold text-[11px]">{DB_SCHEMA_DATA[selectedDbTable].pk}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">Foreign Key References</span>
                    <span className="font-mono text-slate-300 font-bold text-[11px]">{DB_SCHEMA_DATA[selectedDbTable].fk}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Core Schema Attributes & Types</span>
                  <ul className="space-y-1.5 font-mono text-slate-300 text-[11px]">
                    {DB_SCHEMA_DATA[selectedDbTable].fields.map((f, i) => (
                      <li key={i} className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2">
                        <span className="text-amber-500 font-bold">▸</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

        </section>
      )}

      {/* =========================================================================
          SECTION 5: LIVE QUALITY AUDIT & DIGITAL SNAGGING SIMULATOR
         ========================================================================= */}
      {activeSection === 'simulator' && (
        <section className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-amber-700 font-bold text-xs uppercase tracking-wider block">
                Super-App Feature Interactive Demo
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                5. Live Quality Audit & Snagging Simulator
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Interactive stage-gate testing simulation and live pre-handover defect tracking.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Box A: Inspection Audit Form */}
            <Card className="bg-[var(--color-surface)] border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Field Quality Checklist Audit</span>
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                  Live Stage Gate
                </span>
              </div>

              <div className="space-y-3 text-xs">
                
                {/* Slump Test */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-900">IS 456 Concrete Slump Test</div>
                    <div className="text-slate-500 text-[11px]">Target: 75mm - 100mm for M25 Pumpable RMC</div>
                  </div>
                  <select
                    value={slumpStatus}
                    onChange={(e) => setSlumpStatus(e.target.value as any)}
                    className={`font-bold px-3 py-1.5 rounded-xl border text-xs cursor-pointer focus:outline-hidden ${
                      slumpStatus === 'PASS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <option value="PASS">PASS (95mm)</option>
                    <option value="FAIL">FAIL (&lt;50mm Dry)</option>
                  </select>
                </div>

                {/* CPVC Hydro Test */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-900">IS 15778 CPVC Hydrostatic Test</div>
                    <div className="text-slate-500 text-[11px]">Hold 10 bar pressure for 24 Hours</div>
                  </div>
                  <select
                    value={hydroStatus}
                    onChange={(e) => setHydroStatus(e.target.value as any)}
                    className={`font-bold px-3 py-1.5 rounded-xl border text-xs cursor-pointer focus:outline-hidden ${
                      hydroStatus === 'PASS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <option value="PASS">PASS (Zero Drop)</option>
                    <option value="FAIL">FAIL (Pressure Loss)</option>
                  </select>
                </div>

                {/* 72-Hour Ponding Test */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-900">72-Hour Terrace Ponding Test</div>
                    <div className="text-slate-500 text-[11px]">Check bottom slab soffit for dampness</div>
                  </div>
                  <select
                    value={pondStatus}
                    onChange={(e) => setPondStatus(e.target.value as any)}
                    className={`font-bold px-3 py-1.5 rounded-xl border text-xs cursor-pointer focus:outline-hidden ${
                      pondStatus === 'PASS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <option value="PASS">PASS (Dry Soffit)</option>
                    <option value="FAIL">FAIL (Seepage Drop)</option>
                  </select>
                </div>

                {/* 50mm Rebar Cover Block */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-900">IS 456 Minimum Clear Cover</div>
                    <div className="text-slate-500 text-[11px]">50mm for Footing / 20mm for Slabs</div>
                  </div>
                  <select
                    value={coverStatus}
                    onChange={(e) => setCoverStatus(e.target.value as any)}
                    className={`font-bold px-3 py-1.5 rounded-xl border text-xs cursor-pointer focus:outline-hidden ${
                      coverStatus === 'PASS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <option value="PASS">PASS (Cover Verified)</option>
                    <option value="FAIL">FAIL (Displaced Rebar)</option>
                  </select>
                </div>

              </div>

              {/* Status Outcome Banner */}
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
                allAuditsPassed
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border border-rose-200 text-rose-950'
              }`}>
                {allAuditsPassed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                    <div>
                      <div>All mandatory stage-gate quality audits cleared!</div>
                      <div className="text-[11px] text-emerald-800 font-normal mt-0.5">
                        Escrow milestone payout authorization code generated for contractor.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
                    <div>
                      <div>Stage-Gate Quality Audit FAILED!</div>
                      <div className="text-[11px] text-rose-800 font-normal mt-0.5">
                        Subcontractor payment automatically locked until rectification and re-inspection sign-off.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Box B: Digital Snagging Defect Tracker with 2D Floor Plan Overlay */}
            <Card className="bg-[var(--color-surface)] border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 lg:col-span-2">
              
              {/* Header & View Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                      Digital Snagging Defect Tracker & 2D Spatial Mapper
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-Grihapravesh punch list mapped directly to 2D CAD architectural floor plan.
                  </p>
                </div>

                {/* View Mode Toggle Button Group */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSnagViewMode('blueprint')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        snagViewMode === 'blueprint'
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-[var(--color-surface)]/60'
                      }`}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      <span>2D Floor Plan Blueprint</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSnagViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        snagViewMode === 'list'
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-[var(--color-surface)]/60'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List View ({snags.length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Filter Chips & Quick Metrics Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1 uppercase">Filter Pins:</span>
                  {[
                    { id: 'ALL', label: `All (${snags.length})` },
                    { id: 'OPEN', label: `Open (${openSnagsCount})` },
                    { id: 'CRITICAL', label: `Critical (${criticalSnagsCount})` },
                    { id: 'RESOLVED', label: `Resolved (${resolvedSnagsCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSnagSeverityFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        snagSeverityFilter === f.id
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-[var(--color-surface)] text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-600 font-mono font-bold flex items-center gap-2">
                  <span className="text-slate-400">Clearance Rate:</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-black">
                    {snags.length > 0 ? Math.round((resolvedSnagsCount / snags.length) * 100) : 100}% Cleared
                  </span>
                </div>
              </div>

              {/* Snag Intake Form */}
              <form onSubmit={handleAddSnag} className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log New Pre-Handover Snag</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-1">
                    <AppIcon name="help" size="xs" decorative />
                    Click on floor plan to auto-set spatial pin coordinates
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  
                  {/* Room Preset Selector */}
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Target Room / Zone</label>
                    <select
                      value={selectedRoomKey}
                      onChange={(e) => handleSelectRoom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-white focus:border-amber-400 focus:outline-hidden"
                    >
                      {BLUEPRINT_ROOMS.map(r => (
                        <option key={r.key} value={r.key}>{r.name} ({r.dimensions})</option>
                      ))}
                    </select>
                  </div>

                  {/* Severity Level */}
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Severity Classification</label>
                    <select
                      value={snagSeverity}
                      onChange={(e) => setSnagSeverity(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-white focus:border-amber-400 focus:outline-hidden"
                    >
                      <option value="Minor">Minor (Cosmetic / Paint / Grout)</option>
                      <option value="Major">Major (Plumbing / Joint / Alignment)</option>
                      <option value="Critical">Critical (Structure / Earthing / Leak)</option>
                    </select>
                  </div>

                  {/* Defect Location Tag */}
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1">Specific Location Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Bedroom North Wall"
                      value={snagLocation}
                      onChange={(e) => setSnagLocation(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-white focus:border-amber-400 focus:outline-hidden placeholder:text-slate-500"
                    />
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Defect summary (e.g. Hairline plaster crack near window lintel / hollow floor tile)"
                    value={snagDesc}
                    onChange={(e) => setSnagDesc(e.target.value)}
                    required
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-white focus:border-amber-400 focus:outline-hidden placeholder:text-slate-500 text-xs"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shrink-0 px-5"
                    leftIcon={<MapPin className="w-3.5 h-3.5" />}
                  >
                    Pin & Log Snag
                  </Button>
                </div>
              </form>

              {/* VIEW MODE 1: 2D FLOOR PLAN BLUEPRINT VISUALIZATION */}
              {snagViewMode === 'blueprint' && (
                <div className="space-y-3">
                  
                  {/* Export Notification Toast */}
                  {exportNotification && (
                    <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{exportNotification}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExportNotification(null)}
                        className="text-emerald-400 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Top Blueprint & Markup Action Bar */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
                    
                    {/* Upper row: Drawing Mode & Tool Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      
                      {/* Tool selection buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                        
                        {/* Select / Pin Tool */}
                        <button
                          type="button"
                          onClick={() => setDrawingTool('select')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            drawingTool === 'select'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Navigate floor plan, click rooms, and drop defect pins"
                        >
                          <MousePointer2 className="w-3.5 h-3.5" />
                          <span>Pin / Inspect</span>
                        </button>

                        {/* Circle Markup Tool */}
                        <button
                          type="button"
                          onClick={() => setDrawingTool('circle')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            drawingTool === 'circle'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Draw circle or ellipse around defect snag location"
                        >
                          <Circle className="w-3.5 h-3.5" />
                          <span>Circle Snag</span>
                        </button>

                        {/* Freehand Line Markup Tool */}
                        <button
                          type="button"
                          onClick={() => setDrawingTool('freehand')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            drawingTool === 'freehand'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Sketch freehand lines or underlinings on floor plan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Sketch Line</span>
                        </button>

                        {/* Rectangle Zone Tool */}
                        <button
                          type="button"
                          onClick={() => setDrawingTool('rectangle')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            drawingTool === 'rectangle'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Frame rectangular defect zones"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>Box Zone</span>
                        </button>

                        {/* Pointer Arrow Tool */}
                        <button
                          type="button"
                          onClick={() => setDrawingTool('arrow')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            drawingTool === 'arrow'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Draw directional arrow pointing directly to defect origin"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                          <span>Arrow Vector</span>
                        </button>

                      </div>

                      {/* Right Quick Actions */}
                      <div className="flex items-center gap-1.5">
                        
                        {/* Auto-Circle Active Snag Quick Preset */}
                        {activeSelectedSnag && (
                          <button
                            type="button"
                            onClick={() => handleAutoCircleSnag(activeSelectedSnag)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                            title="Auto-place a visual circle ring around active snag"
                          >
                            <Circle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Auto-Circle #{snags.findIndex(s => s.id === activeSelectedSnag.id) + 1}</span>
                          </button>
                        )}

                        {/* Undo Last Markup */}
                        <button
                          type="button"
                          onClick={handleUndoMarkup}
                          disabled={markups.length === 0}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-bold transition-all cursor-pointer"
                          title="Undo last drawing stroke"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Undo</span>
                        </button>

                        {/* Clear All Markups */}
                        <button
                          type="button"
                          onClick={handleClearAllMarkups}
                          disabled={markups.length === 0}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-bold transition-all cursor-pointer"
                          title="Clear all sketched markups"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Clear</span>
                        </button>

                        {/* Toggle Markups Layer Visibility */}
                        <button
                          type="button"
                          onClick={() => setShowMarkups(!showMarkups)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            showMarkups
                              ? 'bg-slate-800 border-slate-700 text-slate-200'
                              : 'bg-slate-800 border-amber-500/40 text-amber-300'
                          }`}
                          title="Show or hide sketched drawings"
                        >
                          {showMarkups ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                          <span className="hidden sm:inline">{showMarkups ? 'Markups On' : 'Hidden'}</span>
                        </button>

                        {/* Export Plan */}
                        <button
                          type="button"
                          onClick={handleExportMarkupPlan}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
                          title="Export floor plan with snag coordinates and visual markup annotations"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Export</span>
                        </button>

                      </div>

                    </div>

                    {/* Lower row: Color Palette & Stroke Width (shown when drawing tools are active) */}
                    {drawingTool !== 'select' && (
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono text-slate-400">Markup Color:</span>
                          <div className="flex items-center gap-1.5">
                            {[
                              { color: '#EF4444', label: 'Critical Red', ring: 'ring-rose-500' },
                              { color: '#F97316', label: 'Major Orange', ring: 'ring-orange-500' },
                              { color: '#F59E0B', label: 'Warning Amber', ring: 'ring-amber-500' },
                              { color: '#06B6D4', label: 'Cyan Spec', ring: 'ring-cyan-500' },
                              { color: '#10B981', label: 'Approved Green', ring: 'ring-emerald-500' }
                            ].map(c => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => setDrawColor(c.color)}
                                className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                                  drawColor === c.color ? `scale-125 ring-2 ${c.ring} ring-offset-2 ring-offset-slate-900` : 'opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c.color }}
                                title={c.label}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Stroke Thickness */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono text-slate-400">Stroke Thickness:</span>
                          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                            {[
                              { width: 2, label: 'Fine' },
                              { width: 3, label: 'Medium' },
                              { width: 5, label: 'Bold' }
                            ].map(sw => (
                              <button
                                key={sw.width}
                                type="button"
                                onClick={() => setDrawStrokeWidth(sw.width)}
                                className={`px-2 py-0.5 text-[11px] rounded-md font-mono font-bold transition-all cursor-pointer ${
                                  drawStrokeWidth === sw.width
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {sw.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Active Sketching Hint */}
                        <div className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                          <span>Drag on plan to draw {drawingTool} markup</span>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* 2D Blueprint Canvas Container */}
                  <div
                    ref={blueprintContainerRef}
                    onClick={handleCanvasClick}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className={`relative w-full aspect-[4/3] sm:aspect-[16/9] bg-[#0A101D] border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl select-none touch-none ${
                      drawingTool === 'select' ? 'cursor-crosshair' : 'cursor-crosshair'
                    }`}
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(51, 65, 85, 0.25) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(51, 65, 85, 0.25) 1px, transparent 1px)
                      `,
                      backgroundSize: '24px 24px'
                    }}
                  >
                    
                    {/* Outer Architectural Perimeter Wall */}
                    <div className="absolute inset-3 border-4 border-slate-500/80 rounded-2xl pointer-events-none" />
                    
                    {/* Dimension Lines (Blueprint Accents) */}
                    <div className="absolute top-1 left-8 right-8 flex items-center justify-between text-[9px] font-mono text-cyan-400/70 border-b border-cyan-500/30 pb-0.5 pointer-events-none z-10">
                      <span>◀ 50&apos;-0&quot; EAST-WEST SPAN ▶</span>
                      <span>NORTH-FACING VASTU ALIGNED</span>
                    </div>
                    <div className="absolute bottom-1 left-8 right-8 flex items-center justify-between text-[9px] font-mono text-cyan-400/70 border-t border-cyan-500/30 pt-0.5 pointer-events-none z-10">
                      <span>◀ ROAD ACCESS / FOYER (SOUTH) ▶</span>
                      <span>SCALE: 1:100 CAD SPEC • {markups.length} MARKUP ANNOTATIONS</span>
                    </div>

                    {/* Room Partitions & Labels */}
                    {BLUEPRINT_ROOMS.map((room) => {
                      const isSelected = selectedRoomKey === room.key;
                      const roomSnagsCount = snags.filter(s => s.roomKey === room.key && s.status === 'OPEN').length;
                      
                      return (
                        <div
                          key={room.key}
                          onClick={(e) => {
                            if (drawingTool !== 'select') return;
                            e.stopPropagation();
                            handleSelectRoom(room.key);
                          }}
                          style={{
                            left: `${room.x}%`,
                            top: `${room.y}%`,
                            width: `${room.w}%`,
                            height: `${room.h}%`,
                          }}
                          className={`absolute border-2 rounded-xl p-2 sm:p-3 transition-all ${
                            drawingTool === 'select' ? 'cursor-pointer hover:border-slate-400 hover:bg-slate-800/40' : 'pointer-events-none'
                          } flex flex-col justify-between ${room.colorClass} ${
                            isSelected
                              ? 'ring-2 ring-amber-400 border-amber-400 shadow-lg bg-amber-500/10'
                              : ''
                          }`}
                        >
                          {/* Room Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-[10px] sm:text-xs font-black tracking-wide leading-tight">
                                {room.name}
                              </div>
                              <div className="text-[9px] sm:text-[10px] font-mono opacity-70">
                                {room.dimensions}
                              </div>
                            </div>

                            {roomSnagsCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono animate-pulse">
                                {roomSnagsCount} Open
                              </span>
                            )}
                          </div>

                          {/* Architectural Room Features Indicator */}
                          <div className="text-[8px] sm:text-[9px] font-mono opacity-50 flex items-center justify-between">
                            <span>ZONE: {room.key.toUpperCase()}</span>
                            <span>{isSelected ? '✓ ACTIVE' : ''}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Temporary User Clicked Target Crosshair */}
                    {clickedPinTarget && drawingTool === 'select' && (
                      <div
                        style={{
                          left: `${clickedPinTarget.x}%`,
                          top: `${clickedPinTarget.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        className="absolute z-20 pointer-events-none flex flex-col items-center"
                      >
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-400 animate-spin" />
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded mt-1 shadow-md whitespace-nowrap inline-flex items-center gap-1">
                          <AppIcon name="location" size="xs" decorative />
                          Pin Target ({clickedPinTarget.x}%, {clickedPinTarget.y}%)
                        </span>
                      </div>
                    )}

                    {/* MAPPED DEFECT SNAG PINS */}
                    {displayedSnags.map((snag, idx) => {
                      const isSelected = activePinId === snag.id;
                      const isOpen = snag.status === 'OPEN';

                      // Severity Styles
                      let pinColor = 'bg-amber-500 text-slate-950 border-amber-300';
                      let pulseColor = 'bg-amber-400';
                      if (!isOpen) {
                        pinColor = 'bg-emerald-500 text-white border-emerald-300';
                        pulseColor = 'bg-emerald-400';
                      } else if (snag.severity === 'Critical') {
                        pinColor = 'bg-rose-600 text-white border-rose-300';
                        pulseColor = 'bg-rose-500';
                      } else if (snag.severity === 'Major') {
                        pinColor = 'bg-orange-500 text-white border-orange-300';
                        pulseColor = 'bg-orange-400';
                      }

                      return (
                        <div
                          key={snag.id}
                          style={{
                            left: `${snag.x}%`,
                            top: `${snag.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={(e) => {
                            if (drawingTool !== 'select') return;
                            e.stopPropagation();
                            setActivePinId(snag.id);
                          }}
                          className={`absolute z-30 group transition-transform ${
                            drawingTool === 'select' ? 'cursor-pointer' : 'pointer-events-none'
                          } ${isSelected ? 'scale-125 z-40' : 'hover:scale-110'}`}
                        >
                          {/* Animated Pulse for Open Snags */}
                          {isOpen && (
                            <span className={`absolute -inset-1.5 rounded-full opacity-75 animate-ping ${pulseColor}`} />
                          )}

                          {/* Pin Button */}
                          <div className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-lg font-black text-xs font-mono ${pinColor} ${
                            isSelected ? 'ring-4 ring-white' : ''
                          }`}>
                            {isOpen ? idx + 1 : '✓'}
                          </div>

                          {/* Pin Floating Mini-Label */}
                          <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/90 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none font-sans font-bold">
                            {snag.location}
                          </div>
                        </div>
                      );
                    })}

                    {/* SVG VECTOR MARKUP DRAWING LAYER */}
                    {showMarkups && (
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none z-20"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <marker id="arrowhead-EF4444" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#EF4444" />
                          </marker>
                          <marker id="arrowhead-F97316" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#F97316" />
                          </marker>
                          <marker id="arrowhead-F59E0B" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#F59E0B" />
                          </marker>
                          <marker id="arrowhead-06B6D4" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#06B6D4" />
                          </marker>
                          <marker id="arrowhead-10B981" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#10B981" />
                          </marker>
                        </defs>

                        {/* Render Saved Sketched Markups */}
                        {markups.map((m) => {
                          const isActive = activeMarkupId === m.id;
                          const colorHexClean = m.color.replace('#', '');
                          const strokeScale = (m.strokeWidth || 3) * 0.35;

                          if (m.type === 'circle') {
                            const cx = (m.startX + m.endX) / 2;
                            const cy = (m.startY + m.endY) / 2;
                            const rx = Math.max(1.5, Math.abs(m.endX - m.startX) / 2);
                            const ry = Math.max(1.5, Math.abs(m.endY - m.startY) / 2);

                            return (
                              <g key={m.id} className="transition-all">
                                <ellipse
                                  cx={cx}
                                  cy={cy}
                                  rx={rx}
                                  ry={ry}
                                  stroke={m.color}
                                  strokeWidth={strokeScale}
                                  fill={`${m.color}25`}
                                  className={isActive ? 'filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''}
                                />
                                {m.label && (
                                  <text
                                    x={cx}
                                    y={Math.max(3, cy - ry - 1.5)}
                                    fill={m.color}
                                    fontSize="2.4"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    className="font-mono select-none"
                                  >
                                    {m.label}
                                  </text>
                                )}
                              </g>
                            );
                          }

                          if (m.type === 'rectangle') {
                            const x = Math.min(m.startX, m.endX);
                            const y = Math.min(m.startY, m.endY);
                            const width = Math.max(1.5, Math.abs(m.endX - m.startX));
                            const height = Math.max(1.5, Math.abs(m.endY - m.startY));

                            return (
                              <g key={m.id}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={width}
                                  height={height}
                                  stroke={m.color}
                                  strokeWidth={strokeScale}
                                  strokeDasharray="1.5, 1"
                                  fill={`${m.color}20`}
                                  rx="1"
                                />
                                {m.label && (
                                  <text
                                    x={x + width / 2}
                                    y={Math.max(3, y - 1.5)}
                                    fill={m.color}
                                    fontSize="2.4"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    className="font-mono select-none"
                                  >
                                    {m.label}
                                  </text>
                                )}
                              </g>
                            );
                          }

                          if (m.type === 'arrow') {
                            return (
                              <g key={m.id}>
                                <line
                                  x1={m.startX}
                                  y1={m.startY}
                                  x2={m.endX}
                                  y2={m.endY}
                                  stroke={m.color}
                                  strokeWidth={strokeScale}
                                  strokeLinecap="round"
                                  markerEnd={`url(#arrowhead-${colorHexClean})`}
                                />
                                {m.label && (
                                  <text
                                    x={(m.startX + m.endX) / 2}
                                    y={Math.max(3, (m.startY + m.endY) / 2 - 1.5)}
                                    fill={m.color}
                                    fontSize="2.4"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    className="font-mono select-none"
                                  >
                                    {m.label}
                                  </text>
                                )}
                              </g>
                            );
                          }

                          if (m.type === 'freehand' && m.points && m.points.length > 0) {
                            const pathData = m.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            return (
                              <g key={m.id}>
                                <path
                                  d={pathData}
                                  stroke={m.color}
                                  strokeWidth={strokeScale}
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </g>
                            );
                          }

                          return null;
                        })}

                        {/* Real-time In-Progress Drawing Preview */}
                        {isDrawing && currentShape && (
                          <g>
                            {currentShape.type === 'circle' && (
                              <ellipse
                                cx={(currentShape.startX + currentShape.endX) / 2}
                                cy={(currentShape.startY + currentShape.endY) / 2}
                                rx={Math.max(1, Math.abs(currentShape.endX - currentShape.startX) / 2)}
                                ry={Math.max(1, Math.abs(currentShape.endY - currentShape.startY) / 2)}
                                stroke={currentShape.color}
                                strokeWidth={(currentShape.strokeWidth || 3) * 0.35}
                                strokeDasharray="2, 1"
                                fill={`${currentShape.color}35`}
                              />
                            )}

                            {currentShape.type === 'rectangle' && (
                              <rect
                                x={Math.min(currentShape.startX, currentShape.endX)}
                                y={Math.min(currentShape.startY, currentShape.endY)}
                                width={Math.max(1, Math.abs(currentShape.endX - currentShape.startX))}
                                height={Math.max(1, Math.abs(currentShape.endY - currentShape.startY))}
                                stroke={currentShape.color}
                                strokeWidth={(currentShape.strokeWidth || 3) * 0.35}
                                strokeDasharray="2, 1"
                                fill={`${currentShape.color}30`}
                                rx="1"
                              />
                            )}

                            {currentShape.type === 'arrow' && (
                              <line
                                x1={currentShape.startX}
                                y1={currentShape.startY}
                                x2={currentShape.endX}
                                y2={currentShape.endY}
                                stroke={currentShape.color}
                                strokeWidth={(currentShape.strokeWidth || 3) * 0.35}
                                strokeLinecap="round"
                                markerEnd={`url(#arrowhead-${currentShape.color.replace('#', '')})`}
                              />
                            )}

                            {currentShape.type === 'freehand' && currentShape.points && currentShape.points.length > 0 && (
                              <path
                                d={currentShape.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                                stroke={currentShape.color}
                                strokeWidth={(currentShape.strokeWidth || 3) * 0.35}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                          </g>
                        )}

                      </svg>
                    )}

                  </div>

                  {/* Blueprint Legend & Selected Pin Detail Drawer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    
                    {/* Legend */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                      <div className="font-extrabold text-slate-900 uppercase text-[11px] flex items-center justify-between">
                        <span>Pin Severity Legend</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{markups.length} Markups Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-400 shrink-0" />
                          <span className="text-slate-700 font-bold">Critical Defect</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-400 shrink-0" />
                          <span className="text-slate-700 font-bold">Major Defect</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-400 shrink-0" />
                          <span className="text-slate-700 font-bold">Minor Defect</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 shrink-0" />
                          <span className="text-slate-700 font-bold">Resolved / Cleared</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Selected Pin Inspector Card */}
                    <div className="md:col-span-2 p-4 bg-slate-900 text-white border border-slate-800 rounded-2xl space-y-3">
                      {activeSelectedSnag ? (
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                                  activeSelectedSnag.severity === 'Critical'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : activeSelectedSnag.severity === 'Major'
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}>
                                  {activeSelectedSnag.severity.toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-amber-400">
                                  {activeSelectedSnag.location}
                                </span>
                              </div>
                              <div className="text-sm font-bold text-white">
                                {activeSelectedSnag.desc}
                              </div>
                              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                                <span>Assigned: {activeSelectedSnag.assignedTo}</span>
                                <span>•</span>
                                <span>Spatial Coords: ({activeSelectedSnag.x}%, {activeSelectedSnag.y}%)</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              
                              {/* Quick Auto-Circle on Blueprint */}
                              <button
                                type="button"
                                onClick={() => handleAutoCircleSnag(activeSelectedSnag)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                title="Add circle highlight on 2D blueprint"
                              >
                                <Circle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Circle Snag</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleSnagStatus(activeSelectedSnag.id)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                                  activeSelectedSnag.status === 'OPEN'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                }`}
                              >
                                {activeSelectedSnag.status === 'OPEN' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Mark Resolved</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Re-Open Defect</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSnag(activeSelectedSnag.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                title="Delete defect"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-xs text-slate-400">
                          <span>Click on any numbered pin above on the 2D floor plan to inspect defect status and sketch visual markups.</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* VIEW MODE 2: TABULAR DEFECT SNAG LIST */}
              {snagViewMode === 'list' && (
                <div className="space-y-2 overflow-y-auto max-h-80 pr-1">
                  {displayedSnags.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl">
                      No defect snags found matching the selected filter.
                    </div>
                  ) : (
                    displayedSnags.map((s, idx) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActivePinId(s.id);
                          setSnagViewMode('blueprint');
                        }}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs transition-all cursor-pointer ${
                          s.status === 'OPEN'
                            ? 'bg-[var(--color-surface)] border-slate-200 hover:border-amber-400 hover:bg-slate-50/80 shadow-2xs'
                            : 'bg-emerald-50/40 border-emerald-200/60 opacity-80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5 ${
                            s.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : s.severity === 'Major'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.status === 'RESOLVED' ? '✓' : idx + 1}
                          </span>

                          <div className="space-y-1">
                            <div className="font-extrabold text-slate-900">
                              <span className="text-amber-800 font-bold">[{s.location}]</span> {s.desc}
                            </div>
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2">
                              <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                                s.severity === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : s.severity === 'Major'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {s.severity}
                              </span>
                              <span>•</span>
                              <span>Assigned: {s.assignedTo}</span>
                              <span>•</span>
                              <span>Coords: ({s.x}%, {s.y}%)</span>
                              <span>•</span>
                              <span>{s.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleToggleSnagStatus(s.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                              s.status === 'OPEN'
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {s.status}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSnag(s.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-slate-100"
                            title="Delete Snag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </Card>

          </div>

        </section>
      )}

    </div>
  );
};

export default GrihaNirmanSuperApp;
