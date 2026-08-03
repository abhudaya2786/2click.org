import React, { useState } from "react";
import {
  Truck,
  MapPin,
  ShieldCheck,
  Phone,
  Calculator,
  Clock,
  FileText,
  CheckCircle2,
  Package,
  AlertCircle,
  Search,
  ChevronRight,
  Sparkles,
  Building2,
  Scale,
  Anchor,
  Navigation,
  ExternalLink,
  Plus,
  X,
  Zap,
  ArrowRight,
  Gauge,
  Share2,
  FileCheck,
  User,
  PhoneCall,
  Check,
  Download,
  Boxes,
  Compass,
} from "lucide-react";
import { User as UserType } from "../types";

interface LogisticsHubProps {
  currentUser?: UserType | null;
  selectedCity: string;
  onOpenAuth?: () => void;
}

export interface VehicleFleetItem {
  id: string;
  transporterName: string;
  driverName: string;
  phone: string;
  vehicleType: string;
  vehicleCategory: "tipper" | "pickup" | "heavy_trailer" | "container";
  vehicleNumber: string;
  capacityTonnes: number;
  baseRatePerKm: number;
  minFare: number;
  district: string;
  rating: number;
  totalTrips: number;
  isAvailable: boolean;
  features: string[];
}

const SAMPLE_FLEET: VehicleFleetItem[] = [
  {
    id: "FLEET-01",
    transporterName: "Ramesh Heavy Tipper & Cement Express",
    driverName: "Ramesh Yadav",
    phone: "+91 98390 12345",
    vehicleType: "10-Wheeler Tipper (25 Tonne)",
    vehicleCategory: "tipper",
    vehicleNumber: "UP 53 ET 8912",
    capacityTonnes: 25,
    baseRatePerKm: 85,
    minFare: 2500,
    district: "Gorakhpur",
    rating: 4.9,
    totalTrips: 420,
    isAvailable: true,
    features: [
      "Hydraulic Unloading",
      "GPS Live Tracked",
      "E-Way Bill Enabled",
      "Weighbridge Certified",
    ],
  },
  {
    id: "FLEET-02",
    transporterName: "Azad Pickups & Dukandar Local Express",
    driverName: "Mohd Azad",
    phone: "+91 94150 98765",
    vehicleType: "Tata Ace (छोटा हाथी 750 KG)",
    vehicleCategory: "pickup",
    vehicleNumber: "UP 53 AT 3411",
    capacityTonnes: 0.75,
    baseRatePerKm: 25,
    minFare: 500,
    district: "Gorakhpur",
    rating: 4.8,
    totalTrips: 890,
    isAvailable: true,
    features: [
      "2-Hour Express Delivery",
      "Dukandar Special",
      "Labor On-Demand",
      "Cash on Delivery",
    ],
  },
  {
    id: "FLEET-03",
    transporterName: "Gupta Heavy Cranes & Low-Bed Trailers",
    driverName: "Suresh Chandra Gupta",
    phone: "+91 99180 54321",
    vehicleType: "Low-Bed Trailer (40 Tonne Heavy Duty)",
    vehicleCategory: "heavy_trailer",
    vehicleNumber: "UP 65 CT 9001",
    capacityTonnes: 40,
    baseRatePerKm: 160,
    minFare: 6500,
    district: "Varanasi",
    rating: 5.0,
    totalTrips: 180,
    isAvailable: true,
    features: [
      "ODC Permit Clearance",
      "JCB & Crane Transport",
      "Hydraulic Rigging",
      "Escort Guarded",
    ],
  },
  {
    id: "FLEET-04",
    transporterName: "Purvanchal Steel & Rebar Logistics",
    driverName: "Virendra Singh",
    phone: "+91 97920 11223",
    vehicleType: "14-Wheeler Multi-Axle Truck (32 Tonne)",
    vehicleCategory: "tipper",
    vehicleNumber: "UP 53 BT 6789",
    capacityTonnes: 32,
    baseRatePerKm: 110,
    minFare: 3800,
    district: "Gorakhpur",
    rating: 4.7,
    totalTrips: 310,
    isAvailable: true,
    features: [
      "Long Rebar Bed (40ft)",
      "Transit Insurance",
      "E-Way Bill Direct",
      "Multi-Stop Drop",
    ],
  },
  {
    id: "FLEET-05",
    transporterName: "Shri Ram Container & Solar Express",
    driverName: "Anil Kumar Sharma",
    phone: "+91 98890 33445",
    vehicleType: "22-ft Sealed Closed Container (12 Tonne)",
    vehicleCategory: "container",
    vehicleNumber: "UP 32 DT 4567",
    capacityTonnes: 12,
    baseRatePerKm: 55,
    minFare: 1800,
    district: "Lucknow",
    rating: 4.9,
    totalTrips: 540,
    isAvailable: true,
    features: [
      "Weatherproof Sealed",
      "Solar Panel Safe",
      "Electrical Cable Reels",
      "Digital POD Receipt",
    ],
  },
  {
    id: "FLEET-06",
    transporterName: "Maan Bolero Maxi Truck Services",
    driverName: "Ranjeet Maan",
    phone: "+91 96210 77889",
    vehicleType: "Mahindra Bolero Maxi Truck (1.5 Tonne)",
    vehicleCategory: "pickup",
    vehicleNumber: "UP 53 FT 1290",
    capacityTonnes: 1.5,
    baseRatePerKm: 32,
    minFare: 750,
    district: "Gorakhpur",
    rating: 4.8,
    totalTrips: 670,
    isAvailable: true,
    features: [
      "Cement 30-Bags Spec",
      "Site Direct Access",
      "Quick Loading",
      "Khata Payment",
    ],
  },
];

export const LogisticsHub: React.FC<LogisticsHubProps> = ({
  currentUser,
  selectedCity,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<
    "workflow_guide" | "calculator" | "fleet" | "live_tracking"
  >("workflow_guide");
  const [selectedLogisticsType, setSelectedLogisticsType] = useState<
    "bulk" | "express" | "heavy" | "interdistrict"
  >("bulk");
  const [selectedFleetFilter, setSelectedFleetFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Calculator State
  const [calcMaterial, setCalcMaterial] = useState<
    "cement" | "steel" | "bricks" | "sand" | "hardware" | "machinery"
  >("cement");
  const [calcDistance, setCalcDistance] = useState<number>(35);
  const [calcWeightTonnes, setCalcWeightTonnes] = useState<number>(15);
  const [calcVehicleType, setCalcVehicleType] = useState<string>("tipper_10w");
  const [incLabor, setIncLabor] = useState<boolean>(true);
  const [incWeighbridge, setIncWeighbridge] = useState<boolean>(true);
  const [incInsurance, setIncInsurance] = useState<boolean>(false);

  // Booking Modal State
  const [bookingModalVehicle, setBookingModalVehicle] =
    useState<VehicleFleetItem | null>(null);
  const [bookingPickupAddr, setBookingPickupAddr] = useState<string>(
    "Ramesh Hardware & Cement Mart, Ward 12",
  );
  const [bookingDropAddr, setBookingDropAddr] = useState<string>(
    "Site Project #402, Civil Lines Road",
  );
  const [bookingMaterialDesc, setBookingMaterialDesc] = useState<string>(
    "500 Bags Ultratech PPC Cement",
  );
  const [bookingSuccessToast, setBookingSuccessToast] =
    useState<boolean>(false);

  // Transporter Register Modal State
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [regFirmName, setRegFirmName] = useState<string>("");
  const [regDriverName, setRegDriverName] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("");
  const [regVehicleNum, setRegVehicleNum] = useState<string>("");
  const [regVehicleType, setRegVehicleType] = useState<string>(
    "Tata Ace (0.75 Tonne)",
  );

  // Calculation Logic
  const calculateFreight = () => {
    let ratePerKm = 50;
    let minFare = 1000;
    let laborCost = incLabor ? 800 : 0;
    let weighbridgeFee = incWeighbridge ? 150 : 0;
    let insuranceFee = incInsurance ? 350 : 0;

    if (calcVehicleType === "tata_ace") {
      ratePerKm = 25;
      minFare = 500;
    } else if (calcVehicleType === "bolero_pickup") {
      ratePerKm = 35;
      minFare = 750;
    } else if (calcVehicleType === "tipper_6w") {
      ratePerKm = 60;
      minFare = 1800;
    } else if (calcVehicleType === "tipper_10w") {
      ratePerKm = 85;
      minFare = 2500;
    } else if (calcVehicleType === "trailer_heavy") {
      ratePerKm = 160;
      minFare = 6500;
    }

    const calculatedBase = calcDistance * ratePerKm;
    const baseFreight = Math.max(calculatedBase, minFare);
    const totalFreight =
      baseFreight + laborCost + weighbridgeFee + insuranceFee;

    const approxMins = Math.round(calcDistance * 2.2 + 30); // 2.2 mins per km + loading time
    const hours = Math.floor(approxMins / 60);
    const mins = approxMins % 60;
    const timeStr = hours > 0 ? `${hours} hr ${mins} mins` : `${mins} mins`;

    return {
      baseFreight,
      laborCost,
      weighbridgeFee,
      insuranceFee,
      totalFreight,
      ratePerKm,
      timeStr,
    };
  };

  const calcResult = calculateFreight();

  const filteredFleet = SAMPLE_FLEET.filter((item) => {
    const matchesCategory =
      selectedFleetFilter === "all" ||
      item.vehicleCategory === selectedFleetFilter;
    const matchesSearch =
      item.transporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccessToast(true);
    setTimeout(() => {
      setBookingSuccessToast(false);
      setBookingModalVehicle(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. TOP HEADER & DISTRICT METRICS BANNER */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-400" />
                2CLICK Logistics &amp; Transport Hub
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-black uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                District: {selectedCity} Fleet Network
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              निर्माण सामग्री लॉजिस्टिक्स एवं 2-घंटे लोकल एक्सप्रेस ट्रांसपोर्ट
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              भारी सीमेंट टिपर्स, सरिया ट्रेलर्स, क्रेन ओडीसी, एवं दुकानदार
              पिकअप डिलीवरी। धर्म कांटा पर्ची सत्यापन, ई-वे बिल जनरेशन एवं लाइव
              जीपीएस ट्रैकिंग।
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowRegModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>अपनी गाड़ी नेटवर्क में जोड़ें (Attach Vehicle)</span>
              </button>

              <button
                onClick={() => setActiveTab("calculator")}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>भाड़ा रेट कैलकुलेट करें</span>
              </button>
            </div>
          </div>

          {/* District Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-80">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-teal-300 font-extrabold uppercase tracking-wider block">
                Active Fleet
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                64+ Trucks
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">
                Tippers &amp; Tata Ace
              </span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                Avg Dispatch
              </span>
              <span className="text-2xl font-black text-amber-300 mt-1 block">
                22 Mins
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">
                Express Delivery
              </span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block">
                E-Way Bills
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                Auto-Sync
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">
                GST Compliant
              </span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider block">
                Weighbridge
              </span>
              <span className="text-2xl font-black text-purple-300 mt-1 block">
                100% Valid
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">
                धर्म कांटा पर्ची
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION SUB-TABS */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("workflow_guide")}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === "workflow_guide"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>लॉजिस्टिक्स के प्रकार एवं कार्यप्रणाली (How it Works)</span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === "calculator"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>माल भाड़ा कैलकुलेटर (Freight Calculator)</span>
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === "fleet"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>उपलब्ध गाड़ियां एवं ड्राइवर्स (Fleet Directory)</span>
          </button>

          <button
            onClick={() => setActiveTab("live_tracking")}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === "live_tracking"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>लाइव शिपमेंट ट्रैकिंग एवं धर्म कांटा पर्ची</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LOGISTICS TYPES & WORKFLOW GUIDE ("कैसा काम करेगा?") */}
      {activeTab === "workflow_guide" && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Title */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black rounded-md uppercase tracking-wider">
              Complete Logistics Architecture
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              2CLICK पर उपलब्ध 4 मुख्य लॉजिस्टिक्स मॉडल एवं उनकी कार्यप्रणाली
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              प्रत्येक प्रकार की सामग्री (सीमेंट, सरिया, गिट्टी, इलेक्ट्रिक
              केबल, जेसीबी, नल-पाइप) के लिए विशेष वाहन एवं ट्रैकिंग व्यवस्था
            </p>
          </div>

          {/* Logistics Types Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TYPE 1: HEAVY BULK MATERIAL FREIGHT */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-400/30">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                      Type 1: Heavy Bulk Freight
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      भारी निर्माण सामग्री लॉजिस्टिक्स (टिपर्स व डंपर)
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-lg border border-amber-300">
                  10 - 40 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">
                  📦 उपयुक्त सामग्री (Scope):
                </div>
                <p>
                  सीमेंट (500-2000 बैग्स), TMT सरिया (10-40 टन), ईंटें
                  (5,000-20,000 नग), मोरंग/बालू, एवं गिट्टी एग्रीगेट।
                </p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">
                  🚚 वाहन (Vehicles):
                </div>
                <p>
                  6-व्हीलर टिपर्स (10T), 10-व्हीलर टिपर्स (25T), 14-व्हीलर
                  मल्टि-एक्सल ट्रेलर्स (40T)।
                </p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>साइट या दुकानदार द्वारा बुकिंग</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>प्लांट/क्वारी में लोडिंग</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>धर्म कांटा (Weigh Slip) अपलोड</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>E-Way Bill &amp; OTP डिलीवरी</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TYPE 2: LOCAL DUKANDAR EXPRESS DELIVERY */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-500/20 text-teal-500 rounded-2xl border border-teal-400/30">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400">
                      Type 2: Local Dukandar Express
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      लोकल दुकानदार एवं साइट 2-घंटे एक्सप्रेस डिलीवरी
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black rounded-lg border border-teal-300">
                  0.5 - 2.5 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">
                  📦 उपयुक्त सामग्री (Scope):
                </div>
                <p>
                  हार्डवेयर, पेंट्स, सैनिटरीवेयर, इलेक्ट्रिक केबल, नल पाइप्स,
                  एवं छोटे सीमेंट बैच (10-50 बैग्स)।
                </p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">
                  🚚 वाहन (Vehicles):
                </div>
                <p>
                  टाटा एस (छोटा हाथी - 750 KG), महिंद्रा बोलेरो मैक्स पिकअप
                  (1.5T), ई-रिक्शा कार्गो लोडर।
                </p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>दुकानदार पोर्टल से 1-क्लिक डिस्पैच</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>15 मिनट में ड्राइवर दुकान पर पहुंचना</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>व्हाट्सएप लाइव ट्रैकिंग लिंक</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>साइट अनलोडिंग &amp; कैश/UPI पेमेंट</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TYPE 3: HEAVY EQUIPMENT & CRANE HAULAGE */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 text-purple-500 rounded-2xl border border-purple-400/30">
                    <Anchor className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                      Type 3: Machinery &amp; Heavy Crane
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      भारी मशीनरी, जेसीबी एवं ओडीसी क्रेन ट्राली
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-black rounded-lg border border-purple-300">
                  30 - 80 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">
                  📦 उपयुक्त सामग्री (Scope):
                </div>
                <p>
                  जेसीबी/एक्सकेवेटर 3DX, टावर क्रेन सेक्शंस, पाइलिंग रिग्स, भारी
                  सबस्टेशन ट्रांसफॉर्मर, कंक्रीट बूम पंप्स।
                </p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">
                  🚚 वाहन (Vehicles):
                </div>
                <p>
                  लो-बेड ट्रेलर्स (30T-80T), टेलिस्कोपिक मोबाइल क्रेंस
                  (25T-100T), हाइड्रोलिक एक्सल पुलर।
                </p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>रूट हाइट व ब्रिज क्लीयरेंस सर्वे</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>RTO ओवर-डायमेंशनल परमिट</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>हाइड्रोलिक एंकरिंग व रिगिंग</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>एस्कॉर्ट गार्ड ट्रांजिट व अनलोडिंग</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TYPE 4: INTER-DISTRICT & STATE CONTAINER LOGISTICS */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl border border-blue-400/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                      Type 4: Inter-District &amp; State Freight
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      अंतर-ज़िला एवं राज्य स्तरीय क्लोज्ड कंटेनर लारी
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black rounded-lg border border-blue-300">
                  5 - 20 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">
                  📦 उपयुक्त सामग्री (Scope):
                </div>
                <p>
                  सोलर पैनल पैलेट्स, PVC जल संशोधन पाइप्स, हाई-वोल्टेज केबल्स,
                  टाइल्स एवं ग्रेनाइट्स (फैक्ट्री से ज़िला गोदाम)।
                </p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">
                  🚚 वाहन (Vehicles):
                </div>
                <p>
                  FTL 19ft/22ft सील्ड क्लोज्ड कंटेनर, LTL शेयर्ड एक्सप्रेस माल
                  लारी।
                </p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>डिजिटल कंजाइनमेंट नोट (LR)</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>ट्रांजिट मरीन इंश्योरेंस कवर</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>सील्ड क्लोज्ड हाईवे ट्रांजिट</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>मल्टी-ड्रॉप डिलीवरी POD रसीद</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FREIGHT RATE CALCULATOR */}
      {activeTab === "calculator" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CALCULATOR INPUT FORM */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-md uppercase">
                  Real-time Cost Matrix
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  इन्स्टेंट माल भाड़ा रेट कैलकुलेटर (Freight Rate Matrix)
                </h2>
              </div>
              <Calculator className="w-6 h-6 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Material Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  सामग्री प्रकार (Material Type)
                </label>
                <select
                  value={calcMaterial}
                  onChange={(e) => setCalcMaterial(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="cement">सीमेंट (Cement Bags)</option>
                  <option value="steel">सरिया TMT Steel Bars</option>
                  <option value="bricks">ईंटें / ऐश ब्रिक्स (Bricks)</option>
                  <option value="sand">
                    बालू / गिट्टी (Sand &amp; Aggregates)
                  </option>
                  <option value="hardware">
                    हार्डवेयर &amp; पेंट्स (Hardware &amp; Paints)
                  </option>
                  <option value="machinery">
                    जेसीबी / भारी मशीनरी (Heavy Equipment)
                  </option>
                </select>
              </div>

              {/* Vehicle Type Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  वाहन प्रकार (Vehicle Specification)
                </label>
                <select
                  value={calcVehicleType}
                  onChange={(e) => setCalcVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="tata_ace">
                    टाटा एस (छोटा हाथी - 0.75 Tonne) - ₹25/km
                  </option>
                  <option value="bolero_pickup">
                    महिंद्रा बोलेरो पिकअप (1.5 Tonne) - ₹35/km
                  </option>
                  <option value="tipper_6w">
                    6-व्हीलर टिपर्स (10 Tonne) - ₹60/km
                  </option>
                  <option value="tipper_10w">
                    10-व्हीलर टिपर्स (25 Tonne) - ₹85/km
                  </option>
                  <option value="trailer_heavy">
                    लो-बेड ओडीसी ट्रेलर (40 Tonne) - ₹160/km
                  </option>
                </select>
              </div>

              {/* Distance Slider */}
              <div className="sm:col-span-2 space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    परिवहन दूरी (Transit Distance):
                  </label>
                  <span className="text-base font-black text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/80 px-3 py-1 rounded-xl">
                    {calcDistance} Kilometer (किमी)
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(Number(e.target.value))}
                  className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>5 km (Local Shop)</span>
                  <span>50 km (Inter-Tehsil)</span>
                  <span>150 km (District Border)</span>
                  <span>250 km (State Highway)</span>
                </div>
              </div>

              {/* Checkboxes for Extra Charges */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  अतिरिक्त सुविधाएं एवं रसीदें (Additional Add-ons):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                      incLabor
                        ? "bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={incLabor}
                      onChange={(e) => setIncLabor(e.target.checked)}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <div className="text-xs font-bold leading-tight">
                      हम्माली लोडिंग (Labor) (+₹800)
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                      incWeighbridge
                        ? "bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={incWeighbridge}
                      onChange={(e) => setIncWeighbridge(e.target.checked)}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <div className="text-xs font-bold leading-tight">
                      धर्म कांटा पर्ची (+₹150)
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                      incInsurance
                        ? "bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={incInsurance}
                      onChange={(e) => setIncInsurance(e.target.checked)}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <div className="text-xs font-bold leading-tight">
                      ट्रांजिट इंश्योरेंस (+₹350)
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* CALCULATOR ESTIMATED BREAKDOWN BILL */}
          <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/40 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-400/20 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                  Estimated Fare Receipt
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-md border border-emerald-400/30">
                  Instant Quote
                </span>
              </div>

              <div className="text-center py-2 space-y-1 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase font-extrabold text-slate-300 block">
                  कुल अनुमानित माल भाड़ा (Total Estimated Freight)
                </span>
                <span className="text-3xl font-black text-emerald-400">
                  ₹{calcResult.totalFreight.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-amber-300 font-bold block">
                  अनुमानित समय: {calcResult.timeStr} ({calcResult.ratePerKm}{" "}
                  ₹/km)
                </span>
              </div>

              {/* Itemized Lines */}
              <div className="space-y-2 text-xs divide-y divide-white/10">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-300">
                    Base Transport Fare ({calcDistance} km):
                  </span>
                  <span className="font-extrabold">
                    ₹{calcResult.baseFreight.toLocaleString("en-IN")}
                  </span>
                </div>
                {incLabor && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">
                      Loading/Unloading Labor:
                    </span>
                    <span className="font-extrabold text-teal-300">
                      +₹{calcResult.laborCost}
                    </span>
                  </div>
                )}
                {incWeighbridge && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">
                      Weighbridge Slips (धर्म कांटा):
                    </span>
                    <span className="font-extrabold text-amber-300">
                      +₹{calcResult.weighbridgeFee}
                    </span>
                  </div>
                )}
                {incInsurance && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">
                      Goods Transit Insurance:
                    </span>
                    <span className="font-extrabold text-purple-300">
                      +₹{calcResult.insuranceFee}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 font-extrabold text-emerald-300">
                  <span>Digital E-Way Bill auto-sync:</span>
                  <span>FREE</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const fleetMatch = SAMPLE_FLEET[0];
                setBookingModalVehicle(fleetMatch);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-slate-950" />
              <span>बुकिंग हेतु गाड़ी सेलेक्ट करें (Proceed to Book)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: FLEET DIRECTORY & INSTANT BOOKING */}
      {activeTab === "fleet" && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* SEARCH & CATEGORY FILTERS */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ट्रांसपोर्टर या गाड़ियां खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedFleetFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === "all"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                सभी गाड़ियां ({SAMPLE_FLEET.length})
              </button>
              <button
                onClick={() => setSelectedFleetFilter("tipper")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === "tipper"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                टिपर्स व डंपर
              </button>
              <button
                onClick={() => setSelectedFleetFilter("pickup")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === "pickup"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                टाटा एस व पिकअप
              </button>
              <button
                onClick={() => setSelectedFleetFilter("heavy_trailer")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === "heavy_trailer"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                ओडीसी क्रेन ट्रेलर्स
              </button>
            </div>
          </div>

          {/* FLEET CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFleet.map((vehicle) => (
              <div
                key={vehicle.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black rounded-md uppercase border border-teal-300/40">
                      {vehicle.vehicleType}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />{" "}
                      AVAILABLE
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                    {vehicle.transporterName}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>चालक: {vehicle.driverName}</span>
                    <span>•</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {vehicle.vehicleNumber}
                    </span>
                  </div>

                  {/* Rate & Capacity Pill */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Capacity
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {vehicle.capacityTonnes} Tonnes
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Freight Rate
                      </span>
                      <span className="font-black text-teal-600 dark:text-teal-400">
                        ₹{vehicle.baseRatePerKm}/km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Min Fare
                      </span>
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        ₹{vehicle.minFare}
                      </span>
                    </div>
                  </div>

                  {/* Features Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {vehicle.features.map((feat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CARD ACTION BUTTONS */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={`tel:${vehicle.phone}`}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                    <span>Call Driver</span>
                  </a>

                  <button
                    onClick={() => setBookingModalVehicle(vehicle)}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Book Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE SHIPMENT TRACKING & WEIGHBRIDGE SLIPS */}
      {activeTab === "live_tracking" && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-md uppercase">
                  Live Dispatch Simulation
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-500" />
                  सक्रिय शिपमेंट ट्रैकिंग एवं धर्म कांटा डिजिटल रसीद (Live GPS
                  &amp; Weighbridge)
                </h2>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-xl text-xs font-black animate-pulse flex items-center gap-1">
                ● LIVE GPS CONNECTED
              </span>
            </div>

            {/* DEMO ACTIVE SHIPMENT CARD */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-amber-300 uppercase font-black tracking-wider block">
                    Shipment ID: SHP-908122
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    500 Bags Ultratech Cement (Gorakhpur Plant to Civil Lines
                    Site)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Vehicle: UP 53 ET 8912 (10-Wheeler Tipper) • Driver: Ramesh
                    Yadav (+91 98390 12345)
                  </p>
                </div>

                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-right">
                  <span className="text-[10px] text-slate-300 uppercase font-bold block">
                    Estimated Arrival
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    11:45 AM (In 24 Mins)
                  </span>
                </div>
              </div>

              {/* Progress Milestones Timeline */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">
                  डिस्पैच प्रगति टाइमलाइन (Dispatch Milestones):
                </span>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1. Order Confirmed</span>
                  </div>
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Loaded at Yard</span>
                  </div>
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>3. धर्म कांटा Certified</span>
                  </div>
                  <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 font-bold flex items-center gap-1.5 animate-pulse">
                    <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>4. On-Route Transit</span>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>5. Site OTP Unloading</span>
                  </div>
                </div>
              </div>

              {/* DIGITAL WEIGHBRIDGE SLIP (धर्म कांटा पर्ची) PREVIEW */}
              <div className="p-4 bg-black/40 rounded-2xl border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-400" />
                    डिजिटल धर्म कांटा पर्ची (Certified Weighbridge Slip
                    #WB-88192)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    STAMP VERIFIED ✓
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Gross Weight (ग्रॉस भार)
                    </span>
                    <span className="font-black text-white text-sm">
                      38,500 KG
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Tare Weight (खाली गाड़ी)
                    </span>
                    <span className="font-black text-white text-sm">
                      13,500 KG
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-400/30">
                    <span className="text-[10px] text-emerald-300 block font-bold">
                      Net Material (शुद्ध माल)
                    </span>
                    <span className="font-black text-emerald-400 text-sm">
                      25,000 KG (25 Ton)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModalVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 p-6 text-white relative">
              <button
                onClick={() => setBookingModalVehicle(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-2xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md text-[10px] font-black uppercase">
                    Confirm Vehicle Booking
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {bookingModalVehicle.transporterName}
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              {bookingSuccessToast && (
                <div className="p-3 bg-emerald-600 text-white font-black text-xs rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>
                    बुकिंग सफल! ड्राइवर को व्हाट्सएप एवं कॉल भेज दिया गया है।
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  सामग्री का विवरण (Material Description)
                </label>
                <input
                  type="text"
                  required
                  value={bookingMaterialDesc}
                  onChange={(e) => setBookingMaterialDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  पिकअप पता (Pickup Address)
                </label>
                <input
                  type="text"
                  required
                  value={bookingPickupAddr}
                  onChange={(e) => setBookingPickupAddr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  अनलोडिंग साइट पता (Delivery Site Address)
                </label>
                <input
                  type="text"
                  required
                  value={bookingDropAddr}
                  onChange={(e) => setBookingDropAddr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Base Transport Rate:</span>
                  <span>₹{bookingModalVehicle.baseRatePerKm}/km</span>
                </div>
                <div className="flex justify-between font-bold text-teal-600 dark:text-teal-400">
                  <span>E-Way Bill Auto-Sync:</span>
                  <span>INCLUDED</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalVehicle(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  Confirm &amp; Send Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL FOR TRANSPORTERS */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
              <button
                onClick={() => setShowRegModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black text-white">
                अपनी गाड़ी 2CLICK नेटवर्क में जोड़ें
              </h3>
              <p className="text-xs text-slate-300">
                ट्रांसपोर्टर/ड्राइवर रजिस्ट्रेशन - डेली आर्डर अलर्ट प्राप्त करें
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  फर्म का नाम (Transporter Firm Name)
                </label>
                <input
                  type="text"
                  placeholder="उदा. गुप्ता टिपर्स एवं ट्रांसपोर्ट"
                  value={regFirmName}
                  onChange={(e) => setRegFirmName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  चालक का नाम (Driver Name)
                </label>
                <input
                  type="text"
                  placeholder="ड्राइवर नाम"
                  value={regDriverName}
                  onChange={(e) => setRegDriverName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  गाड़ी नंबर (Vehicle Number)
                </label>
                <input
                  type="text"
                  placeholder="UP 53 ET 0000"
                  value={regVehicleNum}
                  onChange={(e) => setRegVehicleNum(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(
                      "आपकी गाड़ी रजिस्ट्रेशन रिक्वेस्ट प्राप्त हो गयी है। वेरिफिकेशन टीम जल्द संपर्क करेगी।",
                    );
                    setShowRegModal(false);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  Submit Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
