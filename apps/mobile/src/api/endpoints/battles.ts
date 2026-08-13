import type { Formation, BattleResultPayload } from "@battle-formation/shared-types";
import { apiFetch } from "../http/client";

export function submitFormation(
  matchId: string,
  formation: Formation
): Promise<BattleResultPayload | null> {
  return apiFetch<BattleResultPayload | null>(`/battles/${matchId}/formation`, {
    method: "POST",
    body: JSON.stringify({ formation }),
  });
}
