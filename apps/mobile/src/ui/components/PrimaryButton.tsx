import { ActivityIndicator, Pressable, Text } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<PrimaryButtonProps["variant"]>, string> = {
  primary: "bg-primary",
  secondary: "bg-surface border border-slate-600",
  danger: "bg-red-600",
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`items-center rounded-xl px-6 py-3 active:opacity-80 ${VARIANT_CLASSES[variant]} ${
        isDisabled ? "opacity-40" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
    </Pressable>
  );
}
