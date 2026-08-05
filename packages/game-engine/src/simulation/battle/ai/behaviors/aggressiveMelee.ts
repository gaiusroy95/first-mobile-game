import type { HeroBehavior } from "../HeroBehavior";
import { selectNearest } from "../../TargetSelection";

/**
 * Tank/Knight: always closes distance and engages whoever's nearest. This
 * is also how a tank "protects allies" mechanically, for now - it's the
 * fastest to reach the frontline, so it becomes the nearest (and therefore
 * default) target for enemies using the same nearest-enemy targeting,
 * soaking hits that would otherwise reach the squishier backline. A real
 * taunt/threat mechanic (forcing enemies onto the tank) is future work -
 * same TODO as the rest of the buff/debuff ability effects in BattleManager.
 */
export const aggressiveMeleeBehavior: HeroBehavior = {
  selectTarget: ({ self, enemies }) => selectNearest(self, enemies),
  shouldAdvance: () => true,
};
