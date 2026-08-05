import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
  /** Set false for screens (like Battle) that manage their own edge-to-edge layout. */
  padded?: boolean;
}

/** Consistent background/safe-area/padding shell, so every screen doesn't repeat it. */
export function ScreenContainer({ children, padded = true }: ScreenContainerProps) {
  return (
    <SafeAreaView className={`flex-1 bg-background ${padded ? "px-4 pt-4" : ""}`}>{children}</SafeAreaView>
  );
}
