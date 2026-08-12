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
import { Panel } from "../components/Panel";

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
      <View className="flex-1 items-center justify-center gap-5">
        <View className="items-center">
          <Text className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Match complete
          </Text>
          <Text className={`mt-2 text-5xl font-bold ${won ? "text-accent" : "text-danger"}`}>
            {won ? "Victory" : "Defeat"}
          </Text>
          <Text className="mt-3 max-w-xs text-center text-sm leading-5 text-muted">
            {won
              ? "Your formation held. Upgrade heroes or tweak the squad, then queue again."
              : "Their lineup outplayed yours. Change who you bring — or where they stand — and rematch."}
          </Text>
        </View>

        {lastResult ? (
          <Panel title="Spoils" className="w-full">
            <RewardLine label="Gold" value={`+${lastResult.rewards.gold}`} />
            <RewardLine label="Experience" value={`+${lastResult.rewards.experience}`} />
            {lastResult.rewards.trophyDelta != null ? (
              <RewardLine
                label="Trophies"
                value={`${lastResult.rewards.trophyDelta >= 0 ? "+" : ""}${lastResult.rewards.trophyDelta}`}
              />
            ) : null}
            {(lastResult.rewards.heroCards ?? []).map((card) => (
              <RewardLine key={card.heroId} label="Hero card" value={`+${card.count} ${card.heroId}`} />
            ))}
            {(lastResult.rewards.materials ?? []).map((mat) => (
              <RewardLine
                key={mat.materialId}
                label="Material"
                value={`+${mat.count} ${mat.materialId.replace("_", " ")}`}
              />
            ))}
          </Panel>
        ) : null}
      </View>

      <View className="gap-2 pb-2">
        <PrimaryButton label="Back to lobby" onPress={handleContinue} />
      </View>
    </ScreenContainer>
  );
}

function RewardLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border py-2 last:border-b-0">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-ink">{value}</Text>
    </View>
  );
}
