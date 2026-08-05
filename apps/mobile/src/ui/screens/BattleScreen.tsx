import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BattleRewards, Formation, FormationSlot, PlayerSide, RosterHero } from "@battle-formation/shared-types";
import type { RootStackParamList } from "../../navigation/types";
import { useFormationStore } from "../../state/formationStore";
import { useHeroStore } from "../../state/heroStore";
import { useBattleStore } from "../../state/battleStore";
import { getHeroDefinition, heroManager } from "../../state/heroCatalog";
import { GameContainer, type GameContainerHandle } from "../../game/GameContainer";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Battle">;

// Naive AI opponent: one of each hero in the database, level 1, auto-placed
// slot 1-6 in database order. Real matchmaking/opponent selection is a
// later milestone - this exists only to give the player's squad something
// to fight before a backend exists.
const aiDefinitions = heroManager.listDefinitions().slice(0, 6);
const aiRoster: RosterHero[] = aiDefinitions.map((definition) => ({
  instanceId: `playerB-${definition.id}`,
  side: "playerB",
  definition,
  level: 1,
}));

function buildAiFormation(): Formation {
  const slots: FormationSlot[] = aiDefinitions.map((definition, index) => ({
    instanceId: `playerB-${definition.id}`,
    col: (index % 3) as 0 | 1 | 2,
    row: (index < 3 ? 0 : 1) as 0 | 1,
  }));
  return { playerId: "playerB", slots };
}

export function BattleScreen({ navigation }: Props) {
  const gameRef = useRef<GameContainerHandle>(null);
  const selectedInstanceIds = useFormationStore((state) => state.selectedInstanceIds);
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const setResult = useBattleStore((state) => state.setResult);

  useEffect(() => {
    const squad = ownedHeroes.filter((hero) => selectedInstanceIds.includes(hero.instanceId));
    const playerRoster: RosterHero[] = squad.map((owned) => ({
      instanceId: owned.instanceId,
      side: "playerA",
      definition: getHeroDefinition(owned.heroId),
      level: owned.level,
    }));

    gameRef.current?.loadHeroes([...playerRoster, ...aiRoster]);
    gameRef.current?.startFormationPhase(20);
  }, [selectedInstanceIds, ownedHeroes]);

  const handleFormationConfirmed = (formation: Formation) => {
    gameRef.current?.setFormation([formation, buildAiFormation()]);
    gameRef.current?.startBattle(Date.now());
  };

  const handleBattleFinished = (winner: PlayerSide, rewards: BattleRewards) => {
    setResult(winner, rewards);
    navigation.replace("Victory");
  };

  return (
    <ScreenContainer padded={false}>
      <View className="px-4 py-2">
        <Text className="text-lg font-semibold text-white">Arrange your formation - 20s</Text>
      </View>
      <GameContainer
        ref={gameRef}
        onFormationConfirmed={handleFormationConfirmed}
        onBattleFinished={handleBattleFinished}
        onError={(message) => console.error("[game]", message)}
      />
    </ScreenContainer>
  );
}
