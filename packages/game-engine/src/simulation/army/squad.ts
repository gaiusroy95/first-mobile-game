import type { FactionId, HeroDefinition } from "@battle-formation/shared-types";
import { PLAYABLE_FACTIONS } from "@battle-formation/shared-types";

export const COMMANDER_COUNT = 1;
export const UNIT_COUNT = 5;
export const SQUAD_SIZE = COMMANDER_COUNT + UNIT_COUNT;
export const MAX_FACTIONS = 2;

export interface OwnedEntry {
  instanceId: string;
  heroId: string;
}

export interface SquadPick {
  commanderInstanceId: string;
  allyFaction: FactionId;
  unitInstanceIds: string[];
}

function lookup(owned: OwnedEntry[], getDef: (heroId: string) => HeroDefinition): (OwnedEntry & { def: HeroDefinition })[] {
  return owned
    .map((row) => {
      try {
        return { ...row, def: getDef(row.heroId) };
      } catch {
        return null;
      }
    })
    .filter((row): row is OwnedEntry & { def: HeroDefinition } => row != null && !row.def.locked);
}

export function squadErrors(
  commander: HeroDefinition | undefined,
  units: HeroDefinition[],
  allyFaction: FactionId | null
): string[] {
  const errors: string[] = [];
  if (!commander || commander.role !== "commander") {
    errors.push("Choose exactly one Commander");
  } else if (commander.locked) {
    errors.push("That Commander is not playable yet");
  }
  if (units.length !== UNIT_COUNT) {
    errors.push(`Place ${UNIT_COUNT} army units (have ${units.length})`);
  }
  if (units.some((unit) => unit.role !== "unit")) {
    errors.push("Only regular army units can fill the remaining slots");
  }
  if (units.some((unit) => unit.locked)) {
    errors.push("A selected unit is not playable yet");
  }
  if (!allyFaction || !PLAYABLE_FACTIONS.includes(allyFaction)) {
    errors.push("Choose a second faction to mix with your Commander");
  } else if (commander && allyFaction === commander.faction) {
    errors.push("The ally faction must be different from your Commander");
  }
  if (commander && allyFaction) {
    const allowed = new Set<FactionId>([commander.faction, allyFaction]);
    const illegal = units.filter((unit) => !allowed.has(unit.faction));
    if (illegal.length > 0) {
      errors.push("Units must come from your Commander faction or the ally faction");
    }
    const armyFactions = new Set<FactionId>([commander.faction, ...units.map((unit) => unit.faction)]);
    if (armyFactions.size !== 2) {
      errors.push("Bring at least one soldier from the ally faction — mix exactly two empires");
    }
  }
  return errors;
}

/** First legal 1+5 mix from a player's owned list (used for bot auto-lock and fallbacks). */
export function pickDefaultSquad(
  owned: OwnedEntry[],
  getDef: (heroId: string) => HeroDefinition
): SquadPick | null {
  const rows = lookup(owned, getDef);
  const commanders = rows.filter((row) => row.def.role === "commander");
  const units = rows.filter((row) => row.def.role === "unit");

  for (const commander of commanders) {
    const byFaction = new Map<FactionId, typeof units>();
    for (const unit of units) {
      const list = byFaction.get(unit.def.faction) ?? [];
      list.push(unit);
      byFaction.set(unit.def.faction, list);
    }
    const home = byFaction.get(commander.def.faction) ?? [];
    for (const ally of PLAYABLE_FACTIONS) {
      if (ally === commander.def.faction) continue;
      const allied = byFaction.get(ally) ?? [];
      const pool = [...home, ...allied];
      if (pool.length < UNIT_COUNT) continue;
      if (home.length < 1 || allied.length < 1) continue;
      const mixed = [...home.slice(0, Math.min(3, home.length)), ...allied].slice(0, UNIT_COUNT);
      if (mixed.length < UNIT_COUNT) continue;
      if (!mixed.some((row) => row.def.faction === ally)) continue;
      return {
        commanderInstanceId: commander.instanceId,
        allyFaction: ally,
        unitInstanceIds: mixed.map((row) => row.instanceId),
      };
    }
  }
  return null;
}

export function squadInstanceIds(pick: SquadPick): string[] {
  return [pick.commanderInstanceId, ...pick.unitInstanceIds];
}
