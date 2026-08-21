import { Image, Pressable, StyleSheet } from "react-native";

const retreatIcon = require("../../../assets/hud/retreat.png");

interface HudBackButtonProps {
  onPress: () => void;
  /** Spoken name for screen readers. */
  label?: string;
  size?: number;
}

/** Brass retreat medallion — same HUD control on every screen that can leave. */
export function HudBackButton({ onPress, label = "Return", size = 40 }: HudBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.hit, { width: size + 4, height: size + 4 }, pressed && styles.pressed]}
    >
      <Image source={retreatIcon} style={{ width: size, height: size }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
});
