// Theme utilities for dark mode

export const THEME_KEY = 'financial-tracker-theme';

export const getInitialTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    return savedTheme;
  }
  
  return 'dark';
};

export const saveTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};

export const applyTheme = (theme) => {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);

  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else {
    document.documentElement.dataset.theme = 'light';
  }
};
