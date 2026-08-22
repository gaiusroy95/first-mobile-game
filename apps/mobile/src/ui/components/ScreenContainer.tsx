import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={["#182720", "#0b1210", "#05070a"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView className="flex-1">
        {padded ? (
          <View className="flex-1 items-center px-5 pt-4">
            <View className="w-full max-w-xl flex-1">
              {onBack ? (
                <View className="mb-3 self-start">
                  <HudBackButton onPress={onBack} label={backLabel} />
                </View>
              ) : null}
              {children}
            </View>
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
    </View>
  );
}
