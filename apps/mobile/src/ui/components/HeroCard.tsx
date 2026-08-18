import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { HeroDefinition } from "@battle-formation/shared-types";
import { rarityColors } from "../theme/rarity";
import { portraitFor } from "../main-menu/portraits";

interface HeroCardProps {
  definition: HeroDefinition;
  level: number;
  selected?: boolean;
  onPress?: () => void;
  /** Wider portrait for the upgrade detail pane. */
  featured?: boolean;
}

/** Fixed 3-column cell so FlatList cannot stretch the last card full-width. */
export function HeroGridItem({ children }: { children: ReactNode }) {
  return <View style={styles.gridItem}>{children}</View>;
}

export function HeroCard({ definition, level, selected = false, onPress, featured = false }: HeroCardProps) {
  const rarityColor = rarityColors[definition.rarity];
  const art = portraitFor(definition.id);
  const roleLabel = definition.role === "commander" ? "Commander" : definition.class.replace("-", " ");

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, featured && styles.featured, selected && styles.selected]}
    >
      <View style={[styles.art, { backgroundColor: rarityColor }]}>
        {art ? (
          <Image source={art} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.fallback}>{definition.name.slice(0, 2).toUpperCase()}</Text>
        )}
      </View>
      <Text numberOfLines={2} style={styles.name}>
        {definition.name}
      </Text>
      <Text numberOfLines={1} style={styles.meta}>
        {roleLabel} · {definition.faction}
      </Text>
      <View style={[styles.pill, { backgroundColor: `${rarityColor}33` }]}>
        <Text style={[styles.pillText, { color: rarityColor }]}>
          Lv {level} · {definition.rarity}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    width: "33.33%",
    padding: 4,
    flexGrow: 0,
  },
  card: {
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2a3a32",
    backgroundColor: "#1c2a23",
    borderRadius: 16,
    padding: 8,
  },
  featured: {
    width: 200,
    alignSelf: "center",
  },
  selected: {
    borderColor: "#d4a84b",
  },
  art: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  fallback: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  name: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#eef2ea",
    textAlign: "center",
    minHeight: 32,
  },
  meta: {
    marginTop: 2,
    fontSize: 10,
    textTransform: "uppercase",
    color: "#8a9688",
    textAlign: "center",
  },
  pill: {
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
