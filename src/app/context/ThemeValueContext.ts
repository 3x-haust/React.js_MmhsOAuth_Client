import { createContext } from 'react';

import { ThemeMode, themes } from '@/app/styles/theme';

export type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  theme: typeof themes.light;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
