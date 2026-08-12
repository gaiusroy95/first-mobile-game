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
 * matchmaking battle. Grid positions are set in Phaser during the 20s prep.
 *
 * Tip: front row (nearest center) suits tank/knight/commander; back row
 * suits archer/mages/healer/assassin.
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
      <Text className="mb-2 text-muted">Choose {SQUAD_SIZE} heroes for Find Match.</Text>
      <Text className="mb-4 text-xs text-muted">
        Front row: tanks / knights / commander. Back row: archers / mages / healer / assassin.
      </Text>

      <FlatList
        data={ownedHeroes}
        keyExtractor={(hero) => hero.instanceId}
        numColumns={3}
        ListEmptyComponent={<Text className="text-muted">No heroes yet — register or open Collection.</Text>}
        renderItem={({ item }) => (
          <HeroCard
            definition={getHeroDefinition(item.heroId)}
            level={item.level}
            selected={selectedInstanceIds.includes(item.instanceId)}
            onPress={() => toggle(item.instanceId)}
          />
        )}
      />

      <View className="gap-2 pb-2 pt-4">
        <PrimaryButton
          label="Save Squad & Return to Lobby"
          disabled={!isComplete}
          onPress={() => navigation.navigate("Lobby")}
        />
        <PrimaryButton label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}
