import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme, type Theme, type ThemeName } from '../theme';

const STORAGE_KEY = '@stc-sm/theme';
const DEFAULT_THEME: ThemeName = 'light';

interface ThemeContextType extends Theme {
  /** Switch to a specific palette and persist the choice. */
  setTheme(name: ThemeName): void;
  /** Flip between light and dark. */
  toggle(): void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<ThemeName>(DEFAULT_THEME);

  // Load the persisted choice once on mount.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => {
        if (!cancelled && (stored === 'light' || stored === 'dark')) {
          setName(stored);
        }
      })
      .catch(() => { /* ignore — fall back to default */ });
    return () => { cancelled = true; };
  }, []);

  function setTheme(next: ThemeName) {
    setName(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => { /* best-effort persist */ });
  }

  function toggle() {
    setTheme(name === 'dark' ? 'light' : 'dark');
  }

  const value = useMemo<ThemeContextType>(
    () => ({ ...buildTheme(name), setTheme, toggle }),
    [name],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
