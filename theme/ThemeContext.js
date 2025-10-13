import React, { createContext, useState, useMemo } from 'react';
import { Appearance } from 'react-native';

export const lightColors = {
    background: '#FAF9F6', // OFF_WHITE
    card: '#FFFFFF',
    text: '#3A3A3A', // DARK_GREY
    primary: '#d96c3d', // TERRACOTTA
    border: '#EAEAEA',
    switchThumb: '#f4f3f4',
    switchTrack: '#767577',
};

export const darkColors = {
    background: '#2C2C2C',
    card: '#3A3A3A', // DARK_GREY
    text: '#FFFFFF',
    primary: '#d96c3d', // TERRACOTTA
    border: '#5A5A5A',
    switchThumb: '#d96c3d', // TERRACOTTA
    switchTrack: '#f5dd4b',
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = useMemo(() => (isDarkMode ? darkColors : lightColors), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
