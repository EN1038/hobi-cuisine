// ============================================================
// HOBI Cuisine — Auth Store (Zustand)
// ============================================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { getUserByEmail, updateUser } from '@/db/operations';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    birthday?: string;
    address?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const user = await getUserByEmail(email);
          if (!user) {
            set({ isLoading: false });
            return { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้' };
          }
          if (user.password !== password) {
            set({ isLoading: false });
            return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
          }
          set({ user, isLoggedIn: true, isLoading: false });
          return { success: true };
        } catch {
          set({ isLoading: false });
          return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
        }
      },

      logout: () => {
        set({ user: null, isLoggedIn: false });
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const existing = await getUserByEmail(userData.email);
          if (existing) {
            set({ isLoading: false });
            return { success: false, error: 'อีเมลนี้มีผู้ใช้แล้ว' };
          }

          const { createUser } = await import('@/db/operations');
          const newUser: Omit<User, 'id'> = {
            ...userData,
            role: 'customer' as UserRole,
            loyaltyTier: 'bronze',
            loyaltyPoints: 50, // Signup bonus
            totalSpent: 0,
            totalOrders: 0,
            createdAt: new Date().toISOString(),
          };

          const id = await createUser(newUser);

          // Add signup bonus loyalty transaction
          const { addLoyaltyTransaction } = await import('@/db/operations');
          await addLoyaltyTransaction({
            userId: id,
            type: 'signup',
            points: 50,
            balance: 50,
            description: 'โบนัสสมัครสมาชิก 🎉',
            createdAt: new Date().toISOString(),
          });

          const user = { ...newUser, id } as User;
          set({ user, isLoggedIn: true, isLoading: false });
          return { success: true };
        } catch {
          set({ isLoading: false });
          return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
        }
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user?.id) return;
        const { getUserById } = await import('@/db/operations');
        const updated = await getUserById(user.id);
        if (updated) {
          set({ user: updated });
        }
      },

      setUser: (user) => set({ user, isLoggedIn: !!user }),
    }),
    {
      name: 'hobi-auth',
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);
