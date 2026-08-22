import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  /** Short supporting line under the label (e.g. "1–2 min match"). */
  subtitle?: string;
}

const GRADIENTS: Record<"primary" | "danger", [string, string]> = {
  primary: ["#e6c179", "#a3781f"],
  danger: ["#d9614a", "#7a2318"],
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  subtitle,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const isGradient = variant === "primary" || variant === "danger";

  const content = loading ? (
    <ActivityIndicator color={isGradient ? "#241608" : "#eef2ea"} />
  ) : (
    <View className="items-center">
      <Text
        className={`font-heading text-base tracking-wide ${isGradient ? "text-[#241608]" : "text-ink"}`}
      >
        {label}
      </Text>
      {subtitle ? (
        <Text className={`mt-0.5 text-xs ${isGradient ? "text-[#241608]/70" : "text-white/70"}`}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  if (isGradient) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`overflow-hidden rounded-2xl active:opacity-85 ${isDisabled ? "opacity-40" : ""}`}
      >
        <LinearGradient
          colors={GRADIENTS[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="items-center px-6 py-3.5"
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  const flatClasses =
    variant === "secondary" ? "bg-surface-raised border border-border" : "bg-transparent border border-border";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center rounded-2xl px-6 py-3.5 active:opacity-85 ${flatClasses} ${
        isDisabled ? "opacity-40" : ""
      }`}
    >
      {content}
    </Pressable>
  );
}
