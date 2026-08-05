"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BattlesService", {
    enumerable: true,
    get: function() {
        return BattlesService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _gameengine = require("@battle-formation/game-engine");
const _ownedheroentity = require("../heroes/owned-hero.entity");
const _rankingservice = require("../ranking/ranking.service");
const _rewardsservice = require("../rewards/rewards.service");
const _realtimegateway = require("../realtime/realtime.gateway");
const _matchentity = require("./match.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
const heroManager = new _gameengine.HeroManager();
/** Matches the client's prep timer duration (see apps/mobile FormationScene) - see match.entity.ts for why this is enforced here too. */ const FORMATION_DEADLINE_SECONDS = 20;
let BattlesService = class BattlesService {
    createMatch(playerAId, playerBId) {
        const match = this.matches.create({
            playerAId,
            playerBId,
            status: "pending",
            // A per-match deterministic seed: the same two formations replayed
            // with this seed always produce the same event log (see
            // BattleManager), which is what makes the server-authoritative
            // result reproducible and auditable after the fact.
            seed: Date.now().toString(),
            formationDeadline: new Date(Date.now() + FORMATION_DEADLINE_SECONDS * 1000)
        });
        return this.matches.save(match);
    }
    /**
   * Records one side's locked-in formation. Every check below runs inside
   * a single row-locked transaction (`pessimistic_write`), which matters:
   * without the lock, both players submitting within the same instant
   * could each read "the other side is still empty," both write, and both
   * independently observe "both sides are now full" - resolving (and
   * rewarding) the same match twice. The lock serializes the two
   * submissions so exactly one of them ever observes the completed pair.
   */ async submitFormation(matchId, playerId, formation) {
        const match = await this.dataSource.transaction(async (manager)=>{
            const current = await manager.findOne(_matchentity.MatchEntity, {
                where: {
                    id: matchId
                },
                lock: {
                    mode: "pessimistic_write"
                }
            });
            if (!current) throw new _common.NotFoundException("Match not found");
            const isPlayerA = current.playerAId === playerId;
            if (!isPlayerA && current.playerBId !== playerId) {
                throw new _common.ForbiddenException("Not a participant in this match");
            }
            // Blocks resubmission after either both sides are in ("ready") or
            // the match has already been simulated ("complete") - without this,
            // a client could keep re-submitting to force repeated resolution.
            if (current.status !== "pending") {
                throw new _common.ForbiddenException("Formation already locked in for this match");
            }
            if (Date.now() > current.formationDeadline.getTime()) {
                throw new _common.BadRequestException("Formation submission deadline has passed");
            }
            await this.assertOwnsFormation(manager, playerId, formation);
            const validation = (0, _gameengine.validateFormation)(formation);
            if (!validation.valid) {
                throw new _common.BadRequestException(validation.errors);
            }
            if (isPlayerA) current.formationA = formation;
            else current.formationB = formation;
            if (current.formationA && current.formationB) {
                current.status = "ready";
            }
            return manager.save(current);
        });
        if (match.status === "ready") {
            const startPayload = {
                matchId: match.id
            };
            this.realtime.emitToPlayer(match.playerAId, "battle:start", startPayload);
            this.realtime.emitToPlayer(match.playerBId, "battle:start", startPayload);
            await this.resolve(match);
        }
    }
    /**
   * Every hero instanceId in the submitted formation must be one this
   * player actually owns. Without this, a client could field an army it
   * doesn't have - someone else's heroes, a higher-level copy that was
   * never granted, or an instanceId that doesn't exist at all - since
   * nothing else about the formation shape reveals who's supposed to own
   * what.
   */ async assertOwnsFormation(manager, playerId, formation) {
        const instanceIds = formation.slots.map((slot)=>slot.instanceId);
        if (instanceIds.length === 0) return;
        const ownedCount = await manager.count(_ownedheroentity.OwnedHeroEntity, {
            where: {
                id: (0, _typeorm1.In)(instanceIds),
                playerId
            }
        });
        if (ownedCount !== instanceIds.length) {
            throw new _common.ForbiddenException("Formation references heroes you don't own");
        }
    }
    /**
   * Runs the exact same BattleManager the client uses to preview/render a
   * battle - the entire point of having built it deterministic and
   * framework-agnostic. The server never trusts a client-reported winner
   * or client-reported hero stats (buildHeroMap resolves stats from the
   * database, never from anything the client sent); it recomputes the
   * outcome itself and broadcasts the identical event log and reward to
   * both participants.
   */ async resolve(match) {
        const heroesByInstanceId = await this.buildHeroMap(match.playerAId, match.playerBId);
        const manager = new _gameengine.BattleManager(match.formationA, match.formationB, heroesByInstanceId, Number(match.seed));
        const result = manager.run();
        match.winnerId = result.winner === "playerA" ? match.playerAId : match.playerBId;
        match.eventLog = result.events;
        match.status = "complete";
        await this.matches.save(match);
        await this.ranking.applyMatchResult(match.playerAId, match.playerBId, match.winnerId);
        // Rewards are computed and persisted here, as a direct consequence of
        // the server's own resolution - never in response to a client request
        // (see RewardsService.grantForMatch).
        const rewards = await this.rewards.grantForMatch(match);
        const toPlayerA = {
            matchId: match.id,
            winner: result.winner,
            events: result.events,
            rewards: rewards.playerA
        };
        const toPlayerB = {
            matchId: match.id,
            winner: result.winner,
            events: result.events,
            rewards: rewards.playerB
        };
        this.realtime.emitToPlayer(match.playerAId, "battle:result", toPlayerA);
        this.realtime.emitToPlayer(match.playerBId, "battle:result", toPlayerB);
    }
    /** Hero stats always come from the database (heroId + level) resolved against the shared game-engine catalog - never from anything a client submits. */ async buildHeroMap(playerAId, playerBId) {
        const owned = await this.heroes.find({
            where: {
                playerId: (0, _typeorm1.In)([
                    playerAId,
                    playerBId
                ])
            }
        });
        const map = new Map();
        for (const hero of owned){
            map.set(hero.id, (0, _gameengine.resolveHero)(heroManager.getDefinition(hero.heroId), hero.level));
        }
        return map;
    }
    constructor(matches, heroes, dataSource, ranking, rewards, realtime){
        this.matches = matches;
        this.heroes = heroes;
        this.dataSource = dataSource;
        this.ranking = ranking;
        this.rewards = rewards;
        this.realtime = realtime;
    }
};
BattlesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_matchentity.MatchEntity)),
    _ts_param(1, (0, _typeorm.InjectRepository)(_ownedheroentity.OwnedHeroEntity)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.DataSource === "undefined" ? Object : _typeorm1.DataSource,
        typeof _rankingservice.RankingService === "undefined" ? Object : _rankingservice.RankingService,
        typeof _rewardsservice.RewardsService === "undefined" ? Object : _rewardsservice.RewardsService,
        typeof _realtimegateway.RealtimeGateway === "undefined" ? Object : _realtimegateway.RealtimeGateway
    ])
], BattlesService);

//# sourceMappingURL=battles.service.js.map