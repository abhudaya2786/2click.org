import React, { useState } from "react";
import {
  Maximize2,
  Layers,
  Download,
  Compass,
  BarChart3,
  Activity,
  ShieldCheck,
  Info,
  MapPin,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { SAMPLE_LIDAR_SURVEY } from "../data/initialData";

export const LidarSurveyViewer: React.FC = () => {
  const [survey] = useState(SAMPLE_LIDAR_SURVEY);
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Terrain" | "Structure" | "Vegetation" | "Boundary"
  >("All");
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [contourInterval, setContourInterval] = useState<number>(0.5);

  const filteredPoints = survey.points.filter(
    (p) => activeFilter === "All" || p.classification === activeFilter,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              <Maximize2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              3D LiDAR Point Cloud & Contour Survey Engine
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sub-centimeter topographical surveying, volumetric cut/fill analysis
            & CAD elevation mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              alert("Exporting LAS Point Cloud & DXF Contour Files...")
            }
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-4 h-4" /> Export DXF / LAS CAD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Stats & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-cyan-600" />
              Survey Metadata & Telemetry
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Survey ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {survey.id}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {survey.location}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Point Density:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  {(survey.pointCount / 1000000).toFixed(2)} M Points
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Survey Area:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {survey.areaSqMeters.toLocaleString()} m² (12.0 Acres)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Survey Accuracy:</span>
                <span className="font-bold text-emerald-600">
                  ±{survey.accuracyCm} cm Ground Error
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Point Cloud Layer Classification Filter
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    "All",
                    "Terrain",
                    "Structure",
                    "Vegetation",
                    "Boundary",
                  ] as const
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      activeFilter === f
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contour Line Step Interval: {contourInterval}m
              </label>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.1}
                value={contourInterval}
                onChange={(e) => setContourInterval(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Interactive Point Cloud Canvas Simulator */}
        <div className="lg:col-span-8">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-6 shadow-2xl min-h-[420px] flex flex-col justify-between">
            {/* Top Bar inside Canvas */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  LiDAR Point Cloud Live View
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setIs3DMode(true)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    is3DMode ? "bg-cyan-600 text-white" : "text-slate-400"
                  }`}
                >
                  3D Mesh
                </button>
                <button
                  onClick={() => setIs3DMode(false)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    !is3DMode ? "bg-cyan-600 text-white" : "text-slate-400"
                  }`}
                >
                  Contour Lines
                </button>
              </div>
            </div>

            {/* Point Cloud Simulation Grid Visualizer */}
            <div className="my-8 relative h-64 w-full flex items-center justify-center">
              {/* Simulated elevation mesh lines */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-2 opacity-30">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-cyan-500/30 rounded-xs flex items-center justify-center text-[9px] font-mono text-cyan-300"
                  >
                    {(560 + (i % 7) * 0.8).toFixed(1)}m
                  </div>
                ))}
              </div>

              {/* Point Cloud Dots */}
              <div className="relative z-10 w-full h-full flex flex-wrap items-center justify-around p-4">
                {filteredPoints.map((pt, index) => (
                  <div
                    key={pt.id}
                    className="group relative flex flex-col items-center cursor-pointer"
                    style={{
                      transform: `translate(${(index * 15) % 80}px, ${(index * 12) % 40}px)`,
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg transition hover:scale-150 ${
                        pt.classification === "Terrain"
                          ? "bg-emerald-500 shadow-emerald-500/50"
                          : pt.classification === "Structure"
                            ? "bg-amber-500 shadow-amber-500/50"
                            : pt.classification === "Vegetation"
                              ? "bg-teal-400 shadow-teal-400/50"
                              : "bg-cyan-400 shadow-cyan-400/50"
                      }`}
                    >
                      {pt.z.toFixed(0)}m
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-6 hidden group-hover:block bg-slate-900 border border-slate-700 text-white p-2 rounded text-[10px] whitespace-nowrap z-30 shadow-xl">
                      <div className="font-bold text-cyan-400">
                        {pt.classification} Point
                      </div>
                      <div>Elevation: {pt.z}m</div>
                      <div>Intensity: {pt.intensity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Telemetry Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 z-10 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />{" "}
                  Terrain
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{" "}
                  Structure
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />{" "}
                  Vegetation
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />{" "}
                  Boundary
                </span>
              </div>

              <div className="font-mono text-cyan-300">
                Max Height: 564.2m · Min Height: 548.0m
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
