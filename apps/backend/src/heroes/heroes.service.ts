import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HeroManager } from "@battle-formation/game-engine";
import { PlayersService } from "../players/players.service";
import { OwnedHeroEntity } from "./owned-hero.entity";

/** Same catalog instance the simulation itself uses - see owned-hero.entity.ts for why this isn't a database table. */
const heroManager = new HeroManager();

function upgradeCost(level: number): number {
  return level * 50;
}

@Injectable()
export class HeroesService {
  constructor(
    @InjectRepository(OwnedHeroEntity) private readonly heroes: Repository<OwnedHeroEntity>,
    private readonly players: PlayersService
  ) {}

  listOwned(playerId: string): Promise<OwnedHeroEntity[]> {
    return this.heroes.find({ where: { playerId } });
  }

  async upgrade(playerId: string, instanceId: string): Promise<OwnedHeroEntity> {
    const owned = await this.heroes.findOne({ where: { id: instanceId, playerId } });
    if (!owned) {
      throw new NotFoundException("Hero not found");
    }

    // Throws if heroId doesn't match a real catalog entry - defense in
    // depth against a corrupted row, not a path any normal client can hit.
    heroManager.getDefinition(owned.heroId);

    await this.players.spendGold(playerId, upgradeCost(owned.level));
    owned.level += 1;
    return this.heroes.save(owned);
  }
}
