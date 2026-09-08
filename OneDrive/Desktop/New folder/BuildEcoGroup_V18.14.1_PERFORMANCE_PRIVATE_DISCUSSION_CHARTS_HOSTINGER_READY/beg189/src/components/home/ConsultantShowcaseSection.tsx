import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2, 
  Briefcase,
  Compass,
  Building,
  GraduationCap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../lib/routes';
import { Link } from 'react-router-dom';

interface ConsultantShowcaseSectionProps {
  onOpenIntake: (objective: string, category: string) => void;
}

export const ConsultantShowcaseSection: React.FC<ConsultantShowcaseSectionProps> = ({
  onOpenIntake,
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');

  const disciplines = [
    { id: 'ALL', label: 'All Disciplines' },
    { id: 'STRUCTURAL', label: 'Structural Engineering' },
    { id: 'ARCHITECTURE', label: 'Bioclimatic Architecture' },
    { id: 'LAND_GIS', label: 'Land GIS & Hydrogeology' },
    { id: 'SOLAR', label: 'Solar & Clean Energy' },
    { id: 'WATER', label: 'Water & Waste Systems' },
    { id: 'VASTU', label: 'Vastu & Directional Energy' },
    { id: 'BOQ_QS', label: 'BOQ & Quantity Surveying' },
  ];

  const consultants = [
    {
      id: 'c1',
      name: 'Dr. Ar. Elena Rostova',
      role: 'Lead Bioclimatic Architect & Passive Specialist',
      institution: 'ETH Zurich Alumni • 18y Experience',
      city: 'Bengaluru, Karnataka',
      verified: 'Verified Empaneled Specialist',
      discipline: 'ARCHITECTURE',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      focus: ['Mass Timber Blueprints', 'Passive Solar Thermal', 'Daylighting Sim'],
      availability: 'Available for New Projects',
    },
    {
      id: 'c2',
      name: 'Er. Rajesh V. Nambiar, FIE',
      role: 'Senior Structural & Seismic Consultant',
      institution: 'IIT Bombay Alum • 22y Field Experience',
      city: 'Mumbai, Maharashtra',
      verified: 'Credential Vetted',
      discipline: 'STRUCTURAL',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      focus: ['Post-Tensioned RCC', 'Seismic Zone V Audits', 'Retrofitting'],
      availability: 'Available for Peer Review',
    },
    {
      id: 'c3',
      name: 'Er. Priya Swaminathan',
      role: 'Geospatial & Hydrogeology Specialist',
      institution: 'ITC Netherlands • 14y Field Experience',
      city: 'Hyderabad, Telangana',
      verified: 'Verified Empaneled Specialist',
      discipline: 'LAND_GIS',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      focus: ['LiDAR Topography', 'Aquifer Sizing', 'Flood Risk Contours'],
      availability: 'Available for Site GIS',
    },
    {
      id: 'c4',
      name: 'Er. Amitav Sengupta',
      role: 'Chief MEP & Microgrid Consultant',
      institution: 'IIT Roorkee • 16y Experience',
      city: 'New Delhi / NCR',
      verified: 'Verified Empaneled Specialist',
      discipline: 'SOLAR',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      focus: ['Zero-Energy HVAC', 'Rooftop Microgrids', 'BMS Automation'],
      availability: 'Available for Systems Vetting',
    },
  ];

  const filtered = selectedDiscipline === 'ALL'
    ? consultants
    : consultants.filter((c) => c.discipline === selectedDiscipline);

  return (
    <section id="consultants-section" className="py-16 sm:py-24 bg-[var(--color-background)] border-b border-[var(--color-border)] scroll-mt-20">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2">
              <Badge variant="primary" size="md" icon={<Users className="w-3.5 h-3.5" />}>
                Empaneled Technical Specialists
              </Badge>
              <span className="text-xs font-bold text-[var(--color-brand-brown)] uppercase tracking-wider">
                Multi-Disciplinary Roster
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
              Verified Independent Engineering & Architectural Network
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Direct access to peer-audited structural engineers, bioclimatic architects, geospatial scientists, and MEP consultants.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to={ROUTES.CONSULTANTS}>
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Full Directory (14+ Disciplines)
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {disciplines.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDiscipline(d.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDiscipline === d.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Consultants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((con) => (
            <div
              key={con.id}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative aspect-[4/3] bg-[var(--color-primary-border)] overflow-hidden">
                  <img
                    src={con.image}
                    alt={con.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-[var(--color-surface)]/90 backdrop-blur-xs text-[10px] font-bold text-[var(--color-primary)] rounded-md shadow-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[var(--color-primary)]" />
                      {con.verified}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)]">{con.name}</h3>
                    <div className="text-xs font-medium text-[var(--color-primary)] mt-0.5">{con.role}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{con.institution}</span>
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{con.city}</span>
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-border)]">
                    {con.focus.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-[var(--color-background)] text-[10px] font-medium text-[var(--color-text-muted)] rounded border border-[var(--color-border)]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-[var(--color-background)] border-t border-[var(--color-border)] grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenIntake(`Question for ${con.name} (${con.role})`, 'Consultant Network')}
                  className="py-1.5 px-2 text-center text-xs font-semibold text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Ask Question
                </button>
                <button
                  onClick={() => onOpenIntake(`Consultation Request: ${con.name}`, 'Consultant Network')}
                  className="py-1.5 px-2 text-center text-xs font-bold text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Book Consult
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
