import type { AuthResponse } from "@battle-formation/shared-types";
import { apiFetch } from "../http/client";

export function login(username: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(
  username: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, displayName }),
  });
}
