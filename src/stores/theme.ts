import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { THEME_KEY } from '@/utils/constants';

type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light');

  function initialize() {
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    theme.value = storedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(theme.value);
  }

  function applyTheme(newTheme: Theme) {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyTheme(theme.value);
    localStorage.setItem(THEME_KEY, theme.value);
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }

  // Watch for changes and apply
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme,
    initialize,
    toggleTheme,
    setTheme,
  };
});