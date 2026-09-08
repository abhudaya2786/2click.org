import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'hi';

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (english: string, hindi: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const stored = window.localStorage.getItem('beg-language');
    return stored === 'hi' ? 'hi' : 'en';
  });

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem('beg-language', next);
  };

  useEffect(() => {
    document.documentElement.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    document.documentElement.dataset.language = language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t: (en: string, hi: string) => language === 'hi' ? hi : en }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used within LanguageProvider');
  return value;
};
