import { FlatList, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useHeroStore } from "../../state/heroStore";
import { getHeroDefinition } from "../../state/heroCatalog";
import { ScreenContainer } from "../components/ScreenContainer";
import { HeroCard } from "../components/HeroCard";

type Props = NativeStackScreenProps<RootStackParamList, "Collection">;

export function CollectionScreen({ navigation }: Props) {
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);

  return (
    <ScreenContainer>
      <Text className="mb-4 text-2xl font-bold text-white">Hero Collection</Text>
      <FlatList
        data={ownedHeroes}
        keyExtractor={(hero) => hero.instanceId}
        numColumns={3}
        ListEmptyComponent={<Text className="text-muted">No heroes yet.</Text>}
        renderItem={({ item }) => (
          <HeroCard
            definition={getHeroDefinition(item.heroId)}
            level={item.level}
            onPress={() => navigation.navigate("Upgrade", { instanceId: item.instanceId })}
          />
        )}
      />
    </ScreenContainer>
  );
}
