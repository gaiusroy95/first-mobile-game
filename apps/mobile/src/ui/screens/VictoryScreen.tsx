import { useEffect, useRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useBattleStore } from "../../state/battleStore";
import { usePlayerStore } from "../../state/playerStore";
import { useMatchStore } from "../../state/matchStore";
import { HudBackButton } from "../components/HudBackButton";
import { Panel } from "../components/Panel";

const backdrop = require("../../../assets/factions/cmd-samurai.jpg");

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

  const displayWon = outcomeRef.current !== "loss";

  return (
    <View className="flex-1 bg-background">
      <Image source={backdrop} style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]} resizeMode="cover" />
      <LinearGradient
        colors={
          displayWon
            ? ["rgba(5,7,10,0.5)", "rgba(28,20,6,0.82)", "#05070a"]
            : ["rgba(5,7,10,0.6)", "rgba(20,7,7,0.86)", "#05070a"]
        }
        locations={[0, 0.5, 0.88]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView className="flex-1">
        <View className="absolute left-3 top-3 z-20">
          <HudBackButton onPress={handleContinue} label="Return to camp" />
        </View>
        <View className="flex-1 items-center justify-center gap-5 px-5">
          <View className="w-full max-w-md items-center">
            <View className="items-center">
              <Text className="font-heading text-xs uppercase tracking-[0.24em] text-muted">
                Match complete
              </Text>
              <Text
                className={`mt-2 font-display-black text-6xl ${displayWon ? "text-accent" : "text-danger"}`}
                style={{
                  textShadowColor: displayWon ? "rgba(212,168,75,0.55)" : "rgba(196,60,60,0.55)",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 18,
                }}
              >
                {displayWon ? "Victory" : "Defeat"}
              </Text>
              <Text className="mt-3 max-w-xs text-center text-sm leading-5 text-muted">
                {displayWon
                  ? "Your formation held. Upgrade heroes or tweak the squad, then queue again."
                  : "Their lineup outplayed yours. Change who you bring — or where they stand — and rematch."}
              </Text>
            </View>

            {lastResult ? (
              <Panel title="Spoils" className="mt-5 w-full">
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

            <View className="mt-5">
              <HudBackButton onPress={handleContinue} label="Return to camp" size={64} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
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
