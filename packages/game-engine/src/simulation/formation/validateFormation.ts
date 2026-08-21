import type { Formation, HeroClass, HeroDefinition } from "@battle-formation/shared-types";
import { squadErrors, UNIT_COUNT } from "../army/squad";

export interface FormationValidationResult {
  valid: boolean;
  errors: string[];
  /** Soft GDD guidance (front = melee, back = ranged/support) — never blocks submit. */
  warnings: string[];
}

const REQUIRED_HERO_COUNT = 1 + UNIT_COUNT;

const FRONT_ROW_CLASSES: ReadonlySet<HeroClass> = new Set(["tank", "knight", "commander"]);
const BACK_ROW_CLASSES: ReadonlySet<HeroClass> = new Set([
  "archer",
  "fire-mage",
  "ice-mage",
  "healer",
  "assassin",
]);

/**
 * Pure rule-check over a Formation - no Phaser, no I/O, no randomness. Runs
 * identically on the client and the backend.
 */
export function validateFormation(
  formation: Formation,
  definitionByInstanceId?: Map<string, HeroDefinition>
): FormationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenSlots = new Set<string>();
  const seenInstances = new Set<string>();

  for (const { instanceId, col, row } of formation.slots) {
    const slotKey = `${col},${row}`;
    if (seenSlots.has(slotKey)) {
      errors.push(`Slot (col ${col}, row ${row}) is occupied by more than one hero`);
    }
    seenSlots.add(slotKey);

    if (seenInstances.has(instanceId)) {
      errors.push(`Hero instance "${instanceId}" is placed in more than one slot`);
    }
    seenInstances.add(instanceId);

    if (col < 0 || col > 2 || row < 0 || row > 1) {
      errors.push(
        `Hero instance "${instanceId}" has an out-of-bounds slot (col ${col}, row ${row})`
      );
    }

    const definition = definitionByInstanceId?.get(instanceId);
    const heroClass = definition?.class;
    if (heroClass) {
      if (row === 1 && BACK_ROW_CLASSES.has(heroClass)) {
        warnings.push(`${heroClass} is usually better in the back row`);
      }
      if (row === 0 && FRONT_ROW_CLASSES.has(heroClass)) {
        warnings.push(`${heroClass} is usually better in the front row`);
      }
    }
  }

  if (formation.slots.length !== REQUIRED_HERO_COUNT) {
    errors.push(
      `Formation must have exactly ${REQUIRED_HERO_COUNT} fighters placed (has ${formation.slots.length})`
    );
  }

  if (definitionByInstanceId) {
    const defs = formation.slots
      .map((slot) => definitionByInstanceId.get(slot.instanceId))
      .filter((definition): definition is HeroDefinition => definition != null);
    if (defs.length !== formation.slots.length) {
      errors.push("Formation references an unknown fighter");
    } else {
      const commander = defs.find((definition) => definition.role === "commander");
      const units = defs.filter((definition) => definition.role === "unit");
      const factions = [...new Set(defs.map((definition) => definition.faction))];
      const ally = factions.find((faction) => faction !== commander?.faction) ?? null;
      errors.push(...squadErrors(commander, units, ally));
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
