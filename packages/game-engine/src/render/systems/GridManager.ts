import type { PlayerSide } from "@battle-formation/shared-types";
import { GRID_COLS, allSlots, slotToCoordinate, type SlotNumber } from "../../simulation/formation";

export interface GridLayoutOptions {
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Pure geometry: converts slot numbers into pixel positions on screen, and
 * pixel positions back into slot numbers (hit-testing). Knows nothing about
 * heroes, input, or occupancy - PositionManager and HeroPlacement are built
 * on top of it, never around it. The abstract col/row math itself comes
 * from simulation/formation/grid.ts so the simulation and the renderer
 * agree on layout without duplicating it.
 */
export class GridManager {
  private readonly cellSize: number;
  private readonly boardWidth: number;

  constructor(private readonly options: GridLayoutOptions) {
    this.boardWidth = Math.min(options.viewportWidth * 0.9, 300);
    this.cellSize = this.boardWidth / GRID_COLS;
  }

  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Pixel center of a slot for the given side. playerA's board sits in the
   * lower half of the screen with its front row (4-6) nearest the
   * centerline; playerB's board mirrors it in the upper half, so both
   * front rows face each other in the middle.
   */
  getSlotPosition(side: PlayerSide, slot: SlotNumber): { x: number; y: number } {
    const { col, row } = slotToCoordinate(slot);
    const originX = (this.options.viewportWidth - this.boardWidth) / 2;
    const x = originX + col * this.cellSize + this.cellSize / 2;

    const rowDepth = row === 1 ? 0 : 1; // front row (4-6) is nearest the centerline
    const offsetFromMid = (rowDepth + 0.5) * this.cellSize;
    const midY = this.options.viewportHeight / 2;
    const y = side === "playerA" ? midY + offsetFromMid : midY - offsetFromMid;

    return { x, y };
  }

  /** Hit-tests a pointer position against one side's slots; null if outside every cell. */
  getSlotAt(side: PlayerSide, pointerX: number, pointerY: number): SlotNumber | null {
    const half = this.cellSize / 2;
    for (const slot of allSlots()) {
      const { x, y } = this.getSlotPosition(side, slot);
      if (Math.abs(pointerX - x) <= half && Math.abs(pointerY - y) <= half) {
        return slot;
      }
    }
    return null;
  }
}

export type { PlayerSide, SlotNumber };
