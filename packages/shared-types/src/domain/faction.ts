export type FactionId =
  | "arab"
  | "samurai"
  | "byzantine"
  | "janissary"
  | "mongol"
  | "viking"
  | "persian"
  | "crusader";

export type ArmyRole = "commander" | "unit";

export interface FactionInfo {
  id: FactionId;
  name: string;
  motto: string;
  accent: string;
  /** False until the client delivers that faction's unit sheet. */
  playable: boolean;
}

export const FACTION_CATALOG: FactionInfo[] = [
  { id: "arab", name: "Arab Legends", motto: "Honor · Faith · Wisdom", accent: "#c9a227", playable: true },
  { id: "samurai", name: "Samurai Empire", motto: "Discipline · Honor · Victory", accent: "#b42318", playable: true },
  { id: "byzantine", name: "Byzantine Empire", motto: "Faith · Order · Eternity", accent: "#7b4fb2", playable: true },
  { id: "janissary", name: "Janissary Brothers", motto: "Loyalty · Discipline · Victory", accent: "#8b1e1e", playable: true },
  { id: "mongol", name: "Mongol Horde", motto: "Speed · Precision · Dominion", accent: "#2b5c8a", playable: true },
  { id: "viking", name: "Viking Raiders", motto: "Strength · Fury · Wisdom", accent: "#3d7a7a", playable: true },
  { id: "persian", name: "Persian Empire", motto: "Coming with the next art drop", accent: "#b8860b", playable: false },
  { id: "crusader", name: "Crusader Knights", motto: "Coming with the next art drop", accent: "#c9cdd3", playable: false },
];

export function getFaction(id: FactionId): FactionInfo {
  return FACTION_CATALOG.find((faction) => faction.id === id) ?? FACTION_CATALOG[0];
}

export const PLAYABLE_FACTIONS: FactionId[] = FACTION_CATALOG.filter((f) => f.playable).map((f) => f.id);
