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
}
