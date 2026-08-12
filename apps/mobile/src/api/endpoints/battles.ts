import type { Formation } from "@battle-formation/shared-types";
import { apiFetch } from "../http/client";

export function submitFormation(matchId: string, formation: Formation): Promise<void> {
  return apiFetch<void>(`/battles/${matchId}/formation`, {
    method: "POST",
    body: JSON.stringify({ formation }),
  });
}
