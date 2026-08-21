import { Text, View } from "react-native";
import { Panel } from "./Panel";

const STEPS = [
  {
    n: "1",
    title: "Choose a Commander",
    body: "One legendary leader. Their empire is your core.",
  },
  {
    n: "2",
    title: "Mix two factions",
    body: "Fill five soldier slots from the Commander’s army plus one ally empire.",
  },
  {
    n: "3",
    title: "Place, then they fight",
    body: "20 seconds on the grid. Front = wall. Back = kill. Then they fight alone.",
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
        Battle Formation is a short online auto-battler. You win by Commander, faction mix, and
        where they stand — never by tapping during the fight.
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
