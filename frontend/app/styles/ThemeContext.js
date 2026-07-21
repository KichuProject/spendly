// Spendly ThemeContext — Provider, hooks, persistence, system-follow
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Appearance, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from './theme';

const STORAGE_KEY = 'THEME_MODE';

// Modes: 'light' | 'dark' | 'system'
const ThemeContext = createContext(null);
const ThemeModeContext = createContext(null);

function resolveMode(preference, systemScheme) {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState('system'); // user choice
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
  const [ready, setReady] = useState(false);

  // Load saved preference
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPreferenceState(saved);
        }
      } catch (e) {
        // ignore
      }
      setReady(true);
    })();
  }, []);

  // Listen to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => subscription?.remove?.();
  }, []);

  const setMode = useCallback(async (mode) => {
    setPreferenceState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // ignore
    }
  }, []);

  const resolvedMode = resolveMode(preference, systemScheme);
  const theme = useMemo(() => getTheme(resolvedMode), [resolvedMode]);

  const modeCtx = useMemo(() => ({
    mode: preference,       // user's preference: 'light' | 'dark' | 'system'
    resolvedMode,           // actual applied: 'light' | 'dark'
    setMode,
    isDark: resolvedMode === 'dark',
  }), [preference, resolvedMode, setMode]);

  // Update StatusBar
  useEffect(() => {
    if (ready) {
      StatusBar.setBarStyle(theme.colors.statusBarStyle, true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.colors.statusBarBg, true);
      }
    }
  }, [ready, theme.colors.statusBarStyle, theme.colors.statusBarBg]);

  if (!ready) return null;

  return (
    <ThemeModeContext.Provider value={modeCtx}>
      <ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>
    </ThemeModeContext.Provider>
  );
}

/**
 * Returns the full theme object: { mode, isDark, colors, typography, spacing, radius, elevation, animation }
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * Returns { mode, resolvedMode, setMode, isDark }
 * mode = user preference ('light'|'dark'|'system')
 * resolvedMode = actual applied mode ('light'|'dark')
 */
export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}
