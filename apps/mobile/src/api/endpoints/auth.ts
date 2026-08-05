import type { AuthResponse } from "@battle-formation/shared-types";
import { apiFetch } from "../http/client";

export function login(username: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
