import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
// FIX: Imported getTranslator, Language, TranslationKey, TranslationPlaceholder from ../i18n
import { getTranslator, Language, TranslationKey, TranslationPlaceholder } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Fix: Update the type of 't' to accept an optional placeholders object.
  // This resolves the error in App.tsx where it was called with two arguments.
  t: (key: TranslationKey, placeholders?: TranslationPlaceholder) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useCallback(getTranslator(language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};