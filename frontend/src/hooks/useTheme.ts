import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  
  
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme as Theme;
    }
    
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  
  useEffect(() => {
    const root = window.document.documentElement;
    
    
    root.classList.remove('light', 'dark');
    
    
    root.classList.add(theme);
    
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, setTheme, toggleTheme };
}
