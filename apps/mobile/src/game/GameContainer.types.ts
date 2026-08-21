import type { BattleEvent, BattleRewards, Formation, PlayerSide, RosterHero } from "@battle-formation/shared-types";

export interface GameContainerHandle {
  loadHeroes: (heroes: RosterHero[], localSide?: PlayerSide) => void;
  startFormationPhase: (durationSeconds: number) => void;
  setFormation: (formations: [Formation, Formation]) => void;
  startBattle: (seed: number) => void;
  playBattle: (events: BattleEvent[], winner: PlayerSide, rewards: BattleRewards) => void;
}

export interface GameContainerProps {
  onFormationConfirmed: (formation: Formation) => void;
  onBattleFinished: (winner: PlayerSide, rewards: BattleRewards) => void;
  onError?: (message: string) => void;
}
