import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Panel({ children, title, className = "" }: PanelProps) {
  return (
    <View className={`overflow-hidden rounded-2xl border border-accent/40 ${className}`}>
      <LinearGradient
        colors={["#20302a", "#0e1613"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="px-4 py-4"
      >
        <View className="absolute left-0 right-0 top-0 h-px bg-accent/30" />
        {title ? (
          <Text className="mb-3 font-heading text-xs uppercase tracking-[0.16em] text-accent">{title}</Text>
        ) : null}
        {children}
      </LinearGradient>
    </View>
  );
}
