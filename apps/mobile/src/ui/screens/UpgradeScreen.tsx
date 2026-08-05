import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { resolveHero } from "@battle-formation/game-engine";
import type { RootStackParamList } from "../../navigation/types";
import { useHeroStore } from "../../state/heroStore";
import { usePlayerStore } from "../../state/playerStore";
import { getHeroDefinition } from "../../state/heroCatalog";
import { ScreenContainer } from "../components/ScreenContainer";
import { HeroCard } from "../components/HeroCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { CurrencyBadge } from "../components/CurrencyBadge";

type Props = NativeStackScreenProps<RootStackParamList, "Upgrade">;

function upgradeCost(level: number): number {
  return level * 50;
}

export function UpgradeScreen({ route }: Props) {
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const upgradeHero = useHeroStore((state) => state.upgradeHero);
  const gold = usePlayerStore((state) => state.gold);
  const spendGold = usePlayerStore((state) => state.spendGold);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>(route.params?.instanceId);

  const selected = ownedHeroes.find((hero) => hero.instanceId === selectedInstanceId);

  if (!selected) {
    return (
      <ScreenContainer>
        <Text className="mb-4 text-2xl font-bold text-white">Upgrade Heroes</Text>
        <FlatList
          data={ownedHeroes}
          keyExtractor={(hero) => hero.instanceId}
          numColumns={3}
          ListEmptyComponent={<Text className="text-muted">No heroes yet - visit the Collection first.</Text>}
          renderItem={({ item }) => (
            <HeroCard
              definition={getHeroDefinition(item.heroId)}
              level={item.level}
              onPress={() => setSelectedInstanceId(item.instanceId)}
            />
          )}
        />
      </ScreenContainer>
    );
  }

  const definition = getHeroDefinition(selected.heroId);
  const current = resolveHero(definition, selected.level);
  const next = resolveHero(definition, selected.level + 1);
  const cost = upgradeCost(selected.level);
  const canAfford = gold >= cost;

  const handleUpgrade = () => {
    if (!spendGold(cost)) return;
    upgradeHero(selected.instanceId);
  };

  return (
    <ScreenContainer>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-white">Upgrade Heroes</Text>
        <CurrencyBadge amount={gold} />
      </View>

      <View className="items-center gap-3">
        <HeroCard definition={definition} level={selected.level} />

        <View className="w-full rounded-lg bg-surface p-4">
          <StatComparisonRow label="HP" before={current.hp} after={next.hp} />
          <StatComparisonRow label="Attack" before={current.attack} after={next.attack} />
          <StatComparisonRow label="Defense" before={current.defense} after={next.defense} />
        </View>

        <PrimaryButton
          label={`Upgrade to Lv. ${selected.level + 1} - ${cost}g`}
          onPress={handleUpgrade}
          disabled={!canAfford}
        />
        {!canAfford && <Text className="text-xs text-red-400">Not enough gold.</Text>}

        <PrimaryButton label="Choose a Different Hero" variant="secondary" onPress={() => setSelectedInstanceId(undefined)} />
      </View>
    </ScreenContainer>
  );
}

function StatComparisonRow({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-muted">{label}</Text>
      <Text className="text-white">
        {before} <Text className="text-accent">→ {after}</Text>
      </Text>
    </View>
  );
}
