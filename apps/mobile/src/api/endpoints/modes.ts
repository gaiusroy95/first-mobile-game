import { apiFetch } from "../http/client";
import type { Formation } from "@battle-formation/shared-types";

export interface AdventureStage {
  id: number;
  name: string;
  enemyLevels: number;
}

export function fetchAdventureStages(): Promise<AdventureStage[]> {
  return apiFetch<AdventureStage[]>("/adventure/stages");
}

export function fetchAdventureProgress(): Promise<{ highestCleared: number }> {
  return apiFetch<{ highestCleared: number }>("/adventure/progress");
}

export function playAdventureStage(stageId: number, formation: Formation) {
  return apiFetch<{
    winner: string;
    events: unknown[];
    stageId: number;
    cleared: boolean;
  }>(`/adventure/stages/${stageId}/play`, {
    method: "POST",
    body: JSON.stringify({ formation }),
  });
}

export function fetchEvents() {
  return apiFetch<
    { id: string; title: string; description: string; slug: string; rules: Record<string, unknown> }[]
  >("/events");
}

export function fetchTournaments() {
  return apiFetch<
    { id: string; name: string; status: string; playerIds: string[]; maxPlayers: number }[]
  >("/tournaments");
}

export function joinTournament(id: string) {
  return apiFetch(`/tournaments/${id}/join`, { method: "POST" });
}
