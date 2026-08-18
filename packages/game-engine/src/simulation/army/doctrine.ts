import type { FactionId, Formation, Hero, HeroClass, HeroDefinition } from "@battle-formation/shared-types";

export interface PactBonus {
  id: string;
  name: string;
  blurb: string;
  attack?: number;
  defense?: number;
  hp?: number;
  /** Applied only to these classes when set. */
  classes?: HeroClass[];
}

const pairKey = (a: FactionId, b: FactionId): string => [a, b].sort().join("+");

/** Named two-faction pacts — the extra layer on top of the client's mix rule. */
const PACTS: Record<string, PactBonus> = {
  "arab+byzantine": {
    id: "covenant-of-faith",
    name: "Covenant of Faith",
    blurb: "Frontline holds. Healers shine.",
    defense: 0.12,
    classes: ["tank", "knight", "commander", "healer"],
  },
  "arab+janissary": {
    id: "desert-crescent",
    name: "Desert Crescent",
    blurb: "Ranged fire from the dunes.",
    attack: 0.1,
    classes: ["archer", "commander"],
  },
  "arab+samurai": {
    id: "honor-bound",
    name: "Honor Bound",
    blurb: "Duelists strike cleaner.",
    attack: 0.08,
    classes: ["knight", "assassin", "commander"],
  },
  "byzantine+janissary": {
    id: "walls-and-powder",
    name: "Walls and Powder",
    blurb: "Shields in front, muskets behind.",
    defense: 0.08,
    attack: 0.08,
  },
  "byzantine+samurai": {
    id: "honor-and-order",
    name: "Honor and Order",
    blurb: "Discipline steels every blade.",
    hp: 0.08,
    defense: 0.06,
  },
  "janissary+samurai": {
    id: "steel-doctrine",
    name: "Steel Doctrine",
    blurb: "Melee and shot in lockstep.",
    attack: 0.1,
  },
  "mongol+viking": {
    id: "steppe-and-storm",
    name: "Steppe and Storm",
    blurb: "Raid speed. Savage hits.",
    attack: 0.14,
    defense: -0.04,
  },
  "mongol+samurai": {
    id: "east-wind",
    name: "East Wind",
    blurb: "Fast steel from both empires.",
    attack: 0.1,
    classes: ["assassin", "knight", "archer", "commander"],
  },
  "mongol+arab": {
    id: "silk-road",
    name: "Silk Road",
    blurb: "Riders and mystics cover each other.",
    hp: 0.06,
    attack: 0.06,
  },
  "viking+byzantine": {
    id: "north-and-rome",
    name: "North and Rome",
    blurb: "Unbreakable front.",
    hp: 0.1,
    defense: 0.1,
    classes: ["tank", "knight", "commander"],
  },
  "viking+janissary": {
    id: "steel-volley",
    name: "Steel Volley",
    blurb: "Axes close. Guns finish.",
    attack: 0.09,
  },
  "viking+arab": {
    id: "raid-and-oath",
    name: "Raid and Oath",
    blurb: "Fury with a healer's hand.",
    attack: 0.07,
    hp: 0.07,
  },
  "mongol+byzantine": {
    id: "horde-and-empire",
    name: "Horde and Empire",
    blurb: "Mobility meets the wall.",
    defense: 0.08,
    attack: 0.05,
  },
  "mongol+janissary": {
    id: "bow-and-shot",
    name: "Bow and Shot",
    blurb: "The backline owns the field.",
    attack: 0.12,
    classes: ["archer", "assassin"],
  },
};

const GENERIC_PACT: PactBonus = {
  id: "two-banners",
  name: "Two Banners",
  blurb: "Mixed empires fight as one.",
  attack: 0.05,
  defense: 0.05,
};

export function findPact(factions: FactionId[]): PactBonus | null {
  const unique = [...new Set(factions)];
  if (unique.length !== 2) return unique.length < 2 ? null : GENERIC_PACT;
  return PACTS[pairKey(unique[0], unique[1])] ?? GENERIC_PACT;
}

export interface ArmyDoctrine {
  pact: PactBonus | null;
  commanderFaction: FactionId | null;
  /** Commander on the front row (row 1). */
  vanguardMandate: boolean;
  /** Commander on the back row (row 0). */
  warCouncil: boolean;
}

export function inspectArmy(formation: Formation, heroes: Map<string, Hero>): ArmyDoctrine {
  const placed = formation.slots
    .map((slot) => ({ slot, hero: heroes.get(slot.instanceId) }))
    .filter((row): row is { slot: (typeof formation.slots)[number]; hero: Hero } => row.hero != null);
  const commander = placed.find((row) => row.hero.role === "commander");
  return {
    pact: findPact(placed.map((row) => row.hero.faction)),
    commanderFaction: commander?.hero.faction ?? null,
    vanguardMandate: commander?.slot.row === 1,
    warCouncil: commander?.slot.row === 0,
  };
}

function scale(value: number, factor: number): number {
  return Math.max(1, Math.round(value * (1 + factor)));
}

function classMatches(hero: Hero, pact: PactBonus): boolean {
  return !pact.classes || pact.classes.includes(hero.class);
}

/**
 * Clones this side's heroes with Oathbound + Pact + Commander Mandate.
 * Never mutates the input map (both sides share one lookup at resolve time).
 */
export function applyArmyDoctrine(formation: Formation, heroesByInstanceId: Map<string, Hero>): Map<string, Hero> {
  const next = new Map(heroesByInstanceId);
  const doctrine = inspectArmy(formation, heroesByInstanceId);
  const FRONT: HeroClass[] = ["tank", "knight", "commander"];
  const BACK: HeroClass[] = ["archer", "fire-mage", "ice-mage", "healer", "assassin"];

  for (const slot of formation.slots) {
    const hero = heroesByInstanceId.get(slot.instanceId);
    if (!hero) continue;

    let attack = 0;
    let defense = 0;
    let hp = 0;

    if (doctrine.commanderFaction && hero.role === "unit" && hero.faction === doctrine.commanderFaction) {
      attack += 0.1;
      hp += 0.1;
    }

    if (doctrine.pact && classMatches(hero, doctrine.pact)) {
      attack += doctrine.pact.attack ?? 0;
      defense += doctrine.pact.defense ?? 0;
      hp += doctrine.pact.hp ?? 0;
    }

    if (doctrine.vanguardMandate && FRONT.includes(hero.class)) {
      defense += 0.08;
    }
    if (doctrine.warCouncil && BACK.includes(hero.class)) {
      attack += 0.08;
    }

    next.set(slot.instanceId, {
      ...hero,
      hp: scale(hero.hp, hp),
      attack: scale(hero.attack, attack),
      defense: scale(hero.defense, defense),
    });
  }

  return next;
}

export function describeArmy(defs: HeroDefinition[]): { factions: FactionId[]; pact: PactBonus | null } {
  const factions = [...new Set(defs.map((definition) => definition.faction))];
  return { factions, pact: findPact(factions) };
}
