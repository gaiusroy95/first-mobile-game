import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HeroManager, BOT_STARTER_IDS, PLAYER_STARTER_IDS } from "@battle-formation/game-engine";
import type { OwnedHero, PlayerSide, RosterHero } from "@battle-formation/shared-types";
import { PlayersService } from "../players/players.service";
import { OwnedHeroEntity } from "./owned-hero.entity";
import { toOwnedHeroDto } from "./owned-hero.dto";

const heroManager = new HeroManager();

const CARDS_TO_UNLOCK = 10;
const MATERIAL_FOR_UPGRADE = "essence_common";

function upgradeGoldCost(level: number): number {
  return level * 50;
}

function upgradeMaterialCost(level: number): number {
  return Math.max(1, Math.ceil(level / 2));
}

@Injectable()
export class HeroesService {
  constructor(
    @InjectRepository(OwnedHeroEntity) private readonly heroes: Repository<OwnedHeroEntity>,
    private readonly players: PlayersService
  ) {}

  async listOwned(playerId: string): Promise<OwnedHero[]> {
    const rows = await this.heroes.find({ where: { playerId } });
    return rows.map(toOwnedHeroDto);
  }

  async upgrade(playerId: string, instanceId: string): Promise<OwnedHero> {
    const owned = await this.heroes.findOne({ where: { id: instanceId, playerId } });
    if (!owned) {
      throw new NotFoundException("Hero not found");
    }

    heroManager.getDefinition(owned.heroId);

    const goldCost = upgradeGoldCost(owned.level);
    const matCost = upgradeMaterialCost(owned.level);
    await this.players.spendGold(playerId, goldCost);
    await this.players.spendMaterial(playerId, MATERIAL_FOR_UPGRADE, matCost);

    owned.level += 1;
    return toOwnedHeroDto(await this.heroes.save(owned));
  }

  async grantStarterRoster(playerId: string, pack: "player" | "bot" = "player"): Promise<OwnedHero[]> {
    const starterIds = [...(pack === "bot" ? BOT_STARTER_IDS : PLAYER_STARTER_IDS)];
    const existing = await this.heroes.find({ where: { playerId } });
    const ownedIds = new Set(existing.map((row) => row.heroId));
    const missing = starterIds.filter((heroId) => !ownedIds.has(heroId));
    if (missing.length > 0) {
      const rows = missing.map((heroId) =>
        this.heroes.create({
          playerId,
          heroId,
          level: 1,
          upgrades: [],
          cosmeticId: null,
        })
      );
      await this.heroes.save(rows);
    }
    return this.listOwned(playerId);
  }

  async unlockHero(playerId: string, heroId: string): Promise<OwnedHero> {
    const definition = heroManager.getDefinition(heroId);
    if (definition.locked) {
      throw new BadRequestException("This fighter is not available yet");
    }
    const already = await this.heroes.findOne({ where: { playerId, heroId } });
    if (already) {
      throw new BadRequestException("Hero already owned");
    }

    await this.players.spendHeroCards(playerId, heroId, CARDS_TO_UNLOCK);
    const created = await this.heroes.save(
      this.heroes.create({
        playerId,
        heroId,
        level: 1,
        upgrades: [],
        cosmeticId: null,
      })
    );
    return toOwnedHeroDto(created);
  }

  async equipCosmetic(playerId: string, instanceId: string, cosmeticId: string | null): Promise<OwnedHero> {
    const owned = await this.heroes.findOne({ where: { id: instanceId, playerId } });
    if (!owned) throw new NotFoundException("Hero not found");

    if (cosmeticId) {
      const player = await this.players.findById(playerId);
      if (!(player.ownedCosmetics ?? []).includes(cosmeticId)) {
        throw new BadRequestException("Cosmetic not owned");
      }
    }

    owned.cosmeticId = cosmeticId;
    return toOwnedHeroDto(await this.heroes.save(owned));
  }

  async buildRoster(playerId: string, side: PlayerSide): Promise<RosterHero[]> {
    const owned = await this.heroes.find({ where: { playerId } });
    return owned.map((hero) => ({
      instanceId: hero.id,
      side,
      definition: heroManager.getDefinition(hero.heroId),
      level: hero.level,
    }));
  }
}
