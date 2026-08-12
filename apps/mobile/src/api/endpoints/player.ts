import type { RankingSummary } from "@battle-formation/shared-types";
import { apiFetch } from "../http/client";

export function fetchMyRanking(): Promise<RankingSummary> {
  return apiFetch<RankingSummary>("/ranking/me");
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  level: number;
  xp: number;
  gold: number;
  gems: number;
  trophies: number;
  heroCards: Record<string, number>;
  materials: Record<string, number>;
  ownedCosmetics: string[];
}

export function fetchMe(): Promise<PlayerProfile> {
  return apiFetch<PlayerProfile>("/players/me");
}

export function buyCosmetic(cosmeticId: string): Promise<PlayerProfile> {
  return apiFetch<PlayerProfile>("/players/cosmetics/buy", {
    method: "POST",
    body: JSON.stringify({ cosmeticId }),
  });
}
