import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../lib/constants';
import { ROUTES } from '../../lib/routes';
import { BuildEcoGroupLogo } from '../brand/BuildEcoGroupLogo';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowUpRight,
  MessageSquare,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('arch-footer pt-14 pb-10', className)}>
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Contact Strip with Direct Action Buttons */}
        <div className="arch-footer-panel p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <div className="arch-kicker text-[var(--color-arch-accent-light)]">
              Official BuildEcoGroup Support & Coordination Desk
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Connect directly with our engineering & project coordinators
            </h3>
            <p className="text-xs text-[var(--color-arch-muted-on-navy)] max-w-xl">
              Official: <span className="text-white font-medium">{APP_CONFIG.contactEmail}</span> • Phone: <span className="text-white font-medium">{APP_CONFIG.supportPhone}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={`tel:${APP_CONFIG.supportPhone.replace(/\s+/g, '')}`}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-[var(--color-brand-navy-panel)] text-white hover:bg-[var(--color-brand-navy-border)] border border-[var(--color-brand-navy-border)] font-semibold"
                leftIcon={<Phone className="w-4 h-4 text-[var(--color-arch-accent-sky)]" />}
              >
                Call
              </Button>
            </a>
            <a href={`mailto:${APP_CONFIG.contactEmail}`}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-[var(--color-brand-navy-panel)] text-white hover:bg-[var(--color-brand-navy-border)] border border-[var(--color-brand-navy-border)] font-semibold"
                leftIcon={<Mail className="w-4 h-4 text-[var(--color-arch-accent-sky)]" />}
              >
                Email
              </Button>
            </a>
            <Link to={ROUTES.INITIATE_PROJECT}>
              <Button
                variant="primary"
                size="sm"
                className="font-bold"
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Ask a Question
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Clean Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-xs">
          
          {/* Column 1: Brand & Promise */}
          <div className="space-y-4">
            <Link to={ROUTES.HOME} className="inline-block group focus-visible:outline-hidden">
              <BuildEcoGroupLogo
                variant="full"
                theme="dark"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
            
            <p className="text-sm font-semibold text-white leading-snug">
              From Land to Project.<br />From Construction to Management.
            </p>

            <p className="text-xs text-[var(--color-arch-muted-on-navy)] leading-relaxed">
              One connected ecosystem for land development, construction management, professionals, procurement and property lifecycle.
            </p>

            <div className="pt-2 text-[11px] text-[var(--color-arch-muted-on-navy)] space-y-1">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-arch-accent-sky)] shrink-0 mt-0.5" />
                <span>{APP_CONFIG.officeAddress}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <Globe className="w-3.5 h-3.5 text-[var(--color-arch-accent-sky)] shrink-0" />
                <a href={APP_CONFIG.officialDomain} target="_blank" rel="noreferrer" className="text-[var(--color-arch-accent-sky)] hover:underline font-mono">
                  www.buildecogroup.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Flagship Journeys */}
          <div className="space-y-3">
            <h4 className="arch-footer-heading">
              Ecosystem Journeys
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to={ROUTES.LAND_DEVELOPMENT} className="arch-footer-link flex items-center justify-between">
                  <span>Land Management</span>
                  <span className="text-[10px] text-[var(--color-arch-accent-sky)]">Land to Project</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONSTRUCTION_MANAGEMENT} className="arch-footer-link flex items-center justify-between">
                  <span>Construction Management</span>
                  <span className="text-[10px] text-[#A0A8A2]">Plan to Handover</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PROPERTY} className="arch-footer-link flex items-center justify-between">
                  <span>Property Ecosystem</span>
                  <span className="text-[10px] text-[#A0A8A2]">Buy • Sell • Manage</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.BOQ_ESTIMATION} className="arch-footer-link flex items-center justify-between">
                  <span>BOQ & Cost Estimator</span>
                  <span className="text-[10px] text-[#A0A8A2]">16+ Categories</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONSULTANTS} className="arch-footer-link flex items-center justify-between">
                  <span>Consultant Directory</span>
                  <span className="text-[10px] text-[#A0A8A2]">13 Disciplines</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PROJECTS} className="arch-footer-link">
                  Case Studies & Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Join Network */}
          <div className="space-y-3">
            <h4 className="arch-footer-heading">
              Join Network
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to={`${ROUTES.ONBOARDING}?role=CONSULTANT`} className="arch-footer-link flex items-center justify-between">
                  <span>Professional Empanelment</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-arch-accent-sky)]" />
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ONBOARDING}?role=VENDOR`} className="arch-footer-link flex items-center justify-between">
                  <span>Vendor & Material Mart</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-arch-muted-on-navy)]" />
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ONBOARDING}?role=DISTRIBUTOR`} className="arch-footer-link flex items-center justify-between">
                  <span>Brand & Distributor</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-arch-muted-on-navy)]" />
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ONBOARDING}?role=SKILLED_PERSON`} className="arch-footer-link flex items-center justify-between">
                  <span>Skilled Person (Electrician, Plumber, etc.)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-arch-accent-sky)]" />
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ONBOARDING}?role=MACHINERY`} className="arch-footer-link flex items-center justify-between">
                  <span>Machinery & Equipment Provider</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-arch-muted-on-navy)]" />
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ONBOARDING}?role=DEVELOPER`} className="arch-footer-link flex items-center justify-between">
                  <span>Land Provider / Developer</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-arch-muted-on-navy)]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Legal */}
          <div className="space-y-3">
            <h4 className="arch-footer-heading">
              Contact & Governance
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to={ROUTES.CONTACT} className="arch-footer-link">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ABOUT}#privacy`} className="arch-footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ABOUT}#terms`} className="arch-footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.ABOUT}#disclaimer`} className="arch-footer-link">
                  Platform Disclaimer & Governance
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="arch-footer-link">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="arch-footer-link">
                  Customer Registration
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Governance & Disclaimer Note */}
        <div className="arch-footer-panel p-4 text-[11px] text-[var(--color-arch-muted-on-navy)] leading-relaxed">
          <p>
            <strong className="text-white font-semibold">Platform Disclaimer:</strong> BuildEcoGroup operates as a connected coordination and technical orchestration platform. All architectural and structural drawings, BOQ calibrations, soil tests, and construction contracts are executed by independent licensed professionals, accredited consultants, and empaneled vendors. Statutory approvals must be confirmed with the respective municipal and town planning authorities.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--color-brand-navy-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-arch-muted-on-navy)]">
          <div>
            &copy; {currentYear} BuildEcoGroup. All rights reserved. • <span className="font-mono">{APP_CONFIG.version}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[var(--color-arch-accent-light)] px-2.5 py-0.5 rounded-full bg-[var(--color-brand-navy-panel)] border border-[var(--color-brand-navy-border)]">
              Query ID • Case ID • Project ID Connected
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
