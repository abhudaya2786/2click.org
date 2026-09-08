import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/cn';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-[var(--color-border)] px-2 text-xs font-bold text-[var(--color-text)] hover:border-[var(--color-border-focus)] hover:bg-[var(--color-background)] transition-colors touch-target',
        className
      )}
      aria-label={t('Switch language', 'भाषा बदलें')}
      data-testid="language-toggle"
    >
      <Globe className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden />
      <span>{language === 'hi' ? 'EN' : 'हिं'}</span>
    </button>
  );
};
