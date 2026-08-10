import type { BattleRewards, Formation, PlayerSide, RosterHero } from "@battle-formation/shared-types";

export interface GameContainerHandle {
  loadHeroes: (heroes: RosterHero[]) => void;
  startFormationPhase: (durationSeconds: number) => void;
  setFormation: (formations: [Formation, Formation]) => void;
  startBattle: (seed: number) => void;
}

export interface GameContainerProps {
  onFormationConfirmed: (formation: Formation) => void;
  onBattleFinished: (winner: PlayerSide, rewards: BattleRewards) => void;
  onError?: (message: string) => void;
}
