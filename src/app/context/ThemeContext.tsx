import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import { ThemeContext } from '@/app/context/ThemeValueContext';
import { themes, ThemeMode } from '@/app/styles/theme';

const getInitialThemeMode = (): ThemeMode => {
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return 'dark';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  const theme = useMemo(() => {
    return themeMode === 'light' ? themes.light : themes.dark;
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode);
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
  }, [theme, themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, theme }}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
