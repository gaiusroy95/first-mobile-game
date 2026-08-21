import { LEGACY_HERO_ALIASES } from "@battle-formation/game-engine";
import type { ImageSourcePropType } from "react-native";

export const FIGHTER_PORTRAITS: Record<string, ImageSourcePropType> = {
  "cmd-arab": require("../../../assets/factions/cmd-arab.jpg"),
  "cmd-byzantine": require("../../../assets/factions/cmd-byzantine.jpg"),
  "cmd-janissary": require("../../../assets/factions/cmd-janissary.jpg"),
  "cmd-viking": require("../../../assets/factions/cmd-viking.jpg"),
  "cmd-mongol": require("../../../assets/factions/cmd-mongol.jpg"),
  "cmd-samurai": require("../../../assets/factions/cmd-samurai.jpg"),
  "unit-arab-vanguard": require("../../../assets/factions/unit-arab-vanguard.jpg"),
  "unit-arab-blademaster": require("../../../assets/factions/unit-arab-blademaster.jpg"),
  "unit-arab-mystic": require("../../../assets/factions/unit-arab-mystic.jpg"),
  "unit-samurai-yari": require("../../../assets/factions/unit-samurai-yari.jpg"),
  "unit-samurai-katana": require("../../../assets/factions/unit-samurai-katana.jpg"),
  "unit-samurai-archer": require("../../../assets/factions/unit-samurai-archer.jpg"),
  "unit-byzantine-guard": require("../../../assets/factions/unit-byzantine-guard.jpg"),
  "unit-byzantine-lancer": require("../../../assets/factions/unit-byzantine-lancer.jpg"),
  "unit-byzantine-strategos": require("../../../assets/factions/unit-byzantine-strategos.jpg"),
  "unit-janissary-guard": require("../../../assets/factions/unit-janissary-guard.jpg"),
  "unit-janissary-musketeer": require("../../../assets/factions/unit-janissary-musketeer.jpg"),
  "unit-janissary-officer": require("../../../assets/factions/unit-janissary-officer.jpg"),
  "unit-mongol-raider": require("../../../assets/factions/unit-mongol-raider.jpg"),
  "unit-mongol-horse-archer": require("../../../assets/factions/unit-mongol-horse-archer.jpg"),
  "unit-mongol-scout": require("../../../assets/factions/unit-mongol-scout.jpg"),
  "unit-viking-shield": require("../../../assets/factions/unit-viking-shield.jpg"),
  "unit-viking-berserker": require("../../../assets/factions/unit-viking-berserker.jpg"),
  "unit-viking-shaman": require("../../../assets/factions/unit-viking-shaman.jpg"),
};

export function portraitFor(heroId: string): ImageSourcePropType | undefined {
  return FIGHTER_PORTRAITS[heroId] ?? FIGHTER_PORTRAITS[LEGACY_HERO_ALIASES[heroId] ?? ""];
}
