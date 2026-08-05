import type { HeroBehavior } from "../HeroBehavior";
import { selectNearest } from "../../TargetSelection";

/**
 * Universal fallback for any hero/class with no registered behavior -
 * nearest enemy, always engage. Ensures a brand new class works
 * out of the box the moment it's added to the hero database, before
 * anyone gets around to writing it a bespoke HeroBehavior.
 */
export const defaultBehavior: HeroBehavior = {
  selectTarget: ({ self, enemies }) => selectNearest(self, enemies),
  shouldAdvance: () => true,
};
