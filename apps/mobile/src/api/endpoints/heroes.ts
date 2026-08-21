import type { OwnedHero } from "@battle-formation/shared-types";
import { apiFetch } from "../http/client";

export function fetchOwnedHeroes(): Promise<OwnedHero[]> {
  return apiFetch<OwnedHero[]>("/heroes");
}

export function upgradeHero(instanceId: string): Promise<OwnedHero> {
  return apiFetch<OwnedHero>(`/heroes/${instanceId}/upgrade`, { method: "POST" });
}

export function unlockHero(heroId: string): Promise<OwnedHero> {
  return apiFetch<OwnedHero>("/heroes/unlock", {
    method: "POST",
    body: JSON.stringify({ heroId }),
  });
}

export function equipCosmetic(instanceId: string, cosmeticId: string | null): Promise<OwnedHero> {
  return apiFetch<OwnedHero>(`/heroes/${instanceId}/cosmetic`, {
    method: "POST",
    body: JSON.stringify({ cosmeticId }),
  });
}
