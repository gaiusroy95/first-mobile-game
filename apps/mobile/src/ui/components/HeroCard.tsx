import { Pressable, Text, View } from "react-native";
import type { HeroDefinition } from "@battle-formation/shared-types";
import { rarityColors } from "../theme/rarity";

interface HeroCardProps {
  definition: HeroDefinition;
  level: number;
  selected?: boolean;
  onPress?: () => void;
}

export function HeroCard({ definition, level, selected = false, onPress }: HeroCardProps) {
  const rarityColor = rarityColors[definition.rarity];

  return (
    <Pressable
      onPress={onPress}
      className={`m-1 flex-1 items-center rounded-lg border-2 bg-surface p-3 ${
        selected ? "border-primary" : "border-transparent"
      }`}
    >
      <View
        className="mb-2 h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: rarityColor }}
      >
        <Text className="text-base font-bold text-white">{definition.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text numberOfLines={1} className="text-sm font-semibold text-white">
        {definition.name}
      </Text>
      <Text className="text-xs capitalize text-muted">{definition.class.replace("-", " ")}</Text>
      <Text className="mt-1 text-xs font-medium" style={{ color: rarityColor }}>
        Lv. {level}
      </Text>
    </Pressable>
  );
}
