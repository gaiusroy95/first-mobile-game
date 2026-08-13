import Phaser from "phaser";
import type { HeroClass, PlayerSide, RosterHero } from "@battle-formation/shared-types";
import { allSlots } from "../../simulation/formation";
import { GridManager } from "./GridManager";
import { PositionManager } from "./PositionManager";
import { HERO_SPRITES } from "../assets";

interface HeroToken {
  instanceId: string;
  gameObject: Phaser.GameObjects.Container;
  benchX: number;
  benchY: number;
}

const TOKEN_SIZE = 48;

/**
 * Turns pointer input (select/drag/drop) into FormationIntents. This is
 * the only system that touches Phaser's input API directly - GridManager
 * and PositionManager stay pure so their logic can be unit-tested (and,
 * later, reused server-side for anti-cheat re-validation) without a
 * Phaser.Scene in the loop. "Select" and "move" fall out of the same drag
 * gesture: picking a token up is the selection, releasing it over a slot
 * is the move.
 */
export class HeroPlacement {
  private readonly tokens = new Map<string, HeroToken>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly grid: GridManager,
    private readonly position: PositionManager,
    private readonly side: PlayerSide,
    private readonly onChange: () => void
  ) {}

  /** Lays the roster out along a bench row, each hero draggable onto the grid. */
  loadRoster(roster: RosterHero[], benchY: number): void {
    this.destroyTokens();
    roster.forEach(({ instanceId, definition }, index) => {
      const x = 30 + index * (TOKEN_SIZE + 8);
      this.tokens.set(instanceId, this.createToken(instanceId, definition.name, definition.class, x, benchY));
    });
  }

  destroyTokens(): void {
    for (const token of this.tokens.values()) {
      token.gameObject.destroy(true);
    }
    this.tokens.clear();
  }

  /** Auto-places any bench heroes not yet on the grid into the remaining empty
   * slots, in bench order - used when the prep timer expires so the formation
   * is always complete even if the player didn't finish dragging. */
  autoPlaceRemaining(): void {
    const emptySlots = allSlots().filter((slot) => this.position.getOccupant(slot) === undefined);
    const unplaced = [...this.tokens.keys()].filter((id) => this.position.getSlotOf(id) === null);

    unplaced.forEach((instanceId, index) => {
      const slot = emptySlots[index];
      if (slot === undefined) return;
      this.position.apply({ type: "PLACE", instanceId, slot });
    });

    this.snapTokensToPositions();
  }

  private createToken(instanceId: string, name: string, heroClass: HeroClass, x: number, y: number): HeroToken {
    // Whatever texture is behind this key - real sprite or (today, always)
    // a generated placeholder circle - is resolved once by FormationScene
    // before any token is created; this line never changes when real art
    // replaces the placeholder.
    const sprite = this.scene.add.sprite(0, 0, HERO_SPRITES[heroClass].key);
    const label = this.scene.add
      .text(0, 0, name.slice(0, 2).toUpperCase(), { fontSize: "12px", color: "#ffffff" })
      .setOrigin(0.5);
    const container = this.scene.add.container(x, y, [sprite, label]);
    container.setSize(TOKEN_SIZE, TOKEN_SIZE);
    container.setInteractive({ draggable: true, useHandCursor: true });
    this.scene.input.setDraggable(container);

    const token: HeroToken = { instanceId, gameObject: container, benchX: x, benchY: y };

    container.on("dragstart", () => container.setScale(1.1));
    container.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      container.setPosition(dragX, dragY);
    });
    container.on("dragend", (pointer: Phaser.Input.Pointer) => {
      container.setScale(1);
      this.handleDrop(token, pointer.x, pointer.y);
    });

    return token;
  }

  private handleDrop(token: HeroToken, pointerX: number, pointerY: number): void {
    const slot = this.grid.getSlotAt(this.side, pointerX, pointerY);

    if (slot === null) {
      // Dropped outside the grid: unplace it and return it to the bench.
      this.position.apply({ type: "REMOVE", instanceId: token.instanceId });
      token.gameObject.setPosition(token.benchX, token.benchY);
      this.onChange();
      return;
    }

    const occupant = this.position.getOccupant(slot);
    const currentSlot = this.position.getSlotOf(token.instanceId);

    let applied: boolean;
    if (occupant !== undefined && occupant !== token.instanceId && currentSlot !== null) {
      applied = this.position.apply({ type: "SWAP", slotA: currentSlot, slotB: slot });
    } else if (currentSlot !== null) {
      applied = this.position.apply({ type: "MOVE", instanceId: token.instanceId, toSlot: slot });
    } else if (occupant === undefined) {
      applied = this.position.apply({ type: "PLACE", instanceId: token.instanceId, slot });
    } else {
      applied = false;
    }

    if (applied) {
      this.snapTokensToPositions();
    } else {
      token.gameObject.setPosition(token.benchX, token.benchY);
    }
    this.onChange();
  }

  private snapTokensToPositions(): void {
    for (const [instanceId, token] of this.tokens) {
      const slot = this.position.getSlotOf(instanceId);
      if (slot !== null) {
        const { x, y } = this.grid.getSlotPosition(this.side, slot);
        token.gameObject.setPosition(x, y);
      }
    }
  }
}
