'use client';

import React, { useState } from 'react';
import { 
  Droplets, 
  Leaf, 
  Factory, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  ShieldCheck, 
  PhoneCall,
  Sparkles,
  FileSpreadsheet,
  Download,
  Building2,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';
import { PageHeroMedia } from '../components/ui/ResponsiveMedia';
import { WaterEngineeringCalculator } from './WaterEngineeringCalculator';

export default function WaterLandingPage() {
  // Calculator State
  const [plantType, setPlantType] = useState<'STP' | 'ETP'>('STP');
  const [load, setLoad] = useState<number>(50); // Units: Persons or Vehicles
  
  // Interactive Modal State
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState<boolean>(false);
  const [intakeObjective, setIntakeObjective] = useState<string>('Decentralized STP / ETP & Smart Irrigation Sizing');
  const [isBOQSuccessOpen, setIsBOQSuccessOpen] = useState<boolean>(false);

  // Quick estimation logic
  const calculateOutput = () => {
    if (plantType === 'STP') {
      const dailySewage = load * 120; // 120 Liters per person approx.
      const kld = (dailySewage / 1000).toFixed(1);
      const recycledWater = (dailySewage * 0.7).toFixed(0);
      const lawnCovered = (dailySewage * 0.7 / 5).toFixed(0); // 70% reuse, 5L/sq.m for lawn
      return { 
        capacity: `${kld} KLD`, 
        reuse: `${recycledWater} L/day`, 
        lawn: `${lawnCovered} sq.m`,
        rawVol: dailySewage,
        energyKwh: (Number(kld) * 1.8).toFixed(1),
        annualSavings: (Number(recycledWater) * 365 * 0.08).toLocaleString('en-IN')
      };
    } else {
      const dailyEffluent = load * 150; // 150 Liters per car wash approx.
      const kld = (dailyEffluent / 1000).toFixed(1);
      const recycledWater = (dailyEffluent * 0.8).toFixed(0); // 80% recycled
      const lawnCovered = (Number(recycledWater) * 0.3 / 5).toFixed(0);
      return { 
        capacity: `${kld} KLD`, 
        reuse: `${recycledWater} L/day`, 
        lawn: `${lawnCovered} sq.m`,
        rawVol: dailyEffluent,
        energyKwh: (Number(kld) * 2.2).toFixed(1),
        annualSavings: (Number(recycledWater) * 365 * 0.12).toLocaleString('en-IN')
      };
    }
  };

  const results = calculateOutput();

  const handleOpenIntake = (objectiveName: string) => {
    setIntakeObjective(objectiveName);
    setIsIntakeModalOpen(true);
  };

  const handleRequestBOQ = () => {
    setIsBOQSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-7 w-7 text-teal-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
              AquaTerra Solutions
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-teal-600 transition">Services</a>
            <a href="#integrated-flow" className="hover:text-teal-600 transition">System Flow</a>
            <a href="#calculator" className="hover:text-teal-600 transition">ROI Sizing</a>
            <a href="#compliance" className="hover:text-teal-600 transition">Compliance</a>
            <a href="#contact" className="hover:text-teal-600 transition">Specifications</a>
          </nav>
          <button 
            type="button"
            onClick={() => handleOpenIntake('Water Treatment & STP/ETP DPR Request')}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
          >
            <PhoneCall className="h-4 w-4" /> Get DPR / Quote
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 to-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              CPCB & SPCB Standard Compliant
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              From Wastewater Treatment to <span className="text-emerald-600">Lush Landscapes</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Complete decentralized engineering for <strong>STP, ETP, Industrial RO</strong> integrated with automated drip & sprinkler irrigation for institutional, commercial, and industrial facilities.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a 
                href="#calculator" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition"
              >
                Estimate Plant Capacity <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a 
                href="#services" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-[var(--color-surface)] border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Explore Modules
              </a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <PageHeroMedia assetKey="water_stp_modular" className="rounded-3xl shadow-xl" />
          </div>
        </div>
      </section>

      {/* 3. Core Modules Grid */}
      <section id="services" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Engineered Water Systems</h2>
          <p className="mt-3 text-slate-600">Tailored treatment plants delivering high-grade recycled water.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* STP */}
          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Droplets className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">STP (Sewage)</h3>
            <p className="text-slate-600 text-sm mb-4">MBBR & SBR technology for residential townships, hotels, and schools.</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• BOD &lt; 10 mg/L output</li>
              <li>• Odorless underground designs</li>
              <li>• Automated sludge recirculation</li>
            </ul>
          </div>

          {/* ETP */}
          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Factory className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">ETP (Effluent)</h3>
            <p className="text-slate-600 text-sm mb-4">Chemical & DAF systems for car washes, dairy, and textile units.</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Heavy oil & grease removal</li>
              <li>• Sludge dewatering press</li>
              <li>• Dual-stage chemical coagulation</li>
            </ul>
          </div>

          {/* RO Plants */}
          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tertiary & RO</h3>
            <p className="text-slate-600 text-sm mb-4">DMF + ACF + Micron filtration for high purity and final process rinse.</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Low TDS output for boilers/wash</li>
              <li>• Membrane fouling protection</li>
              <li>• Integrated UV disinfection stage</li>
            </ul>
          </div>

          {/* Smart Gardening */}
          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Gardening</h3>
            <p className="text-slate-600 text-sm mb-4">Direct plumbed drip lines & automated sprinklers fed by treated water.</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Soil moisture sensor triggers</li>
              <li>• 100% Zero discharge utilization</li>
              <li>• Automated solenoid manifold valves</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Integrated Flow Chart */}
      <section id="integrated-flow" className="py-16 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Closed-Loop Recycling Architecture</h2>
            <p className="mt-2 text-slate-600">How raw wastewater transforms into irrigation and utility water.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Step 01</span>
              <h4 className="font-bold text-slate-800 mt-1">Raw Inflow</h4>
              <p className="text-xs text-slate-500 mt-2">Sewage or industrial effluent collection into Equalization Tank.</p>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-teal-600 uppercase">Step 02</span>
              <h4 className="font-bold text-slate-800 mt-1">Biological / Physicochemical</h4>
              <p className="text-xs text-slate-500 mt-2">MBBR media or coagulant clarifiers reduce COD/BOD/TSS by 90%.</p>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border-2 border-emerald-500">
              <span className="text-xs font-bold text-emerald-600 uppercase">Step 03</span>
              <h4 className="font-bold text-slate-800 mt-1">Secondary Sand/Carbon</h4>
              <p className="text-xs text-slate-500 mt-2">Direct output to automated <strong>Gardening Drip Networks</strong>.</p>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase">Step 04</span>
              <h4 className="font-bold text-slate-800 mt-1">RO / UV Polishing</h4>
              <p className="text-xs text-slate-500 mt-2">Demineralized water for high-pressure washing or toilet flushing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Comprehensive Hydraulic & Sizing Engine */}
      <section id="calculator" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WaterEngineeringCalculator 
          onRequestBOQ={(summary) => {
            setIntakeObjective(summary || 'Water Treatment Plant Equipment Schedule & BOQ Sizing');
            setIsIntakeModalOpen(true);
          }}
          onRequestConsultation={(spec) => {
            setIntakeObjective(spec || 'Chartered Environmental & Hydraulic Engineering Consultation');
            setIsIntakeModalOpen(true);
          }}
        />
      </section>

      {/* 6. Compliance Banner */}
      <section id="compliance" className="bg-teal-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-lg font-bold">100% Pollution Board NOC Support</h3>
              <p className="text-sm text-teal-200">DPR generation, environmental reporting, and water testing matrix adherence.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 rounded bg-teal-800 text-xs font-mono">CPCB Guidelines</span>
            <span className="px-3 py-1 rounded bg-teal-800 text-xs font-mono">ZLD Solutions</span>
            <span className="px-3 py-1 rounded bg-teal-800 text-xs font-mono">LEED Credits</span>
            <span className="px-3 py-1 rounded bg-teal-800 text-xs font-mono">SPCB Consents</span>
          </div>
        </div>
      </section>

      {/* Contact / Engineering Scope Section */}
      <section id="contact" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--color-surface)] p-8 rounded-3xl border border-slate-200 shadow-sm grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-600">Direct Engineering Desk</span>
            <h3 className="text-2xl font-bold text-slate-900">Need a detailed site survey or technical DPR?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our chartered environmental and civil engineers formulate Detailed Project Reports (DPR), hydraulic sizing calculations, and BOQs with complete SPCB CTE/CTO filing assistance.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleOpenIntake(`Engineering DPR for ${results.capacity} ${plantType} & Irrigation`)}
              className="w-full py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Schedule Engineering Consultation
            </button>
            <button
              type="button"
              onClick={handleRequestBOQ}
              className="w-full py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Download Sizing Spec Template
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Droplets className="h-5 w-5 text-teal-400" />
            <span>AquaTerra Solutions</span>
          </div>
          <p>© {new Date().getFullYear()} AquaTerra Solutions. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#calculator" className="hover:text-white">Estimator</a>
            <a href="#compliance" className="hover:text-white">Compliance</a>
          </div>
        </div>
      </footer>

      {/* BOQ Request Modal Confirmation */}
      {isBOQSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsBOQSuccessOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">BOQ Sizing Spec Generated</h3>
            <p className="text-xs text-slate-500 mt-1">
              Estimated Plant Sizing: <strong className="text-teal-700">{results.capacity} ({plantType})</strong> for {load} {plantType === 'STP' ? 'users' : 'vehicles'}.
            </p>

            <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recycled Water Yield:</span>
                <span className="font-bold text-slate-800">{results.reuse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Irrigation Lawn Coverage:</span>
                <span className="font-bold text-emerald-700">{results.lawn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pollution Board Matrix:</span>
                <span className="font-bold text-teal-700">CPCB & SPCB Standard</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsBOQSuccessOpen(false);
                  handleOpenIntake(`BOQ & Layout Request for ${results.capacity} ${plantType}`);
                }}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Submit for Engineering Team Review & BOM
              </button>
              <button
                type="button"
                onClick={() => setIsBOQSuccessOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Case Intake Modal */}
      <UniversalCaseIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        defaultObjective={intakeObjective}
        defaultCategory="WATER_TREATMENT"
      />

    </div>
  );
}

export { WaterLandingPage };
