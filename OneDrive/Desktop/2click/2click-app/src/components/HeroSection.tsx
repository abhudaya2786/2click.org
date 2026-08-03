import React, { useState } from "react";
import {
  Building2,
  Sun,
  Sparkles,
  Box,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Maximize2,
  FileText,
  Eye,
  Sliders,
} from "lucide-react";
import { INDIAN_CITIES } from "../data/initialData";

interface HeroSectionProps {
  onNavigate: (tab: string, quickData?: any) => void;
  selectedCity: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  selectedCity,
}) => {
  const [projectType, setProjectType] = useState<
    "construction" | "solar" | "interior"
  >("construction");
  const [areaSqft, setAreaSqft] = useState<number>(1800);
  const [activePreview, setActivePreview] = useState<
    "boq" | "lidar" | "vr" | "solar"
  >("boq");

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(projectType, { areaSqft, city: selectedCity });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60 dark:border-slate-800">
      {/* Background Accent Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-teal-400/10 via-cyan-400/10 to-violet-500/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-300/80 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>
              PM Surya Ghar Muft Bijli & IS 456 Civil AI Engine Updated for 2026
            </span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="mt-6 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            AI, LiDAR & VR Super App for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-600 dark:from-teal-400 dark:via-cyan-300 dark:to-violet-400">
              Construction, Solar & Interiors
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Instant AI Bill of Quantities (BOQ), 3D LiDAR terrain mapping, 360°
            VR interior walkthroughs, and rooftop solar ROI calculations in 2
            clicks.
          </p>
        </div>

        {/* Quick Estimator Tool Bar */}
        <div className="mt-8 max-w-4xl mx-auto space-y-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md">
            {/* Quick Domain Jumps */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-4">
              <button
                onClick={() => onNavigate("construction")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center"
              >
                🏗️ Civil BOQ
              </button>
              <button
                onClick={() => onNavigate("logistics")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center"
              >
                🚚 Logistics &amp; Fleet
              </button>
              <button
                onClick={() => onNavigate("water_etp_stp")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center"
              >
                💧 Water ETP/STP
              </button>
              <button
                onClick={() => onNavigate("electrical_elv")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center"
              >
                ⚡ Electrical
              </button>
              <button
                onClick={() => onNavigate("vendors_binding")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center"
              >
                🤝 Bidding
              </button>
              <button
                onClick={() => onNavigate("solar")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center"
              >
                ☀️ Solar Engine
              </button>
            </div>

            {/* Input Controls Form */}
            <form
              onSubmit={handleQuickEstimate}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target City (Rates Benchmark)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedCity}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {projectType === "solar"
                    ? "Monthly Bill (INR ₹)"
                    : "Plot / Built-up Area (Sq.Ft)"}
                </label>
                <input
                  type="number"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={
                    projectType === "solar" ? "e.g. 4500" : "e.g. 1800"
                  }
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Generate Instant AI Estimate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Interactive Technology Showcase Preview */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Feature List Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Why Indian Developers, Architects & Solar Installers Use
              2click.in:
            </h3>

            <div className="space-y-3">
              <div
                onClick={() => {
                  setActivePreview("boq");
                  onNavigate("construction");
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  activePreview === "boq"
                    ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-sm"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-600 text-white mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      AI Civil BOQ & Material Estimator
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Itemized cement, steel Fe550D, bricks & aggregate
                      quantities with IS 456 compliance.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setActivePreview("lidar");
                  onNavigate("lidar");
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  activePreview === "lidar"
                    ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-sm"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-600 text-white mt-0.5">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      LiDAR 3D Point Cloud & Contour Mapping
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Sub-centimeter topographical land survey with volumetric
                      cut & fill analytics.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setActivePreview("vr");
                  onNavigate("vr");
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  activePreview === "vr"
                    ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-sm"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-violet-600 text-white mt-0.5">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      360° VR BIM & Interior Walkthroughs
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Interactive virtual reality models with structural
                      wireframe & lighting toggles.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setActivePreview("solar");
                  onNavigate("solar");
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  activePreview === "solar"
                    ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-sm"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500 text-white mt-0.5">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Rooftop Solar & PM Surya Ghar Calculator
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Net metering, subsidy calculation up to ₹78,000 & 25-year
                      payback projection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Screen Preview Image Box */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl bg-slate-900 group">
              <img
                src={
                  activePreview === "boq"
                    ? "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                    : activePreview === "lidar"
                      ? "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80"
                      : activePreview === "vr"
                        ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                        : "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80"
                }
                alt="2click super app visual feature"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover opacity-90 transition-all duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-between p-6">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-teal-500/90 text-white text-xs font-bold tracking-wider uppercase">
                    Live Platform Preview · {activePreview.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-300 font-mono bg-black/50 px-2.5 py-1 rounded">
                    IS Code 456 Verified
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white drop-shadow-md">
                    {activePreview === "boq" &&
                      "Interactive AI Bill of Quantities Engine"}
                    {activePreview === "lidar" &&
                      "LiDAR Topographical Point Cloud Matrix"}
                    {activePreview === "vr" &&
                      "360° Interactive BIM Spatial Walkthrough"}
                    {activePreview === "solar" &&
                      "PM Surya Ghar Solar Rooftop Analyzer"}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Engineered for Indian site conditions, municipal bylaws,
                    state DISCOM solar net metering, and CPWD rate benchmarks.
                  </p>

                  <button
                    onClick={() =>
                      onNavigate(
                        activePreview === "boq"
                          ? "construction"
                          : activePreview,
                      )
                    }
                    className="mt-4 px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition shadow-md"
                  >
                    <span>Launch {activePreview.toUpperCase()} Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              12,400+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Sites Surveyed in India
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              ₹450 Cr+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Material Savings in BOQs
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              99.2%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              LiDAR Elevation Accuracy
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              200+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Cities Across India
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
