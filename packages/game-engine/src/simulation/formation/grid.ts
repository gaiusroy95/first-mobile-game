/**
 * The abstract 3x2 battlefield grid - pure data/math, no pixels. Back row
 * (slots 1-3) sits at row 0, front row (slots 4-6) at row 1. GridManager
 * (render side) builds pixel positions on top of this; the simulation and
 * a future backend only ever need this abstract form.
 */
export const GRID_COLS = 3;
export const GRID_ROWS = 2;

export type SlotNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface SlotCoordinate {
  slot: SlotNumber;
  col: 0 | 1 | 2;
  row: 0 | 1;
}

const ALL_SLOTS: SlotNumber[] = [1, 2, 3, 4, 5, 6];

export function allSlots(): SlotNumber[] {
  return ALL_SLOTS;
}

export function slotToCoordinate(slot: SlotNumber): SlotCoordinate {
  const index = slot - 1;
  const row = (index < GRID_COLS ? 0 : 1) as 0 | 1;
  const col = (index % GRID_COLS) as 0 | 1 | 2;
  return { slot, col, row };
}

export function coordinateToSlot(col: 0 | 1 | 2, row: 0 | 1): SlotNumber {
  return (row * GRID_COLS + col + 1) as SlotNumber;
}
