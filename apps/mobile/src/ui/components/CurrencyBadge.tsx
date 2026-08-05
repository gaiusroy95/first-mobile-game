import { Text, View } from "react-native";

interface CurrencyBadgeProps {
  amount: number;
}

export function CurrencyBadge({ amount }: CurrencyBadgeProps) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-surface px-3 py-1.5">
      <Text className="text-accent">🪙</Text>
      <Text className="font-semibold text-white">{amount}</Text>
    </View>
  );
}
