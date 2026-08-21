import type { Formation, FormationSlot, PlayerSide } from "@battle-formation/shared-types";
import { allSlots, slotToCoordinate, type SlotNumber } from "../../simulation/formation";

export type FormationIntent =
  | { type: "PLACE"; instanceId: string; slot: SlotNumber }
  | { type: "MOVE"; instanceId: string; toSlot: SlotNumber }
  | { type: "REMOVE"; instanceId: string }
  | { type: "SWAP"; slotA: SlotNumber; slotB: SlotNumber };

type IntentListener = (intent: FormationIntent) => void;

/**
 * Owns "which hero instance occupies which slot" for one player's side.
 * Every mutation goes through `apply()` and is expressed as a small,
 * serializable FormationIntent. PositionManager doesn't talk to the
 * network itself, but every state change is already shaped as a message a
 * future multiplayer sync layer can broadcast to the opponent/spectators
 * and replay on the other end - `onIntentApplied` is that seam, unused
 * until that layer exists.
 */
export class PositionManager {
  private readonly occupancy = new Map<SlotNumber, string>();
  private readonly listeners: IntentListener[] = [];

  constructor(private readonly side: PlayerSide) {}

  onIntentApplied(listener: IntentListener): void {
    this.listeners.push(listener);
  }

  apply(intent: FormationIntent): boolean {
    const applied = this.tryApply(intent);
    if (applied) {
      this.listeners.forEach((listener) => listener(intent));
    }
    return applied;
  }

  private tryApply(intent: FormationIntent): boolean {
    switch (intent.type) {
      case "PLACE": {
        if (this.occupancy.has(intent.slot) || this.getSlotOf(intent.instanceId) !== null) {
          return false;
        }
        this.occupancy.set(intent.slot, intent.instanceId);
        return true;
      }
      case "MOVE": {
        const fromSlot = this.getSlotOf(intent.instanceId);
        if (fromSlot === null) return false;
        if (this.occupancy.has(intent.toSlot) && this.occupancy.get(intent.toSlot) !== intent.instanceId) {
          return false;
        }
        this.occupancy.delete(fromSlot);
        this.occupancy.set(intent.toSlot, intent.instanceId);
        return true;
      }
      case "REMOVE": {
        const slot = this.getSlotOf(intent.instanceId);
        if (slot === null) return false;
        this.occupancy.delete(slot);
        return true;
      }
      case "SWAP": {
        const a = this.occupancy.get(intent.slotA);
        const b = this.occupancy.get(intent.slotB);
        if (!a || !b) return false;
        this.occupancy.set(intent.slotA, b);
        this.occupancy.set(intent.slotB, a);
        return true;
      }
    }
  }

  getSlotOf(instanceId: string): SlotNumber | null {
    for (const [slot, id] of this.occupancy) {
      if (id === instanceId) return slot;
    }
    return null;
  }

  getOccupant(slot: SlotNumber): string | undefined {
    return this.occupancy.get(slot);
  }

  isComplete(): boolean {
    return this.occupancy.size === allSlots().length;
  }

  toFormation(): Formation {
    const slots: FormationSlot[] = [];
    for (const [slot, instanceId] of this.occupancy) {
      const { col, row } = slotToCoordinate(slot);
      slots.push({ instanceId, col, row });
    }
    return { playerId: this.side, slots };
  }
}
