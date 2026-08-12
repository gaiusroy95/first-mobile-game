import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  /** Short supporting line under the label (e.g. "1–2 min match"). */
  subtitle?: string;
}

const VARIANT_CLASSES: Record<NonNullable<PrimaryButtonProps["variant"]>, string> = {
  primary: "bg-primary",
  secondary: "bg-surface-raised border border-border",
  ghost: "bg-transparent border border-border",
  danger: "bg-danger",
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

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center rounded-2xl px-6 py-3.5 active:opacity-85 ${VARIANT_CLASSES[variant]} ${
        isDisabled ? "opacity-40" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#eef2ea" />
      ) : (
        <View className="items-center">
          <Text
            className={`text-base font-bold tracking-wide ${
              variant === "primary" || variant === "danger" ? "text-ink" : "text-ink"
            }`}
          >
            {label}
          </Text>
          {subtitle ? <Text className="mt-0.5 text-xs text-white/70">{subtitle}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}
