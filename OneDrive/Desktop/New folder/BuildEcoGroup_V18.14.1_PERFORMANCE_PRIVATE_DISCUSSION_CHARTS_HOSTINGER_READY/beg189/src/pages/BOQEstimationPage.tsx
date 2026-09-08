import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Layers, 
  Calculator, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Download,
  AlertTriangle,
  Building,
  TrendingDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { BOQEstimatorWidget } from '../components/home/BOQEstimatorWidget';
import { PageHeroMedia } from '../components/ui/ResponsiveMedia';
import { UniversalCaseIntakeModal } from '../components/common/UniversalCaseIntakeModal';

export const BOQEstimationPage: React.FC = () => {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [modalObjective, setModalObjective] = useState('Normalized BOQ & Cost Audit');

  const handleOpenIntakeWithEstimate = (estimateSummary: string) => {
    setModalObjective('BOQ & Construction Cost Normalization: ' + estimateSummary);
    setIsIntakeOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* 1. Hero Section */}
      <section className="pt-10 pb-16 bg-gradient-to-b from-[#FFFFFF] to-[#EAF6FB] border-b border-[var(--color-border)]">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" size="md" icon={<FileSpreadsheet className="w-3.5 h-3.5" />}>
              Commercial Engine
            </Badge>
            <span className="text-xs font-mono font-bold text-[var(--color-brand-brown)] bg-[#EAF7FC] px-2.5 py-1 rounded-full border border-[#C6DEE8]">
              CPWD & DSR Normalized Matrix
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text)] tracking-tight leading-tight">
                Normalized BOQ Estimation & <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary)]">Contractor Tender Packages</span>
              </h1>
              
              <p className="text-base text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Why do 80% of Indian construction projects suffer from 20-35% cost overruns? Because they rely on un-standardized contractor quotes. BuildEco creates itemized, CPWD-normalized Bill of Quantities (BOQ) with exact rebar tonnages and cement bags.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsIntakeOpen(true)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Generate Normalized BOQ
                </Button>
              </div>
            </div>

            {/* Quick Benefits Card */}
            <div className="lg:col-span-4 space-y-4">
              <PageHeroMedia assetKey="boq_hero_materials" className="rounded-2xl" />
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F2EC] pb-3">
                <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Normalization Impact</span>
                <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">AUDITED DATA</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Average Cost Savings:</span>
                  <span className="font-bold text-[var(--color-primary)]">14% - 22% Net</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Item Detail Depth:</span>
                  <span className="font-bold text-[var(--color-text)]">120+ Sub-trades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Rate Schedule:</span>
                  <span className="font-bold text-[var(--color-text)]">CPWD DSR 2024-26</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Tender Ready:</span>
                  <span className="font-bold text-[var(--color-brand-brown)]">Standardized RFP</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0F2EC] text-[11px] text-[var(--color-text-subtle)] flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>Prevents arbitrary contractor rate markups and hidden variation claims.</span>
              </div>
            </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Embedded Interactive BOQ Widget */}
      <div className="py-12">
        <BOQEstimatorWidget onOpenIntakeWithEstimate={handleOpenIntakeWithEstimate} />
      </div>

      {/* Universal Case Intake Modal */}
      <UniversalCaseIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        defaultObjective={modalObjective}
        defaultServiceId="boq"
        defaultCategory="BOQ"
      />
    </div>
  );
};
