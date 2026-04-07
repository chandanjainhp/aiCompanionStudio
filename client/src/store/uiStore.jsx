import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUIStore = create()(persist(set => ({
  theme: 'dark',
  sidebarOpen: true,
  projectSidebarOpen: true,
  setTheme: theme => {
    set({
      theme
    });
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  },
  toggleSidebar: () => set(state => ({
    sidebarOpen: !state.sidebarOpen
  })),
  setSidebarOpen: open => set({
    sidebarOpen: open
  }),
  toggleProjectSidebar: () => set(state => ({
    projectSidebarOpen: !state.projectSidebarOpen
  })),
  setProjectSidebarOpen: open => set({
    projectSidebarOpen: open
  })
}), {
  name: 'ui-storage'
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('ui-storage');
  if (stored) {
    try {
      const {
        state
      } = JSON.parse(stored);
      const theme = state?.theme || 'dark';
      const root = window.document.documentElement;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  } else {
    document.documentElement.classList.add('dark');
  }
}