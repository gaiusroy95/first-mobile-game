import { Text, View } from "react-native";
import { Panel } from "./Panel";

const STEPS = [
  {
    n: "1",
    title: "Build a squad of 6",
    body: "Pick tanks up front, damage and healers in the back.",
  },
  {
    n: "2",
    title: "Place them in 20 seconds",
    body: "Your 3×2 grid is the whole strategy — no tapping during the fight.",
  },
  {
    n: "3",
    title: "Watch them fight",
    body: "Heroes move, attack, and cast on their own. Wipe the enemy team to win.",
  },
] as const;

interface HowToPlayProps {
  compact?: boolean;
}

/** Plain-language pitch so a new player understands the game in one glance. */
export function HowToPlay({ compact = false }: HowToPlayProps) {
  return (
    <Panel title="How you play">
      <Text className="mb-3 text-sm leading-5 text-muted">
        Battle Formation is a short online auto-battler. You never control the fight —
        you win by who you bring and where you stand them.
      </Text>
      <View className={compact ? "gap-2" : "gap-3"}>
        {STEPS.map((step) => (
          <View key={step.n} className="flex-row gap-3">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-primary/25">
              <Text className="text-sm font-bold text-accent">{step.n}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-white">{step.title}</Text>
              {!compact ? <Text className="mt-0.5 text-xs leading-4 text-muted">{step.body}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </Panel>
  );
}
