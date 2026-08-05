import { create } from "zustand";
import { login as loginApi } from "../api/endpoints/auth";

interface AuthState {
  token: string | null;
  playerId: string | null;
  displayName: string | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  playerId: null,
  displayName: null,
  status: "idle",
  error: null,

  login: async (username, password) => {
    set({ status: "loading", error: null });
    try {
      const response = await loginApi(username, password);
      set({
        token: response.token,
        playerId: response.playerId,
        displayName: response.displayName,
        status: "idle",
      });
    } catch {
      // No backend yet - accept any credentials locally so the app stays
      // navigable end to end. Swap this out once POST /auth/login is
      // live; every screen already reads from this store, nothing else
      // needs to change.
      set({
        token: `local-${Date.now()}`,
        playerId: `player-${username.trim().toLowerCase()}`,
        displayName: username.trim() || "Player",
        status: "idle",
      });
    }
  },

  logout: () => set({ token: null, playerId: null, displayName: null, status: "idle", error: null }),
}));
