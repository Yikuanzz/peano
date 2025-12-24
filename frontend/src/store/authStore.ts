/**
 * 认证状态管理
 */
import { create } from "zustand";
import type { User } from "@/types/user";
import { StorageKeys } from "@/utils/storage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  updateUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearUser: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateUser: (user) => set({ user }),

  setTokens: (accessToken, refreshToken) => {
    // 保存到 localStorage
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, accessToken);
    localStorage.setItem(StorageKeys.REFRESH_TOKEN, refreshToken);

    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  clearUser: () => {
    // 清除 localStorage
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    localStorage.removeItem(StorageKeys.USER_ID);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  init: () => {
    // 从 localStorage 恢复状态
    const accessToken = localStorage.getItem(StorageKeys.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(StorageKeys.REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, isAuthenticated: true });
    }
  },
}));
