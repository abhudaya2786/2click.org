import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ImagePlus, MapPinned, Ruler, Search, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ResponsiveMedia } from '../ui/ResponsiveMedia';
import { SERVICES_CATALOG } from '../../lib/servicesRegistry';
import { serviceMediaKey } from '../../lib/serviceMedia';
import { ROUTES } from '../../lib/routes';
import { getServiceEvidenceGuide } from '../../lib/serviceEvidenceConfig';
import { cn } from '../../lib/cn';

interface CategorySelectionPanelProps {
  savedInterests?: string[] | null;
  onSave: (interests: string[], customSuggestion?: string) => Promise<void>;
}

const DASHBOARD_PRIORITY_IDS = ['construction', 'interior', 'solar', 'land', 'boq', 'material'];

export const CategorySelectionPanel: React.FC<CategorySelectionPanelProps> = ({
  savedInterests,
  onSave,
}) => {
  const [selected, setSelected] = useState<string[]>(savedInterests || []);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedInterests?.length) setSelected(savedInterests);
  }, [savedInterests]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = SERVICES_CATALOG.filter((service) =>
      !query
      || service.shortTitle.toLowerCase().includes(query)
      || service.title.toLowerCase().includes(query)
      || service.categoryGroupLabel.toLowerCase().includes(query)
      || service.tagline.toLowerCase().includes(query)
    );
    if (query) return matches;
    return [...matches].sort((left, right) => {
      const leftRank = DASHBOARD_PRIORITY_IDS.indexOf(left.id);
      const rightRank = DASHBOARD_PRIORITY_IDS.indexOf(right.id);
      return (leftRank === -1 ? Number.MAX_SAFE_INTEGER : leftRank)
        - (rightRank === -1 ? Number.MAX_SAFE_INTEGER : rightRank);
    });
  }, [search]);

  const visibleServices = search || showAll ? filtered : filtered.slice(0, 6);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selected, showOther && customCategory.trim() ? customCategory.trim() : undefined);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
      data-testid="category-selection-panel"
      aria-labelledby="dashboard-service-forms-title"
    >
      <div className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-subtle)] to-[var(--color-surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
              <h2 id="dashboard-service-forms-title" className="text-xl font-extrabold text-[var(--color-text)]">
                Services & Requirement Forms
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--color-text-muted)]">
              Choose a service, add site details, measurements, photos or live capture, and optional GPS location.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="neutral" size="sm" icon={<Ruler className="h-3 w-3" />}>Service measurements</Badge>
              <Badge variant="neutral" size="sm" icon={<ImagePlus className="h-3 w-3" />}>Upload + live camera</Badge>
              <Badge variant="neutral" size="sm" icon={<MapPinned className="h-3 w-3" />}>Optional geo-location</Badge>
            </div>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search services"
              placeholder="Search a service..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-base outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {visibleServices.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((service) => {
              const isOn = selected.includes(service.id);
              const evidenceGuide = getServiceEvidenceGuide(service.id);
              return (
                <article key={service.id} className="beg-depth-card group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] transition duration-300 hover:border-[var(--color-primary)]/50">
                  <ResponsiveMedia
                    assetKey={serviceMediaKey(service.id)}
                    aspectRatio="16:9"
                    showBadge={false}
                    className="rounded-none border-0 border-b border-[var(--color-border)]"
                    imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-brand-brown)]">{service.categoryGroupLabel}</p>
                        <h3 className="mt-1 text-base font-extrabold text-[var(--color-text)]">{service.shortTitle}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(service.id)}
                        aria-pressed={isOn}
                        aria-label={`${isOn ? 'Remove' : 'Add'} ${service.shortTitle} ${isOn ? 'from' : 'to'} interests`}
                        className={cn(
                          'flex min-h-9 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[10px] font-bold transition-colors',
                          isOn
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
                        )}
                      >
                        {isOn && <Check className="h-3 w-3" aria-hidden="true" />}
                        {isOn ? 'Interested' : 'Save interest'}
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-relaxed text-[var(--color-text-muted)]">{service.tagline}</p>
                    <p className="mt-3 text-[10px] font-semibold text-[var(--color-text-subtle)]">
                      {evidenceGuide.shots.length} suggested photo angles · {evidenceGuide.measurements.length} measurement fields
                    </p>
                    <Link
                      to={`${ROUTES.INITIATE_PROJECT}?service=${encodeURIComponent(service.id)}&source=dashboard`}
                      data-testid={`start-service-form-${service.id}`}
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                    >
                      Start {service.shortTitle} Form
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            No service matched “{search}”. Try a broader search or add a custom requirement below.
          </div>
        )}

        {!search && filtered.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-lg px-4 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
          >
            {showAll ? 'Show priority services' : `View all ${filtered.length} services`}
            <ChevronDown className={cn('h-4 w-4 transition-transform', showAll && 'rotate-180')} aria-hidden="true" />
          </button>
        )}

        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <button
            type="button"
            onClick={() => setShowOther((current) => !current)}
            className="min-h-11 text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            {showOther ? '− Hide custom requirement' : '+ Service not listed? Add a custom requirement'}
          </button>
          {showOther && (
            <div className="mt-2 space-y-2">
              <label htmlFor="custom-service-category" className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                Describe the service or product you need
              </label>
              <input
                id="custom-service-category"
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="e.g. Heritage building restoration advisory"
                className="min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-base outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-sm"
              />
              <p className="text-[10px] text-[var(--color-text-subtle)]">Custom categories go to the Super Admin catalog review queue.</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving || selected.length === 0 && !customCategory.trim()}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          {saved && <Badge variant="success" size="sm" icon={<Check className="h-3 w-3" />}>Saved</Badge>}
          {selected.length > 0 && <span className="text-[11px] text-[var(--color-text-muted)]">{selected.length} selected</span>}
        </div>
      </div>
    </section>
  );
};
