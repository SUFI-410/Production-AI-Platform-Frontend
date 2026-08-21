import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type { CurrentUser } from "../api/auth/types";

interface AuthState {
  accessToken: string | null;
  user: CurrentUser | null;

  setAccessToken: (accessToken: string) => void;
  setUser: (user: CurrentUser) => void;
  setSession: (
    accessToken: string,
    user: CurrentUser,
  ) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      setUser: (user) => {
        set({ user });
      },

      setSession: (accessToken, user) => {
        set({
          accessToken,
          user,
        });
      },

      clearSession: () => {
        set({
          accessToken: null,
          user: null,
        });
      },
    }),
    {
      name: "invoice-preflight-auth",
      version: 1,

      storage: createJSONStorage(
        () => localStorage,
      ),

      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
