import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HudBackButton } from "./HudBackButton";

interface ScreenContainerProps {
  children: ReactNode;
  /** Set false for screens (like Battle) that manage their own edge-to-edge layout. */
  padded?: boolean;
  /** Brass retreat medallion in the top-left HUD. Omit on Login and Lobby. */
  onBack?: () => void;
  backLabel?: string;
}

/** Consistent background/safe-area/padding shell, so every screen doesn't repeat it. */
export function ScreenContainer({
  children,
  padded = true,
  onBack,
  backLabel,
}: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {padded ? (
        <View className="flex-1 px-5 pt-4">
          {onBack ? (
            <View className="mb-3 self-start">
              <HudBackButton onPress={onBack} label={backLabel} />
            </View>
          ) : null}
          {children}
        </View>
      ) : (
        <View className="flex-1">
          {onBack ? (
            <View className="absolute left-3 top-3 z-20">
              <HudBackButton onPress={onBack} label={backLabel} />
            </View>
          ) : null}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
