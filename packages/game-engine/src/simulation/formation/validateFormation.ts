import type { Formation, HeroClass } from "@battle-formation/shared-types";

export interface FormationValidationResult {
  valid: boolean;
  errors: string[];
  /** Soft GDD guidance (front = melee, back = ranged/support) — never blocks submit. */
  warnings: string[];
}

const REQUIRED_HERO_COUNT = 6;

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
  classByInstanceId?: Map<string, HeroClass>
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

    const heroClass = classByInstanceId?.get(instanceId);
    if (heroClass) {
      // row 1 = front (nearest centerline), row 0 = back
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
      `Formation must have exactly ${REQUIRED_HERO_COUNT} heroes placed (has ${formation.slots.length})`
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}
