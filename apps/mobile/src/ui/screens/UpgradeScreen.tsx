import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { resolveHero } from "@battle-formation/game-engine";
import type { RootStackParamList } from "../../navigation/types";
import { useHeroStore } from "../../state/heroStore";
import { usePlayerStore } from "../../state/playerStore";
import { getHeroDefinition } from "../../state/heroCatalog";
import { ScreenContainer } from "../components/ScreenContainer";
import { HeroCard, HeroGridItem } from "../components/HeroCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { CurrencyBadge } from "../components/CurrencyBadge";

type Props = NativeStackScreenProps<RootStackParamList, "Upgrade">;

const COSMETIC_ID = "skin_gold_trim";

function upgradeGoldCost(level: number): number {
  return level * 50;
}

function upgradeMaterialCost(level: number): number {
  return Math.max(1, Math.ceil(level / 2));
}

export function UpgradeScreen({ navigation, route }: Props) {
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const upgradeHero = useHeroStore((state) => state.upgradeHero);
  const equipCosmetic = useHeroStore((state) => state.equipCosmetic);
  const gold = usePlayerStore((state) => state.gold);
  const gems = usePlayerStore((state) => state.gems);
  const materials = usePlayerStore((state) => state.materials);
  const ownedCosmetics = usePlayerStore((state) => state.ownedCosmetics);
  const refreshProfile = usePlayerStore((state) => state.refreshProfile);
  const purchaseCosmetic = usePlayerStore((state) => state.purchaseCosmetic);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>(route.params?.instanceId);
  const [error, setError] = useState<string | null>(null);

  const selected = ownedHeroes.find((hero) => hero.instanceId === selectedInstanceId);
  const essence = materials.essence_common ?? 0;

  if (!selected) {
    return (
      <ScreenContainer onBack={() => navigation.goBack()} backLabel="Return to lobby">
        <Text className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Grow stronger</Text>
        <Text className="mb-4 mt-1 text-2xl font-bold text-ink">Upgrade heroes</Text>
        <FlatList
          data={ownedHeroes}
          keyExtractor={(hero) => hero.instanceId}
          numColumns={3}
          columnWrapperStyle={{ alignItems: "flex-start" }}
          ListEmptyComponent={<Text className="text-muted">No heroes yet.</Text>}
          renderItem={({ item }) => (
            <HeroGridItem>
              <HeroCard
                definition={getHeroDefinition(item.heroId)}
                level={item.level}
                onPress={() => setSelectedInstanceId(item.instanceId)}
              />
            </HeroGridItem>
          )}
        />
      </ScreenContainer>
    );
  }

  const definition = getHeroDefinition(selected.heroId);
  const current = resolveHero(definition, selected.level);
  const next = resolveHero(definition, selected.level + 1);
  const goldCost = upgradeGoldCost(selected.level);
  const matCost = upgradeMaterialCost(selected.level);
  const canAfford = gold >= goldCost && essence >= matCost;

  const handleUpgrade = async () => {
    setError(null);
    try {
      await upgradeHero(selected.instanceId);
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
    }
  };

  return (
    <ScreenContainer
      onBack={() => setSelectedInstanceId(undefined)}
      backLabel="Choose another hero"
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Grow stronger</Text>
          <Text className="mt-1 text-2xl font-bold text-ink">Upgrade heroes</Text>
        </View>
        <View className="items-end gap-1">
          <CurrencyBadge amount={gold} />
          <Text className="text-xs text-muted">
            {essence} essence · {gems} gems
          </Text>
        </View>
      </View>

      <View className="items-center gap-3">
        <HeroCard definition={definition} level={selected.level} featured />

        <View className="w-full rounded-lg bg-surface p-4">
          <StatComparisonRow label="HP" before={current.hp} after={next.hp} />
          <StatComparisonRow label="Attack" before={current.attack} after={next.attack} />
          <StatComparisonRow label="Defense" before={current.defense} after={next.defense} />
        </View>

        <PrimaryButton
          label={`Upgrade Lv.${selected.level + 1} — ${goldCost}g + ${matCost} essence`}
          onPress={() => void handleUpgrade()}
          disabled={!canAfford}
        />
        {error ? <Text className="text-xs text-red-400">{error}</Text> : null}

        <View className="w-full gap-2 rounded-lg bg-surface p-4">
          <Text className="font-semibold text-white">Cosmetic: Gold Trim</Text>
          <Text className="text-xs text-muted">Visual only — no combat stats.</Text>
          {!ownedCosmetics.includes(COSMETIC_ID) ? (
            <PrimaryButton
              label="Buy for 50 gems"
              onPress={() => void purchaseCosmetic(COSMETIC_ID).then(() => refreshProfile())}
              disabled={gems < 50}
            />
          ) : (
            <PrimaryButton
              label={selected.cosmeticId === COSMETIC_ID ? "Unequip" : "Equip"}
              onPress={() =>
                void equipCosmetic(
                  selected.instanceId,
                  selected.cosmeticId === COSMETIC_ID ? null : COSMETIC_ID
                )
              }
            />
          )}
        </View>

        <PrimaryButton
          label="Choose a Different Hero"
          variant="secondary"
          onPress={() => setSelectedInstanceId(undefined)}
        />
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
