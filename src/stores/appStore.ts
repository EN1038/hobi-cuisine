// ============================================================
// HOBI Cuisine — App Store (Zustand)
// ============================================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
  isCartOpen: boolean;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;

  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      isSidebarOpen: false,
      isCartOpen: false,
      notification: null,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),

      showNotification: (message, type = 'info') => {
        set({ notification: { message, type } });
        setTimeout(() => set({ notification: null }), 4000);
      },
      clearNotification: () => set({ notification: null }),
    }),
    {
      name: 'hobi-app',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
