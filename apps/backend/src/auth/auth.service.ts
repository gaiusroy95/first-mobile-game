import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import type { AuthResponse } from "@battle-formation/shared-types";
import { Player } from "../players/player.entity";
import { HeroesService } from "../heroes/heroes.service";

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
    private readonly jwt: JwtService,
    private readonly heroes: HeroesService
  ) {}

  async register(username: string, password: string, displayName: string): Promise<AuthResponse> {
    const existing = await this.players.findOne({ where: { username } });
    if (existing) {
      throw new ConflictException("Username already taken");
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const player = await this.players.save(this.players.create({ username, passwordHash, displayName }));
    await this.heroes.grantStarterRoster(player.id);
    return this.issueSession(player);
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const player = await this.players.findOne({ where: { username } });
    if (!player || !(await bcrypt.compare(password, player.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.issueSession(player);
  }

  private issueSession(player: Player): AuthResponse {
    return {
      token: this.jwt.sign({ sub: player.id }),
      playerId: player.id,
      displayName: player.displayName,
    };
  }
}
