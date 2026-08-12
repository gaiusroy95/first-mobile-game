import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface PanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Panel({ children, title, className = "" }: PanelProps) {
  return (
    <View className={`rounded-2xl border border-border bg-surface px-4 py-4 ${className}`}>
      {title ? (
        <Text className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-accent">{title}</Text>
      ) : null}
      {children}
    </View>
  );
}
