import { Text, View } from "react-native";

interface CurrencyBadgeProps {
  amount: number;
  kind?: "gold" | "gems" | "trophies";
}

const LABELS = {
  gold: "Gold",
  gems: "Gems",
  trophies: "Trophies",
} as const;

const TONES = {
  gold: "text-accent",
  gems: "text-sky-300",
  trophies: "text-amber-200",
} as const;

export function CurrencyBadge({ amount, kind = "gold" }: CurrencyBadgeProps) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1.5">
      <Text className={`text-[10px] font-bold uppercase tracking-wider ${TONES[kind]}`}>
        {LABELS[kind]}
      </Text>
      <Text className="font-semibold text-white">{amount}</Text>
    </View>
  );
}
