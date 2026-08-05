import type { OwnedHero } from "@battle-formation/shared-types";
import { apiFetch } from "../http/client";

export function fetchOwnedHeroes(): Promise<OwnedHero[]> {
  return apiFetch<OwnedHero[]>("/heroes");
}

export function upgradeHero(instanceId: string): Promise<OwnedHero> {
  return apiFetch<OwnedHero>(`/heroes/${instanceId}/upgrade`, { method: "POST" });
}
