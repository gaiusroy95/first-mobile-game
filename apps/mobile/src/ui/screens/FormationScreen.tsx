import { FlatList, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useFormationStore, SQUAD_SIZE } from "../../state/formationStore";
import { useHeroStore } from "../../state/heroStore";
import { getHeroDefinition } from "../../state/heroCatalog";
import { ScreenContainer } from "../components/ScreenContainer";
import { HeroCard } from "../components/HeroCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Panel } from "../components/Panel";

type Props = NativeStackScreenProps<RootStackParamList, "Formation">;

export function FormationScreen({ navigation }: Props) {
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const selectedInstanceIds = useFormationStore((state) => state.selectedInstanceIds);
  const toggle = useFormationStore((state) => state.toggle);
  const isComplete = selectedInstanceIds.length === SQUAD_SIZE;

  return (
    <ScreenContainer>
      <View className="mb-3">
        <Text className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Prepare</Text>
        <View className="mt-1 flex-row items-baseline justify-between">
          <Text className="text-2xl font-bold text-ink">Your squad of {SQUAD_SIZE}</Text>
          <Text className={`text-lg font-bold ${isComplete ? "text-accent" : "text-muted"}`}>
            {selectedInstanceIds.length}/{SQUAD_SIZE}
          </Text>
        </View>
      </View>

      <Panel className="mb-4">
        <Text className="text-sm font-semibold text-ink">Where should they stand?</Text>
        <Text className="mt-1 text-xs leading-4 text-muted">
          You only pick who goes into battle here. Exact grid spots are set in the 20-second prep
          before the fight.
        </Text>
        <View className="mt-3 flex-row gap-2">
          <View className="flex-1 rounded-xl border border-border bg-background px-3 py-2">
            <Text className="text-[10px] font-bold uppercase text-accent">Front row</Text>
            <Text className="mt-1 text-xs text-muted">Tank · Knight · Commander</Text>
          </View>
          <View className="flex-1 rounded-xl border border-border bg-background px-3 py-2">
            <Text className="text-[10px] font-bold uppercase text-accent">Back row</Text>
            <Text className="mt-1 text-xs text-muted">Archer · Mage · Healer · Assassin</Text>
          </View>
        </View>
      </Panel>

      <FlatList
        data={ownedHeroes}
        keyExtractor={(hero) => hero.instanceId}
        numColumns={3}
        ListEmptyComponent={
          <Text className="text-muted">No heroes yet — finish registering, then open Collection.</Text>
        }
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
          label="Save squad"
          subtitle="Then Practice or Find Match from the lobby"
          disabled={!isComplete}
          onPress={() => navigation.navigate("Lobby")}
        />
        <PrimaryButton label="Back" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}
