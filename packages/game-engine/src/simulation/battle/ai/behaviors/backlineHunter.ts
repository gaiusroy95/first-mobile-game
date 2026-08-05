import type { HeroBehavior } from "../HeroBehavior";

/**
 * Assassin: prefers the nearest back-row (row 0) enemy, falling back to
 * the nearest enemy overall once that side's backline is dead - so it
 * doesn't stall out hunting a row that no longer exists.
 */
export const backlineHunterBehavior: HeroBehavior = {
  selectTarget: ({ self, enemies }) => {
    const alive = enemies.filter((enemy) => enemy.alive);
    if (alive.length === 0) return null;

    const backline = alive.filter((enemy) => enemy.row === 0);
    const pool = backline.length > 0 ? backline : alive;

    return pool.reduce((closest, candidate) =>
      self.distanceTo(candidate) < self.distanceTo(closest) ? candidate : closest
    );
  },
  shouldAdvance: () => true,
};
