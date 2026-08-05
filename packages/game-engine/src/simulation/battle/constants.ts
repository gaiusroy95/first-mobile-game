/** Simulated ticks per second - a unit for cooldown/movement math, not real time. */
export const TICK_RATE = 10;

/** Safety cap (60s of simulated time) against a stalemate neither side can resolve. */
export const MAX_TICKS = 600;

/** movementSpeed points required to advance one discrete grid step. */
export const MOVEMENT_STEP_COST = 10;
