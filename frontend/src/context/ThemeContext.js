import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme state: 'default', 'cyberpunk', 'matrix', 'pastel'
  // Mode state: 'light', 'dark' (Only applies to default)
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'default');
  const [mode, setMode] = useState(localStorage.getItem('app-mode') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Reset classes/attributes
    root.classList.remove('dark');
    root.removeAttribute('data-theme');

    if (theme === 'default') {
      if (mode === 'dark') root.classList.add('dark');
    } else {
      // Custom themes usually force a specific look (dark/light)
      root.setAttribute('data-theme', theme);
      if (theme === 'pastel') root.classList.remove('dark'); // Pastel is light
      else root.classList.add('dark'); // Cyber/Matrix are dark
    }

    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-mode', mode);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);