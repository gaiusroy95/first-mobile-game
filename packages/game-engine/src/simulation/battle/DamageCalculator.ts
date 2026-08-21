/**
 * Physical damage with diminishing-returns mitigation: defense reduces
 * incoming damage by defense/(defense+100), a curve that approaches but
 * never reaches 100% reduction. Pure over plain numbers, not Hero/
 * HeroEntity, so a buffed/debuffed effective stat works exactly like a
 * base one - callers pass whatever attack/defense values are actually in
 * effect (see HeroEntity.getEffectiveStat) rather than this function
 * needing to know effects exist at all. No randomness - damage variance
 * (crits, dodge) is a natural extension using the simulation's seeded
 * RNG, intentionally left out here to keep combat unambiguously
 * deterministic and easy to verify by hand.
 */
export function calculateDamage(attack: number, defense: number, powerMultiplier = 1): number {
  const mitigation = defense / (defense + 100);
  const rawDamage = attack * powerMultiplier;
  return Math.max(1, Math.round(rawDamage * (1 - mitigation)));
}
