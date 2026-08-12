import { Pressable, Text, View } from "react-native";
import type { HeroDefinition } from "@battle-formation/shared-types";
import { rarityColors } from "../theme/rarity";

interface HeroCardProps {
  definition: HeroDefinition;
  level: number;
  selected?: boolean;
  onPress?: () => void;
}

const ROLE_HINT: Record<string, string> = {
  commander: "Front",
  tank: "Front",
  knight: "Front",
  archer: "Back",
  "fire-mage": "Back",
  "ice-mage": "Back",
  assassin: "Back",
  healer: "Back",
};

export function HeroCard({ definition, level, selected = false, onPress }: HeroCardProps) {
  const rarityColor = rarityColors[definition.rarity];
  const role = ROLE_HINT[definition.class] ?? "Any";

  return (
    <Pressable
      onPress={onPress}
      className={`m-1 min-w-[30%] flex-1 items-center rounded-2xl border-2 bg-surface-raised p-3 ${
        selected ? "border-accent" : "border-border"
      }`}
    >
      <View
        className="mb-2 h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: rarityColor }}
      >
        <Text className="text-lg font-bold text-white">{definition.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text numberOfLines={1} className="text-sm font-bold text-ink">
        {definition.name}
      </Text>
      <Text className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">
        {definition.class.replace("-", " ")} · {role}
      </Text>
      <View className="mt-2 rounded-full px-2 py-0.5" style={{ backgroundColor: `${rarityColor}33` }}>
        <Text className="text-[10px] font-bold" style={{ color: rarityColor }}>
          Lv {level} · {definition.rarity}
        </Text>
      </View>
    </Pressable>
  );
}
