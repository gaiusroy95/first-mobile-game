import { FlatList, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { heroDatabase } from "@battle-formation/game-engine";
import type { RootStackParamList } from "../../navigation/types";
import { useHeroStore } from "../../state/heroStore";
import { usePlayerStore } from "../../state/playerStore";
import { getHeroDefinition } from "../../state/heroCatalog";
import { ScreenContainer } from "../components/ScreenContainer";
import { HeroCard, HeroGridItem } from "../components/HeroCard";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = NativeStackScreenProps<RootStackParamList, "Collection">;

const CARDS_TO_UNLOCK = 10;

export function CollectionScreen({ navigation }: Props) {
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const unlockHero = useHeroStore((state) => state.unlockHero);
  const fetchOwnedHeroes = useHeroStore((state) => state.fetchOwnedHeroes);
  const heroCards = usePlayerStore((state) => state.heroCards);
  const refreshProfile = usePlayerStore((state) => state.refreshProfile);
  const ownedIds = new Set(ownedHeroes.map((h) => h.heroId));
  const locked = heroDatabase.filter((definition) => !ownedIds.has(definition.id) && !definition.locked);
  const comingSoon = heroDatabase.filter((definition) => definition.locked);

  return (
    <ScreenContainer onBack={() => navigation.goBack()} backLabel="Return to lobby">
      <Text className="text-xs font-heading uppercase tracking-[0.16em] text-accent">Roster</Text>
      <Text className="mb-1 mt-1 text-2xl font-display text-ink">Hero collection</Text>
      <Text className="mb-4 text-sm text-muted">
        These are your fighters. Unlock more with hero cards earned from matches.
      </Text>
      <FlatList
        data={ownedHeroes}
        keyExtractor={(hero) => hero.instanceId}
        numColumns={3}
        columnWrapperStyle={{ alignItems: "flex-start" }}
        ListEmptyComponent={<Text className="text-muted">No heroes yet.</Text>}
        ListFooterComponent={
          <View className="mt-6 gap-3">
            <Text className="text-lg font-semibold text-ink">Coming soon</Text>
            {comingSoon.map((definition) => (
              <Text key={definition.id} className="text-xs text-muted">
                {definition.name} · {definition.faction}
              </Text>
            ))}
            <Text className="mt-4 text-lg font-semibold text-ink">Locked / Unlockable</Text>
            {locked.length === 0 ? (
              <Text className="text-muted">All heroes unlocked.</Text>
            ) : (
              locked.map((definition) => {
                const cards = heroCards[definition.id] ?? 0;
                return (
                  <View
                    key={definition.id}
                    className="flex-row items-center justify-between rounded-lg bg-surface px-3 py-2"
                  >
                    <View>
                      <Text className="font-semibold text-white">{definition.name}</Text>
                      <Text className="text-xs text-muted">
                        {cards} / {CARDS_TO_UNLOCK} cards
                      </Text>
                    </View>
                    <PrimaryButton
                      label="Unlock"
                      disabled={cards < CARDS_TO_UNLOCK}
                      onPress={() =>
                        void unlockHero(definition.id).then(() => {
                          void refreshProfile();
                          void fetchOwnedHeroes();
                        })
                      }
                    />
                  </View>
                );
              })
            )}
          </View>
        }
        renderItem={({ item }) => (
          <HeroGridItem>
            <HeroCard
              definition={getHeroDefinition(item.heroId)}
              level={item.level}
              onPress={() => navigation.navigate("Upgrade", { instanceId: item.instanceId })}
            />
          </HeroGridItem>
        )}
      />
    </ScreenContainer>
  );
}
