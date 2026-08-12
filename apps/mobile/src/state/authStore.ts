import { create } from "zustand";
import { login as loginApi, register as registerApi } from "../api/endpoints/auth";
import { disconnectSocket } from "../api/socket/client";
import { setAuthToken } from "../api/session";

interface AuthState {
  token: string | null;
  playerId: string | null;
  displayName: string | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

function applySession(
  set: (partial: Partial<AuthState>) => void,
  response: { token: string; playerId: string; displayName: string }
): void {
  setAuthToken(response.token);
  set({
    token: response.token,
    playerId: response.playerId,
    displayName: response.displayName,
    status: "idle",
    error: null,
  });
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
      applySession(set, response);
    } catch (error) {
      setAuthToken(null);
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Login failed — is the backend running?",
      });
      throw error;
    }
  },

  register: async (username, password, displayName) => {
    set({ status: "loading", error: null });
    try {
      const response = await registerApi(username, password, displayName);
      applySession(set, response);
    } catch (error) {
      setAuthToken(null);
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Registration failed — is the backend running?",
      });
      throw error;
    }
  },

  logout: () => {
    disconnectSocket();
    setAuthToken(null);
    set({ token: null, playerId: null, displayName: null, status: "idle", error: null });
  },
}));
