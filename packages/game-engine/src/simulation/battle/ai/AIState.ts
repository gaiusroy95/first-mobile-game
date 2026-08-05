/**
 * A hero's current decision state, re-evaluated once per simulation tick.
 * Exposed on HeroEntity so the renderer can eventually key animations off
 * it (e.g. play a cast animation while a hero is in CAST_SKILL) without
 * needing to infer state from the raw event log.
 */
export type AIState = "IDLE" | "SEARCH_TARGET" | "MOVE" | "ATTACK" | "CAST_SKILL" | "DEAD";
