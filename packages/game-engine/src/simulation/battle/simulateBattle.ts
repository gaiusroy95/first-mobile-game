import type { BattleResult, Formation, Hero } from "@battle-formation/shared-types";
import { BattleManager } from "./BattleManager";

/**
 * Thin functional entry point over BattleManager for callers that just
 * want a final result rather than step-by-step control over PREPARATION ->
 * BATTLE_START -> COMBAT. GameManager (and, later, the backend, running it
 * headlessly to compute the authoritative outcome) both use this; drive
 * BattleManager directly instead if a future feature needs to observe or
 * control the simulation tick by tick (e.g. live spectating).
 */
export function simulateBattle(
  formationA: Formation,
  formationB: Formation,
  heroesByInstanceId: Map<string, Hero>,
  seed: number
): BattleResult {
  const manager = new BattleManager(formationA, formationB, heroesByInstanceId, seed);
  return manager.run();
}
