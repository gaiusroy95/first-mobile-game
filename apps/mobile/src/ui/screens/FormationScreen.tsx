import { FlatList, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useFormationStore, SQUAD_SIZE } from "../../state/formationStore";
import { useHeroStore } from "../../state/heroStore";
import { getHeroDefinition } from "../../state/heroCatalog";
import { ScreenContainer } from "../components/ScreenContainer";
import { HeroCard } from "../components/HeroCard";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = NativeStackScreenProps<RootStackParamList, "Formation">;

/**
 * Squad selection: pick which SQUAD_SIZE owned heroes enter the next
 * battle. Where each one stands on the grid is decided interactively
 * inside Phaser once the battle starts (see FormationScene) - this screen
 * only decides the roster, never positions.
 */
export function FormationScreen({ navigation }: Props) {
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const selectedInstanceIds = useFormationStore((state) => state.selectedInstanceIds);
  const toggle = useFormationStore((state) => state.toggle);
  const isComplete = selectedInstanceIds.length === SQUAD_SIZE;

  return (
    <ScreenContainer>
      <View className="mb-2 flex-row items-baseline justify-between">
        <Text className="text-2xl font-bold text-white">Formation Setup</Text>
        <Text className={isComplete ? "text-accent" : "text-muted"}>
          {selectedInstanceIds.length} / {SQUAD_SIZE}
        </Text>
      </View>
      <Text className="mb-4 text-muted">Choose {SQUAD_SIZE} heroes to bring into battle.</Text>

      <FlatList
        data={ownedHeroes}
        keyExtractor={(hero) => hero.instanceId}
        numColumns={3}
        ListEmptyComponent={<Text className="text-muted">No heroes yet - visit the Collection first.</Text>}
        renderItem={({ item }) => (
          <HeroCard
            definition={getHeroDefinition(item.heroId)}
            level={item.level}
            selected={selectedInstanceIds.includes(item.instanceId)}
            onPress={() => toggle(item.instanceId)}
          />
        )}
      />

      <View className="pb-2 pt-4">
        <PrimaryButton label="Start Battle" disabled={!isComplete} onPress={() => navigation.navigate("Battle")} />
      </View>
    </ScreenContainer>
  );
}
