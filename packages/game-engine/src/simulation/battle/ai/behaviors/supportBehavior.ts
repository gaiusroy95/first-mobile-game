import type { HeroBehavior } from "../HeroBehavior";
import { selectNearest } from "../../TargetSelection";

/**
 * Healer / support: hold the backline, only inch forward if nothing is in
 * range and no ally needs attention. Ability casts (heal/buff) still fire
 * through SkillManager when ready; this behavior just keeps them alive
 * long enough to use them.
 */
export const supportBehavior: HeroBehavior = {
  selectTarget: ({ self, enemies }) => selectNearest(self, enemies),
  shouldAdvance: ({ self, allies }) => {
    const allyNeedsHelp = allies.some(
      (ally) => ally.alive && ally.currentHp / Math.max(1, ally.hero.hp) < 0.75
    );
    if (allyNeedsHelp) return false;
    if (!self.target) return false;
    return self.distanceTo(self.target) > self.hero.range * 2;
  },
};
