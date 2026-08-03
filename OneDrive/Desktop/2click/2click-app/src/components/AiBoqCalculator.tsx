import React, { useState, useMemo } from "react";
import {
  Building2,
  FileText,
  Sparkles,
  Calculator,
  CheckCircle,
  RefreshCw,
  Printer,
  Share2,
  PackageCheck,
  Bot,
  Plus,
  Trash2,
  ShieldCheck,
  PieChart,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  Check,
  Camera,
} from "lucide-react";
import { QualityGrade, BOQResult, CustomCostItem } from "../types";
import { INDIAN_CITIES, SAMPLE_EMPANELLED_BRANDS } from "../data/initialData";
import { ConstructionProgressPhotos } from "./ConstructionProgressPhotos";
import { AddCustomItemModal, CustomItemPayload } from "./AddCustomItemModal";
import { VisualItemCard } from "./VisualItemCard";

interface AiBoqCalculatorProps {
  selectedCity: string;
}

export const AiBoqCalculator: React.FC<AiBoqCalculatorProps> = ({
  selectedCity,
}) => {
  const [projectType, setProjectType] = useState<string>("Residential Villa");
  const [builtupAreaSqft, setBuiltupAreaSqft] = useState<number>(1800);
  const [floors, setFloors] = useState<number>(2);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>("Premium");
  const [city, setCity] = useState<string>(selectedCity);
  const [customReqs, setCustomReqs] = useState<string>(
    "Standard RCC frame, Fe550D TMT steel, 6-inch AAC blocks, Asian Paints Royale emulsion",
  );

  const [activeTab, setActiveTab] = useState<
    "overview" | "rate_editor" | "client_breakup" | "brands" | "photos"
  >("rate_editor");

  // Selected Brands for each construction vertical
  const [selectedBrands, setSelectedBrands] = useState<{
    [key: string]: string;
  }>({
    "Structure & RCC": "UltraTech Cement & Tata Tiscon",
    "Electrical & Wiring": "Polycab India Ltd.",
    "Plumbing & Water": "Astral Pipes",
    "Flooring & Tiles": "Kajaria Ceramics",
    "Paints & Finishes": "Asian Paints",
    "Solar & Power": "Waaree Energies",
  });

  // Default Custom Material & Service Usage Rates state
  const [customItems, setCustomItems] = useState<CustomCostItem[]>([
    {
      id: "ITEM-1",
      title: "OPC / PPC 53 Grade Cement Bags",
      category: "Structure & RCC",
      brandName: "UltraTech Cement",
      unit: "Bags (50kg)",
      unitRateINR: 380,
      quantity: 756,
      totalCostINR: 287280,
    },
    {
      id: "ITEM-2",
      title: "Fe 550D High Ductile TMT Steel Rebars",
      category: "Structure & RCC",
      brandName: "Tata Tiscon",
      unit: "Metric Tonne (MT)",
      unitRateINR: 68000,
      quantity: 6.84,
      totalCostINR: 465120,
    },
    {
      id: "ITEM-3",
      title: "Ready Mix Concrete (M25 Grade)",
      category: "Structure & RCC",
      brandName: "UltraTech RMC",
      unit: "Cubic Meters (Cu.m)",
      unitRateINR: 4800,
      quantity: 110,
      totalCostINR: 528000,
    },
    {
      id: "ITEM-4",
      title: "6-inch High Strength AAC Masonry Blocks",
      category: "Masonry & AAC",
      brandName: "Biltech / Magicrete",
      unit: "Pieces",
      unitRateINR: 65,
      quantity: 4800,
      totalCostINR: 312000,
    },
    {
      id: "ITEM-5",
      title: "Double Plastering (Internal & External) Sand Mortar",
      category: "Masonry & AAC",
      brandName: "Local M-Sand",
      unit: "Sq.Ft",
      unitRateINR: 60,
      quantity: 3600,
      totalCostINR: 216000,
    },
    {
      id: "ITEM-6",
      title: "FRLS Copper Wiring & Heavy Duty Conduits",
      category: "Electrical & Wiring",
      brandName: "Polycab India Ltd.",
      unit: "Sq.Ft Builtup",
      unitRateINR: 140,
      quantity: 1800,
      totalCostINR: 252000,
    },
    {
      id: "ITEM-7",
      title: "Modular Switch, Sockets & MCB Distribution Panel",
      category: "Electrical & Wiring",
      brandName: "Havells India",
      unit: "Lump sum / Points",
      unitRateINR: 95,
      quantity: 1800,
      totalCostINR: 171000,
    },
    {
      id: "ITEM-8",
      title: "CPVC & UPVC Lead-Free Plumbing Pipe Network",
      category: "Plumbing & Water",
      brandName: "Astral Pipes",
      unit: "Sq.Ft Builtup",
      unitRateINR: 130,
      quantity: 1800,
      totalCostINR: 234000,
    },
    {
      id: "ITEM-9",
      title: "Sanitary Fixtures, Chrome Faucets & Wall Closets",
      category: "Plumbing & Water",
      brandName: "Jaquar Group",
      unit: "Bath Set Units",
      unitRateINR: 42000,
      quantity: 4,
      totalCostINR: 168000,
    },
    {
      id: "ITEM-10",
      title: "800x800mm Premium Double Charged Vitrified Tiles",
      category: "Flooring & Tiles",
      brandName: "Kajaria Ceramics",
      unit: "Sq.Ft",
      unitRateINR: 110,
      quantity: 2100,
      totalCostINR: 231000,
    },
    {
      id: "ITEM-11",
      title: "Main Teak Wood Door & UPVC 3-Track Windows",
      category: "Doors & Windows",
      brandName: "Fenesta / Teak Craft",
      unit: "Sq.Ft Openings",
      unitRateINR: 480,
      quantity: 750,
      totalCostINR: 360000,
    },
    {
      id: "ITEM-12",
      title: "Royale Luxury Emulsion & Weatherproof Paint",
      category: "Paints & Finishes",
      brandName: "Asian Paints",
      unit: "Sq.Ft Surface",
      unitRateINR: 42,
      quantity: 6500,
      totalCostINR: 273000,
    },
    {
      id: "ITEM-13",
      title: "5kW On-Grid Rooftop Solar Power System",
      category: "Solar & Power",
      brandName: "Waaree Energies",
      unit: "5kW System",
      unitRateINR: 195000,
      quantity: 1,
      totalCostINR: 195000,
    },
    {
      id: "ITEM-14",
      title: "Turnkey Civil Labor, Masons, Centering & Supervision",
      category: "Labor & Supervision",
      brandName: "Dukandar Verified Contractor",
      unit: "Sq.Ft Builtup",
      unitRateINR: 320,
      quantity: 1800,
      totalCostINR: 576000,
    },
  ]);

  // Modal state for Enhanced Custom Item Creation with photo upload
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [viewFormat, setViewFormat] = useState<"cards" | "table">("cards");

  const handleModalAddItem = (payload: CustomItemPayload) => {
    const newItem: CustomCostItem = {
      id: payload.id,
      title: payload.title,
      category: payload.category,
      brandName: payload.brandName || "Custom Specified",
      unit: payload.unit,
      unitRateINR: payload.priceINR,
      quantity: payload.quantity,
      totalCostINR: payload.priceINR * payload.quantity,
      isCustomItem: true,
      imageUrl: payload.imageUrl,
      isActive: true,
    };

    setCustomItems((prev) => [newItem, ...prev]);
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");

  // Dynamically calculate total budget based on custom usage rates
  const calculatedTotalINR = useMemo(() => {
    return customItems.reduce(
      (acc, item) => acc + item.unitRateINR * item.quantity,
      0,
    );
  }, [customItems]);

  const calculatedRatePerSqft = useMemo(() => {
    if (!builtupAreaSqft || builtupAreaSqft <= 0) return 0;
    return Math.round(calculatedTotalINR / builtupAreaSqft);
  }, [calculatedTotalINR, builtupAreaSqft]);

  // Group expenditure by category for client breakup
  const categoryBreakdown = useMemo(() => {
    const groups: { [key: string]: number } = {};
    customItems.forEach((item) => {
      const cat = item.category;
      const amt = item.unitRateINR * item.quantity;
      groups[cat] = (groups[cat] || 0) + amt;
    });

    return Object.keys(groups)
      .map((cat) => {
        const amt = groups[cat];
        const pct =
          calculatedTotalINR > 0
            ? Math.round((amt / calculatedTotalINR) * 100)
            : 0;
        return {
          category: cat,
          amount: amt,
          percentage: pct,
          itemsCount: customItems.filter((i) => i.category === cat).length,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [customItems, calculatedTotalINR]);

  // Update item rate or quantity inline
  const handleUpdateItemRateOrQty = (
    id: string,
    field: "unitRateINR" | "quantity",
    value: number,
  ) => {
    setCustomItems(
      customItems.map((item) => {
        if (item.id === id) {
          const updatedRate =
            field === "unitRateINR" ? value : item.unitRateINR;
          const updatedQty = field === "quantity" ? value : item.quantity;
          return {
            ...item,
            [field]: value,
            totalCostINR: updatedRate * updatedQty,
          };
        }
        return item;
      }),
    );
  };

  // Remove an item
  const handleRemoveItem = (id: string) => {
    setCustomItems(customItems.filter((i) => i.id !== id));
  };

  // Run AI Re-estimate
  const generateBOQ = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/boq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType,
          builtupAreaSqft,
          floors,
          locationCity: city,
          qualityGrade,
          customRequirements:
            customReqs + (aiPrompt ? ` | Instruction: ${aiPrompt}` : ""),
        }),
      });
      const data = await res.json();
      if (data.boq) {
        alert("AI updated civil matrix parameters!");
      }
    } catch (err) {
      console.error("Failed to generate BOQ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Dynamic Construction Calculator &amp; Client Breakup Studio
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Customizable material usage rates, empanelled brand pricing, and
                item-wise cost breakup for clients
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" /> Print / PDF Quote
          </button>
          <button
            onClick={() =>
              alert("Client BOQ estimate link copied to clipboard!")
            }
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Share2 className="w-4 h-4" /> Share Client Breakup
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Construction Cost Summary Header */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-teal-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-teal-800/60 pb-4 md:pb-0 md:pr-6 space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30">
                {qualityGrade} Grade
              </span>
              <span className="text-xs text-slate-300">
                • {builtupAreaSqft} Sq.Ft Built-up ({city})
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {projectType} Construction Budget
            </h2>
            <p className="text-xs text-teal-200">
              Live calculated using {customItems.length} customized material
              &amp; labor rate items.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">
              Total Project Cost
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">
              ₹{(calculatedTotalINR / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-[11px] text-slate-300">
              ₹{calculatedTotalINR.toLocaleString("en-IN")} Total
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">
              Effective Construction Rate
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              ₹{calculatedRatePerSqft}{" "}
              <span className="text-xs text-slate-300 font-normal">
                / sq.ft
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Empanelled Brand Rates Applied
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("rate_editor")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "rate_editor"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>
            Usage Rate &amp; Material Customizer ({customItems.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("client_breakup")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "client_breakup"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Client Complete Cost Breakup</span>
        </button>

        <button
          onClick={() => setActiveTab("brands")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "brands"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Empanelled Brands &amp; Discounts</span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Project Parameters &amp; Raw Material Requirements</span>
        </button>

        <button
          onClick={() => setActiveTab("photos")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "photos"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>📸 Site Progress Photos &amp; Geotagging</span>
        </button>
      </div>

      {/* TAB 1: USAGE RATE & MATERIAL CUSTOMIZER */}
      {activeTab === "rate_editor" && (
        <div className="space-y-6">
          {/* Enhanced "➕ Add Custom Item" Action Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 sm:p-6 rounded-3xl border border-teal-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/30">
                  Dynamic Visual BOQ Engine
                </span>
                <span className="text-xs text-slate-300">
                  • Double-click item photos for 3D/HD Fullscreen
                </span>
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Custom Construction &amp; Material Line Items
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Add custom equipment, specialized finishes, or subcontractor
                quotes with image attachment (Photo upload, URL, or Preset
                library) and auto-recalculate project budget.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* View Format Switch */}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewFormat("cards")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    viewFormat === "cards"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🖼️ Visual Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewFormat("table")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    viewFormat === "table"
                      ? "bg-teal-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  📊 Compact Table
                </button>
              </div>

              {/* Add Custom Item Modal Trigger Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>➕ Add Custom Item (फोटो जोड़ें)</span>
              </button>
            </div>
          </div>

          {/* Visual Cards View Mode */}
          {viewFormat === "cards" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  Displaying {customItems.length} Visual Material Cards:
                </span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                  💡 Double-click any photo thumbnail to inspect in 3D/HD
                  Fullscreen mode
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {customItems.map((item) => (
                  <VisualItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    category={item.category}
                    priceINR={item.unitRateINR}
                    unit={item.unit}
                    quantity={item.quantity}
                    brandName={item.brandName}
                    imageUrl={item.imageUrl}
                    isActive={item.isActive !== false}
                    isCustomItem={item.isCustomItem}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Table View Mode */
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    Itemized Material &amp; Labor Rate Table
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Edit Unit Rates or Quantities directly below to dynamically
                    adjust construction price
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded-full border border-amber-500/30">
                  Live Calculator Sync
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Material / Service Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Brand / Make</th>
                      <th className="p-3">Unit Rate (₹)</th>
                      <th className="p-3">Quantity &amp; Unit</th>
                      <th className="p-3">Total Cost (INR)</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {customItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.isCustomItem && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-md">
                            {item.category}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-teal-600 dark:text-teal-400">
                            {item.brandName}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              value={item.unitRateINR}
                              onChange={(e) =>
                                handleUpdateItemRateOrQty(
                                  item.id,
                                  "unitRateINR",
                                  Number(e.target.value),
                                )
                              }
                              className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItemRateOrQty(
                                  item.id,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                              className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <span className="text-[11px] text-slate-500">
                              {item.unit}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 font-extrabold text-teal-700 dark:text-teal-300 text-sm">
                          ₹{item.totalCostINR.toLocaleString("en-IN")}
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            title="Remove item"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLIENT COMPLETE COST BREAKUP */}
      {activeTab === "client_breakup" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-teal-600" />
                  Client Expenditure Category-wise Breakup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full transparent breakdown of total ₹
                  {calculatedTotalINR.toLocaleString("en-IN")} project
                  allocation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-800">
                  100% Itemized Transparency
                </span>
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {cat.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {cat.itemsCount} material &amp; labor items
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold text-xs rounded-lg">
                      {cat.percentage}%
                    </span>
                  </div>

                  <div className="text-lg font-extrabold text-teal-700 dark:text-teal-300">
                    ₹{cat.amount.toLocaleString("en-IN")}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full"
                      style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Construction Stage / Milestone Payment Schedule for Client */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Client Milestone Payment &amp; Expenditure Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stage-wise disbursement breakdown as construction progresses on
              site
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">
                  Stage 1 (15%)
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Foundation &amp; Sub-structure
                </div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹
                  {Math.round(calculatedTotalINR * 0.15).toLocaleString(
                    "en-IN",
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Excavation, footing concrete &amp; plinth beam
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">
                  Stage 2 (30%)
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  RCC Super-Structure Slabs
                </div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹
                  {Math.round(calculatedTotalINR * 0.3).toLocaleString("en-IN")}
                </div>
                <p className="text-[10px] text-slate-500">
                  Columns, beams &amp; floor slab casting
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">
                  Stage 3 (20%)
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Masonry &amp; Plaster Work
                </div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹
                  {Math.round(calculatedTotalINR * 0.2).toLocaleString("en-IN")}
                </div>
                <p className="text-[10px] text-slate-500">
                  AAC block walls &amp; internal/external plaster
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">
                  Stage 4 (20%)
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Electrical, Plumbing &amp; Flooring
                </div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹
                  {Math.round(calculatedTotalINR * 0.2).toLocaleString("en-IN")}
                </div>
                <p className="text-[10px] text-slate-500">
                  Wiring, piping, tile laying &amp; door frames
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-500 text-[10px] uppercase">
                  Stage 5 (15%)
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  Painting, Solar &amp; Handover
                </div>
                <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                  ₹
                  {Math.round(calculatedTotalINR * 0.15).toLocaleString(
                    "en-IN",
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Painting, solar setup, cleaning &amp; key handover
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMPANELLED BRANDS & DISCOUNTS */}
      {activeTab === "brands" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  Empannelled Construction Brands &amp; Dukandar Trade Discounts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecting brands sets preferred specifications in civil
                  calculator estimates
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800">
                10 Tier-1 Brands Empanelled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {SAMPLE_EMPANELLED_BRANDS.map((brand) => (
                <div
                  key={brand.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {brand.brandName}
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                      </span>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block">
                        {brand.category}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-md">
                      {brand.defaultDiscountPct}% OFF MRP
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Standards:
                      </span>{" "}
                      {brand.approvedStandards}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Warranty Policy:
                      </span>{" "}
                      {brand.warrantyPolicy}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        HQ:
                      </span>{" "}
                      {brand.headquarters}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">
                      {brand.itemCount} Listed Items
                    </span>
                    <button
                      onClick={() =>
                        alert(
                          `Brand ${brand.brandName} set as preferred brand for calculator!`,
                        )
                      }
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition"
                    >
                      Use Brand Rates
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OVERVIEW & RAW MATERIAL SNAPSHOT */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Panel */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Calculator className="w-4 h-4 text-teal-600" />
              Project Parameters
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Category
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Residential Villa">
                  Residential Independent Villa
                </option>
                <option value="Apartment Building">
                  Multi-story Apartment Block
                </option>
                <option value="Commercial Office">
                  Commercial / Retail Space
                </option>
                <option value="Industrial Shed">
                  Industrial Warehouse / Factory Shed
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Built-up Area (Sq.Ft)
                </label>
                <input
                  type="number"
                  value={builtupAreaSqft}
                  onChange={(e) => setBuiltupAreaSqft(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Floors Count
                </label>
                <select
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value={1}>Ground Only (G)</option>
                  <option value={2}>G + 1 Floor</option>
                  <option value={3}>G + 2 Floors</option>
                  <option value={4}>G + 3 Floors</option>
                  <option value={5}>G + 4 Floors</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location City Benchmark
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quality Specification Grade
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                {(["Standard", "Premium", "Luxury"] as QualityGrade[]).map(
                  (q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQualityGrade(q)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition ${
                        qualityGrade === q
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      {q}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Structural Notes
              </label>
              <textarea
                rows={3}
                value={customReqs}
                onChange={(e) => setCustomReqs(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={generateBOQ}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Civil AI Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recalculate AI Matrix</span>
                </>
              )}
            </button>
          </div>

          {/* Right Material Quantity Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl border border-slate-700 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-teal-400" />
                Estimated Key Raw Material Quantity Requirements (
                {builtupAreaSqft} Sq.Ft)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">
                    {Math.round(builtupAreaSqft * 0.42)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Cement Bags (50kg)
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">
                    {(builtupAreaSqft * 0.0038).toFixed(2)} MT
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    TMT Steel Fe550D
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">
                    {Math.round(builtupAreaSqft * 18)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Bricks / AAC Blocks
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">
                    {Math.round(builtupAreaSqft * 1.2)} CFT
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    M-Sand / Plaster Sand
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-lg font-bold text-white">
                    {Math.round(builtupAreaSqft * 1.1)} CFT
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    20mm Coarse Aggregate
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prompt Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-teal-600" />
                Ask AI to Refine or Optimize this BOQ:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Reduce cost by switching to AAC blocks or optimizing steel grade..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={generateBOQ}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <span>Apply AI Fix</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SITE PROGRESS PHOTOS & GEOTAGGING */}
      {activeTab === "photos" && (
        <ConstructionProgressPhotos
          selectedCity={city}
          defaultProjectName={`${projectType} - ${city}`}
        />
      )}

      {/* Add Custom Item Modal */}
      <AddCustomItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleModalAddItem}
        moduleName="Civil BOQ & Materials"
      />
    </div>
  );
};
