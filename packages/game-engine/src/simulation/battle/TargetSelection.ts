import type { HeroEntity } from "./HeroEntity";

/**
 * Low-level "nearest living entity" primitive, by the entity's own
 * distance metric. Ties are broken by the candidates array's own order,
 * which callers always build in a fixed slot-based sequence - never by
 * anything that could vary between runs - so the same battle state always
 * picks the same target.
 *
 * This isn't "the" target selection policy anymore - HeroBehavior
 * implementations (ai/behaviors/) are. This function is what most of them
 * are built out of: works for enemies (attack the nearest) or allies
 * (find the nearest ally for a positioning check) equally.
 */
export function selectNearest(self: HeroEntity, candidates: HeroEntity[]): HeroEntity | null {
  const alive = candidates.filter((candidate) => candidate.alive);
  if (alive.length === 0) return null;

  return alive.reduce((closest, candidate) =>
    self.distanceTo(candidate) < self.distanceTo(closest) ? candidate : closest
  );
}
