import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MEGA_MENU_DATA } from '../../lib/constants';
import { ArrowRight, Layers, ShieldCheck, MapPin, Users, Sparkles, Globe, Calculator, SunMedium, Droplets } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Construction-related Services': <Layers className="w-4 h-4 text-[var(--color-primary)]" />,
  'Surveillance & Site Technology': <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />,
  'Land & Property Assistance': <MapPin className="w-4 h-4 text-[var(--color-primary)]" />,
  'Consultant for Every Department': <Users className="w-4 h-4 text-[var(--color-primary)]" />,
  'Innovation & Startup Introduction': <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />,
  'Land GIS & Spatial Analysis': <Globe className="w-4 h-4 text-[var(--color-brand-brown)]" />,
  'BOQ & Cost Normalization': <Calculator className="w-4 h-4 text-[var(--color-brand-brown)]" />,
  'Solar & Clean Energy Sizing': <SunMedium className="w-4 h-4 text-[var(--color-brand-brown)]" />,
  'Water Treatment & Rainwater': <Droplets className="w-4 h-4 text-[var(--color-brand-brown)]" />,
};

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-[1340px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Category 1: 5 Core Pillars */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  {MEGA_MENU_DATA[0].title}
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {MEGA_MENU_DATA[0].description}
                </p>
              </div>
              <Link
                to="/pillars"
                onClick={onClose}
                className="text-xs font-semibold text-[var(--color-primary)] hover:text-[#087EA8] flex items-center gap-1"
              >
                <span>View All 5 Pillars</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MEGA_MENU_DATA[0].items.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={onClose}
                  className="group flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-background)] transition-all"
                >
                  <div className="p-2 rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shrink-0 mt-0.5 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                    {ICON_MAP[item.title] || <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {item.title}
                      </span>
                      {item.badge && (
                        <Badge variant="primary" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Category 2: Specialized Capabilities */}
          <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] pt-6 lg:pt-0 lg:pl-8">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-brown)]">
                  {MEGA_MENU_DATA[1].title}
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {MEGA_MENU_DATA[1].description}
                </p>
              </div>
              <Link
                to="/technology"
                onClick={onClose}
                className="text-xs font-semibold text-[var(--color-brand-brown)] hover:text-[#0C2939] flex items-center gap-1"
              >
                <span>Explore Tech</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {MEGA_MENU_DATA[1].items.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={onClose}
                  className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--color-background)] border border-transparent hover:border-[var(--color-border)] transition-all"
                >
                  <div className="p-2 rounded-lg bg-[#EAF4F8] text-[var(--color-brand-brown)] shrink-0 mt-0.5 group-hover:bg-[#15364A] group-hover:text-white transition-colors">
                    {ICON_MAP[item.title] || <Sparkles className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-brand-brown)] transition-colors">
                      {item.title}
                    </span>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Helper Box */}
            <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-between">
              <div className="text-xs text-[var(--color-text-secondary)]">
                <strong className="font-semibold block text-[var(--color-text)]">Need a structured case?</strong>
                Speak directly with an orchestration coordinator.
              </div>
              <Link
                to="/contact?mode=requirement"
                onClick={onClose}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline shrink-0 ml-3"
              >
                Submit Case &rarr;
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
