type Theme = 'light' | 'dark' | 'system';

export function setTheme(theme: Theme) {
  const root = window.document.documentElement;

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', systemTheme);
    localStorage.setItem('theme', theme);
    return;
  }

  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

export function initTheme() {
  const theme = getTheme();
  setTheme(theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (getTheme() === 'system') {
      setTheme('system');
    }
  });
}