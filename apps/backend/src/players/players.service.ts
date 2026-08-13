import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Player } from "./player.entity";

@Injectable()
export class PlayersService {
  constructor(@InjectRepository(Player) private readonly players: Repository<Player>) {}

  findById(playerId: string): Promise<Player> {
    return this.players.findOneByOrFail({ id: playerId });
  }

  updateProfile(playerId: string, changes: { displayName?: string }): Promise<Player> {
    return this.players.save({ id: playerId, ...changes });
  }

  async addGold(playerId: string, amount: number): Promise<void> {
    await this.players.increment({ id: playerId }, "gold", amount);
  }

  /** Throws if the player can't afford it - callers don't need to check the balance themselves first. */
  async spendGold(playerId: string, amount: number): Promise<void> {
    const player = await this.findById(playerId);
    if (player.gold < amount) {
      throw new BadRequestException("Not enough gold");
    }
    await this.players.decrement({ id: playerId }, "gold", amount);
  }

  async spendMaterial(playerId: string, materialId: string, amount: number): Promise<void> {
    const player = await this.findById(playerId);
    const materials = { ...(player.materials ?? {}) };
    const have = materials[materialId] ?? 0;
    if (have < amount) {
      throw new BadRequestException(`Not enough ${materialId}`);
    }
    materials[materialId] = have - amount;
    player.materials = materials;
    await this.players.save(player);
  }

  async spendHeroCards(playerId: string, heroId: string, amount: number): Promise<void> {
    const player = await this.findById(playerId);
    const cards = { ...(player.heroCards ?? {}) };
    const have = cards[heroId] ?? 0;
    if (have < amount) {
      throw new BadRequestException("Not enough hero cards");
    }
    cards[heroId] = have - amount;
    player.heroCards = cards;
    await this.players.save(player);
  }

  async spendGems(playerId: string, amount: number): Promise<void> {
    const player = await this.findById(playerId);
    if (player.gems < amount) {
      throw new BadRequestException("Not enough gems");
    }
    await this.players.decrement({ id: playerId }, "gems", amount);
  }

  async unlockCosmetic(playerId: string, cosmeticId: string, gemCost: number): Promise<Player> {
    const player = await this.findById(playerId);
    if ((player.ownedCosmetics ?? []).includes(cosmeticId)) {
      return player;
    }
    await this.spendGems(playerId, gemCost);
    const updated = await this.findById(playerId);
    updated.ownedCosmetics = [...(updated.ownedCosmetics ?? []), cosmeticId];
    return this.players.save(updated);
  }

  /** System opponent for 1-device Practice matches. */
  async ensurePracticeBot(username: string, displayName: string): Promise<Player> {
    let bot = await this.players.findOne({ where: { username } });
    if (!bot) {
      const bcrypt = await import("bcrypt");
      const passwordHash = await bcrypt.hash(`bot-${Date.now()}`, 10);
      bot = await this.players.save(
        this.players.create({
          username,
          passwordHash,
          displayName,
          gold: 0,
          gems: 0,
          trophies: 0,
        })
      );
    }
    return bot;
  }
}
