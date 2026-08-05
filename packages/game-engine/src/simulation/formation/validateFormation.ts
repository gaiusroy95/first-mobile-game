import type { Formation } from "@battle-formation/shared-types";

export interface FormationValidationResult {
  valid: boolean;
  errors: string[];
}

const REQUIRED_HERO_COUNT = 6;

/**
 * Pure rule-check over a Formation - no Phaser, no I/O, no randomness. Runs
 * identically on the client (to gate the Confirm button) and, later, on the
 * backend (to reject a formation a modified client tries to submit),
 * because both import this exact function from the same package instead of
 * each re-implementing the rules.
 */
export function validateFormation(formation: Formation): FormationValidationResult {
  const errors: string[] = [];
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
  }

  if (formation.slots.length !== REQUIRED_HERO_COUNT) {
    errors.push(
      `Formation must have exactly ${REQUIRED_HERO_COUNT} heroes placed (has ${formation.slots.length})`
    );
  }

  return { valid: errors.length === 0, errors };
}
