import React from "react";
import { useFontSize } from "../context/FontSizeContext";
import { ZoomIn, ZoomOut } from "lucide-react";

export const FontSizeWidget: React.FC = () => {
  const { fontSizePercent, increaseFontSize, decreaseFontSize, resetFontSize } =
    useFontSize();

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-slate-300 text-xs">
      {/* 1. Decrease Font Size (A-) */}
      <button
        onClick={decreaseFontSize}
        disabled={fontSizePercent <= 85}
        className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition font-bold flex items-center gap-0.5"
        title="Decrease Font Size (A-)"
      >
        <ZoomOut size={13} /> A-
      </button>

      {/* 2. Current Size and Reset Button (A) */}
      <button
        onClick={resetFontSize}
        className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${
          fontSizePercent === 100
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "hover:bg-slate-800 text-slate-400"
        }`}
        title="Default Size (100%)"
      >
        A ({fontSizePercent}%)
      </button>

      {/* 3. Increase Font Size (A+) */}
      <button
        onClick={increaseFontSize}
        disabled={fontSizePercent >= 125}
        className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition font-bold flex items-center gap-0.5"
        title="Increase Font Size (A+)"
      >
        A+ <ZoomIn size={13} />
      </button>
    </div>
  );
};
