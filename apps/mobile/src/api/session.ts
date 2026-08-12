/**
 * Session token held outside Zustand/API modules so HTTP + socket clients
 * never import authStore (which would create a require cycle).
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}
