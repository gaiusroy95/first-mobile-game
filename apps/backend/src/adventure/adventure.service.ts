import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  BattleManager,
  HeroManager,
  heroDatabase,
  resolveHero,
  validateFormation,
} from "@battle-formation/game-engine";
import type { BattleEvent, Formation, FormationSlot, Hero, PlayerSide } from "@battle-formation/shared-types";
import { OwnedHeroEntity } from "../heroes/owned-hero.entity";
import { PlayersService } from "../players/players.service";
import { AdventureProgressEntity } from "./adventure-progress.entity";

const heroManager = new HeroManager();

export interface AdventureStage {
  id: number;
  name: string;
  enemyLevels: number;
}

export const ADVENTURE_STAGES: AdventureStage[] = [
  { id: 1, name: "Outskirts Skirmish", enemyLevels: 1 },
  { id: 2, name: "Forest Ambush", enemyLevels: 2 },
  { id: 3, name: "Ruined Keep", enemyLevels: 3 },
  { id: 4, name: "Crystal Gate", enemyLevels: 4 },
  { id: 5, name: "Throne Assault", enemyLevels: 5 },
];

@Injectable()
export class AdventureService {
  constructor(
    @InjectRepository(AdventureProgressEntity)
    private readonly progress: Repository<AdventureProgressEntity>,
    @InjectRepository(OwnedHeroEntity) private readonly heroes: Repository<OwnedHeroEntity>,
    private readonly players: PlayersService
  ) {}

  listStages() {
    return ADVENTURE_STAGES;
  }

  async getProgress(playerId: string): Promise<AdventureProgressEntity> {
    let row = await this.progress.findOne({ where: { playerId } });
    if (!row) {
      row = await this.progress.save(this.progress.create({ playerId, highestCleared: 0 }));
    }
    return row;
  }

  async playStage(
    playerId: string,
    stageId: number,
    formation: Formation
  ): Promise<{ winner: PlayerSide; events: BattleEvent[]; stageId: number; cleared: boolean }> {
    const stage = ADVENTURE_STAGES.find((s) => s.id === stageId);
    if (!stage) throw new NotFoundException("Stage not found");

    const progress = await this.getProgress(playerId);
    if (stageId > progress.highestCleared + 1) {
      throw new BadRequestException("Stage locked — clear earlier stages first");
    }

    const owned = await this.heroes.find({ where: { playerId } });
    const ownedIds = new Set(owned.map((h) => h.id));
    for (const slot of formation.slots) {
      if (!ownedIds.has(slot.instanceId)) {
        throw new BadRequestException("Formation references heroes you don't own");
      }
    }

    const definitionByInstanceId = new Map(
      owned.map((hero) => [hero.id, heroManager.getDefinition(hero.heroId)] as const)
    );
    const validation = validateFormation(formation, definitionByInstanceId);
    if (!validation.valid) throw new BadRequestException(validation.errors);

    const heroesByInstanceId = new Map<string, Hero>();
    for (const hero of owned) {
      heroesByInstanceId.set(hero.id, resolveHero(heroManager.getDefinition(hero.heroId), hero.level));
    }

    const { formation: enemyFormation, heroes: enemyHeroes } = buildAiEncounter(stage.enemyLevels);
    for (const [id, hero] of enemyHeroes) {
      heroesByInstanceId.set(id, hero);
    }

    const manager = new BattleManager(formation, enemyFormation, heroesByInstanceId, stageId * 9973);
    const result = manager.run();
    const cleared = result.winner === "playerA";

    if (cleared && stageId > progress.highestCleared) {
      progress.highestCleared = stageId;
      await this.progress.save(progress);
      await this.players.addGold(playerId, 40 + stageId * 10);
    }

    return { winner: result.winner, events: result.events, stageId, cleared };
  }
}

function buildAiEncounter(level: number): {
  formation: Formation;
  heroes: Map<string, Hero>;
} {
  const ids = [
    "cmd-viking",
    "unit-viking-shield",
    "unit-viking-berserker",
    "unit-mongol-raider",
    "unit-mongol-horse-archer",
    "unit-mongol-scout",
  ];
  const defs = ids.map((id) => {
    const found = heroDatabase.find((definition) => definition.id === id);
    if (!found) throw new Error(`Missing adventure unit ${id}`);
    return found;
  });
  const heroes = new Map<string, Hero>();
  const slots: FormationSlot[] = defs.map((definition, index) => {
    const instanceId = `adventure-ai-${definition.id}`;
    heroes.set(instanceId, resolveHero(definition, level));
    return {
      instanceId,
      col: (index % 3) as 0 | 1 | 2,
      row: (index < 3 ? 0 : 1) as 0 | 1,
    };
  });
  return {
    formation: { playerId: "adventure-ai", slots },
    heroes,
  };
}
