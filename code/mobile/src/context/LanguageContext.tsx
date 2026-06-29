import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { type Language } from '../i18n';

const STORAGE_KEY = '@stc-sm/language';

interface LanguageContextType {
  language: Language;
  /** Switch language and persist the manual choice. */
  setLanguage(lng: Language): void;
  /** Flip between English and Portuguese. */
  toggle(): void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // i18n starts on the device language (set in i18n.ts).
  const [language, setLang] = useState<Language>((i18n.language as Language) ?? 'en');

  // On mount, apply a saved manual override if one exists.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => {
        if (!cancelled && (stored === 'en' || stored === 'pt')) {
          setLang(stored);
          i18n.changeLanguage(stored);
        }
      })
      .catch(() => { /* ignore — keep device default */ });
    return () => { cancelled = true; };
  }, []);

  function setLanguage(lng: Language) {
    setLang(lng);
    i18n.changeLanguage(lng);
    AsyncStorage.setItem(STORAGE_KEY, lng).catch(() => { /* best-effort persist */ });
  }

  function toggle() {
    setLanguage(language === 'en' ? 'pt' : 'en');
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
