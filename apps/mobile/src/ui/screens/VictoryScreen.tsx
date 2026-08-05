import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useBattleStore } from "../../state/battleStore";
import { usePlayerStore } from "../../state/playerStore";
import { useFormationStore } from "../../state/formationStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = NativeStackScreenProps<RootStackParamList, "Victory">;

/** The local player is always modeled as "playerA" (see BattleManager's `perspective`). */
const LOCAL_SIDE = "playerA";

export function VictoryScreen({ navigation }: Props) {
  const lastResult = useBattleStore((state) => state.lastResult);
  const reset = useBattleStore((state) => state.reset);
  const addGold = usePlayerStore((state) => state.addGold);
  const clearSquad = useFormationStore((state) => state.clear);
  const appliedRewards = useRef(false);

  const won = lastResult?.winner === LOCAL_SIDE;

  useEffect(() => {
    if (lastResult && !appliedRewards.current) {
      appliedRewards.current = true;
      addGold(lastResult.rewards.gold);
    }
  }, [lastResult, addGold]);

  const handleContinue = () => {
    reset();
    clearSquad();
    navigation.popToTop();
  };

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center gap-4">
        <Text className={`text-4xl font-bold ${won ? "text-accent" : "text-red-400"}`}>
          {won ? "Victory!" : "Defeat"}
        </Text>

        {lastResult && (
          <View className="items-center gap-1 rounded-lg bg-surface px-6 py-4">
            <Text className="text-muted">Rewards</Text>
            <Text className="text-lg font-semibold text-white">+{lastResult.rewards.gold} Gold</Text>
            <Text className="text-lg font-semibold text-white">+{lastResult.rewards.experience} XP</Text>
          </View>
        )}
      </View>

      <View className="pb-2">
        <PrimaryButton label="Continue" onPress={handleContinue} />
      </View>
    </ScreenContainer>
  );
}
