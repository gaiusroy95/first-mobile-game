import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useBattleStore } from "../../state/battleStore";
import { usePlayerStore } from "../../state/playerStore";
import { useFormationStore } from "../../state/formationStore";
import { useMatchStore } from "../../state/matchStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = NativeStackScreenProps<RootStackParamList, "Victory">;

export function VictoryScreen({ navigation }: Props) {
  const lastResult = useBattleStore((state) => state.lastResult);
  const reset = useBattleStore((state) => state.reset);
  const applyReward = usePlayerStore((state) => state.applyReward);
  const refreshProfile = usePlayerStore((state) => state.refreshProfile);
  const clearSquad = useFormationStore((state) => state.clear);
  const localSide = useMatchStore((state) => state.localSide);
  const clearMatch = useMatchStore((state) => state.clearMatch);
  const appliedRewards = useRef(false);

  const won = lastResult != null && localSide != null && lastResult.winner === localSide;

  useEffect(() => {
    if (lastResult && !appliedRewards.current) {
      appliedRewards.current = true;
      applyReward(lastResult.rewards);
      void refreshProfile();
    }
  }, [lastResult, applyReward, refreshProfile]);

  const handleContinue = () => {
    reset();
    clearSquad();
    clearMatch();
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
            <Text className="text-lg font-semibold text-white">
              +{lastResult.rewards.experience} XP
            </Text>
            {lastResult.rewards.trophyDelta != null ? (
              <Text className="text-lg font-semibold text-white">
                {lastResult.rewards.trophyDelta >= 0 ? "+" : ""}
                {lastResult.rewards.trophyDelta} Trophies
              </Text>
            ) : null}
            {(lastResult.rewards.heroCards ?? []).map((card) => (
              <Text key={card.heroId} className="text-sm text-white">
                +{card.count} {card.heroId} card
              </Text>
            ))}
            {(lastResult.rewards.materials ?? []).map((mat) => (
              <Text key={mat.materialId} className="text-sm text-white">
                +{mat.count} {mat.materialId}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View className="pb-2">
        <PrimaryButton label="Continue" onPress={handleContinue} />
      </View>
    </ScreenContainer>
  );
}
