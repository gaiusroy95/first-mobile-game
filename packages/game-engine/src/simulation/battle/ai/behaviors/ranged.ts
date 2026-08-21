import type { HeroBehavior } from "../HeroBehavior";
import { selectNearest } from "../../TargetSelection";

/**
 * Archer/Mages/Healer: attacks the nearest enemy but doesn't chase into
 * melee range - only closes distance when genuinely unable to engage
 * (more than double its own range away). A large `range` stat usually
 * already covers the battlefield from a backline slot without moving.
 */
export const rangedBehavior: HeroBehavior = {
  selectTarget: ({ self, enemies }) => selectNearest(self, enemies),
  shouldAdvance: ({ self }) => {
    if (!self.target) return false;
    return self.distanceTo(self.target) > self.hero.range * 2;
  },
};
