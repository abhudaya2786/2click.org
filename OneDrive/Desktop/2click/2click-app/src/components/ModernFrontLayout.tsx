import React from "react";
import {
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  ShieldCheck,
  Activity,
  Zap,
  Box,
  Sun,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface ModernFrontLayoutProps {
  onExploreClick: () => void;
}

export const ModernFrontLayout: React.FC<ModernFrontLayoutProps> = ({
  onExploreClick,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Multi-Layer Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center relative z-10 space-y-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-2xl backdrop-blur-md">
          <Sparkles size={14} className="text-emerald-400 animate-pulse" />
          <span>
            Next-Gen Construction, Solar &amp; Interior AI Ecosystem (2026
            Edition)
          </span>
        </div>

        {/* Main Title with Metallic Gradient */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white max-w-5xl mx-auto">
          AI, LiDAR &amp; VR Super App for <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">
            Construction, Solar &amp; Interior Projects
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
          त्वरित AI BOQ एस्टीमेट, 3D LiDAR टरैन मैपिंग, VR इंटीरियर वॉकथ्रू,
          सोलर सब्सिडी कैलकुलेटर और वेंडर डायरेक्टरी — सब कुछ 2-क्लिक में।
        </p>

        {/* Action Buttons & Quick Metrics Bar */}
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onExploreClick}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center gap-3 transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <span>सभी टूल्स एवं डैशबोर्ड एक्सेस करें (Open Super App)</span>
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Graphic Highlights Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-2 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> IS 456:2000
              &amp; CPWD DSR 2023 Verified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PM Surya
              Ghar Solar Subsidy Integrated
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2click
              Escrow &amp; Binding Contracts
            </span>
          </div>
        </div>

        {/* Rich Feature Cards Graphic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 max-w-5xl mx-auto text-left">
          <div className="p-6 bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl space-y-3 card-hover-effect relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition"></div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg">
              <Cpu size={24} />
            </div>
            <h3 className="font-extrabold text-base text-white flex items-center justify-between">
              <span>AI Engine &amp; BOQ Hub</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                v3.6 AI
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              सिविल, सोलर, इलेक्ट्रिकल और टाइल्स का सटीक एस्टीमेट और मटीरियल
              ब्रेकडाउन तुरंत निकालें।
            </p>
          </div>

          <div className="p-6 bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl space-y-3 card-hover-effect relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition"></div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-lg">
              <Layers size={24} />
            </div>
            <h3 className="font-extrabold text-base text-white flex items-center justify-between">
              <span>Hyper-Local Directory</span>
              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full">
                GPS Live
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              अपने जिले व मंडल के सत्यापित ठेकेदार, हार्डवेयर दुकानें एवं
              ट्रांसपोर्टर खोजें।
            </p>
          </div>

          <div className="p-6 bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl space-y-3 card-hover-effect relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl group-hover:bg-sky-500/20 transition"></div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shadow-lg">
              <Lock size={24} />
            </div>
            <h3 className="font-extrabold text-base text-white flex items-center justify-between">
              <span>RBAC &amp; Finance Audit</span>
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">
                Secure
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              सुपर एडमिन, फील्ड इंजीनियर, बैंक लोन ऑफिसर व वेंडर के लिए पृथक
              परमिशन गवर्नेंस।
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500 font-medium">
        © 2026 2click.in — Enterprise Construction, Solar &amp; Interior
        Platform. All Rights Reserved.
      </footer>
    </div>
  );
};
