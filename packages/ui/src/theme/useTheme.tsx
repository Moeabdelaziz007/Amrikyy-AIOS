import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { komabiColors } from './colors';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof komabiColors.dark; // Always provide one shape
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const KomabiThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: Theme; storageKey?: string }> = ({
  children,
  defaultTheme = 'dark',
  storageKey = 'komabi-ui-theme',
}) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const colors = useMemo(() => komabiColors[theme], [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    colors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useKomabiTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useKomabiTheme must be used within a KomabiThemeProvider');
  }
  return context;
};
