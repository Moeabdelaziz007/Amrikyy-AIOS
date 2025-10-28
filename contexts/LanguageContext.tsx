import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
// FIX: Imported getTranslator, Language, TranslationKey, TranslationPlaceholder from ../i18n
import { getTranslator, Language, TranslationKey, TranslationPlaceholder } from '../i18n';

/**
 * Defines the shape of the context object provided by `LanguageContext`.
 */
interface LanguageContextType {
  /** The currently active language code (e.g., 'en', 'ar'). */
  language: Language;
  /** Function to set the application's language. */
  setLanguage: (lang: Language) => void;
  /**
   * Translator function that takes a translation key and optional placeholders
   * and returns the translated string.
   * @param {TranslationKey} key - The key for the translation string.
   * @param {TranslationPlaceholder} [placeholders] - Optional object containing values for placeholders in the translation string.
   * @returns {string} The translated string.
   */
  t: (key: TranslationKey, placeholders?: TranslationPlaceholder) => string;
}

/**
 * React Context for managing the application's language settings and providing a translator function.
 */
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Provides language context to its children.
 * Manages the active language state and ensures the document's `lang` and `dir` attributes are updated.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 * @returns {JSX.Element} The LanguageProvider component.
 */
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

/**
 * Custom hook to access the language context.
 * Throws an error if used outside of a `LanguageProvider`.
 * @returns {LanguageContextType} The current language context.
 * @throws {Error} If `useLanguage` is not used within a `LanguageProvider`.
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};