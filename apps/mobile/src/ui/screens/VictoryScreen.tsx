import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useBattleStore } from "../../state/battleStore";
import { usePlayerStore } from "../../state/playerStore";
import { useMatchStore } from "../../state/matchStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { HudBackButton } from "../components/HudBackButton";
import { Panel } from "../components/Panel";

type Props = NativeStackScreenProps<RootStackParamList, "Victory">;

export function VictoryScreen({ navigation }: Props) {
  const lastResult = useBattleStore((state) => state.lastResult);
  const reset = useBattleStore((state) => state.reset);
  const applyReward = usePlayerStore((state) => state.applyReward);
  const refreshProfile = usePlayerStore((state) => state.refreshProfile);
  const localSide = useMatchStore((state) => state.localSide);
  const clearMatch = useMatchStore((state) => state.clearMatch);
  const appliedRewards = useRef(false);

  const won = lastResult != null && localSide != null && lastResult.winner === localSide;
  const outcomeRef = useRef<"win" | "loss" | null>(null);
  if (lastResult && localSide) {
    outcomeRef.current = won ? "win" : "loss";
  }

  useEffect(() => {
    if (lastResult && !appliedRewards.current) {
      appliedRewards.current = true;
      applyReward(lastResult.rewards);
      void refreshProfile();
    }
  }, [lastResult, applyReward, refreshProfile]);

  const handleContinue = () => {
    reset();
    clearMatch();
    navigation.popToTop();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      reset();
      clearMatch();
    });
    return unsubscribe;
  }, [navigation, reset, clearMatch]);

  return (
    <ScreenContainer onBack={handleContinue} backLabel="Return to camp">
      <View className="flex-1 items-center justify-center gap-5">
        <View className="items-center">
          <Text className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Match complete
          </Text>
          <Text className={`mt-2 text-5xl font-bold ${outcomeRef.current !== "loss" ? "text-accent" : "text-danger"}`}>
            {outcomeRef.current === "loss" ? "Defeat" : "Victory"}
          </Text>
          <Text className="mt-3 max-w-xs text-center text-sm leading-5 text-muted">
            {outcomeRef.current === "loss"
              ? "Their lineup outplayed yours. Change who you bring — or where they stand — and rematch."
              : "Your formation held. Upgrade heroes or tweak the squad, then queue again."}
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
              <RewardLine
                key={card.heroId}
                label="Hero card"
                value={`+${card.count} ${prettyId(card.heroId)}`}
              />
            ))}
            {(lastResult.rewards.materials ?? []).map((mat) => (
              <RewardLine
                key={mat.materialId}
                label="Material"
                value={`+${mat.count} ${prettyId(mat.materialId)}`}
              />
            ))}
          </Panel>
        ) : null}

        <HudBackButton onPress={handleContinue} label="Return to camp" size={64} />
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

function prettyId(id: string): string {
  return id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
