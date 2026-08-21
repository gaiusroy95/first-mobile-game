import { Pressable, Text, View } from "react-native";

interface MenuRowProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Secondary lobby actions — readable rows instead of a stack of identical buttons. */
export function MenuRow({ title, subtitle, onPress, disabled }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-between rounded-2xl border border-border bg-surface-raised px-4 py-3.5 active:opacity-80 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>
      </View>
      <Text className="text-lg text-accent">›</Text>
    </Pressable>
  );
}
