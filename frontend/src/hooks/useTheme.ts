import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Check if user has a theme preference in localStorage
  // Or use the system preference as fallback
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme as Theme;
    }
    
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Update the theme in localStorage and apply proper class to <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the old theme class
    root.classList.remove('light', 'dark');
    
    // Add the new theme class
    root.classList.add(theme);
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, setTheme, toggleTheme };
}
