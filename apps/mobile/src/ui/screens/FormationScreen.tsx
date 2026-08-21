import { Image, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { describeArmy, pickDefaultSquad, squadErrors, UNIT_COUNT } from "@battle-formation/game-engine";
import { FACTION_CATALOG, PLAYABLE_FACTIONS } from "@battle-formation/shared-types";
import type { RootStackParamList } from "../../navigation/types";
import { useFormationStore } from "../../state/formationStore";
import { useHeroStore } from "../../state/heroStore";
import { getHeroDefinition } from "../../state/heroCatalog";
import { ScreenContainer } from "../components/ScreenContainer";
import { HeroCard, HeroGridItem } from "../components/HeroCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Panel } from "../components/Panel";
import { portraitFor } from "../main-menu/portraits";

type Props = NativeStackScreenProps<RootStackParamList, "Formation">;

export function FormationScreen({ navigation }: Props) {
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const commanderInstanceId = useFormationStore((state) => state.commanderInstanceId);
  const allyFaction = useFormationStore((state) => state.allyFaction);
  const selectedUnitIds = useFormationStore((state) => state.selectedUnitIds);
  const selectCommander = useFormationStore((state) => state.selectCommander);
  const setAllyFaction = useFormationStore((state) => state.setAllyFaction);
  const toggleUnit = useFormationStore((state) => state.toggleUnit);
  const hydrate = useFormationStore((state) => state.hydrate);

  const commanders = ownedHeroes.filter((hero) => getHeroDefinition(hero.heroId).role === "commander");
  const commander = commanderInstanceId
    ? ownedHeroes.find((hero) => hero.instanceId === commanderInstanceId)
    : undefined;
  const commanderDef = commander ? getHeroDefinition(commander.heroId) : undefined;

  const allyOptions = PLAYABLE_FACTIONS.filter((id) => id !== commanderDef?.faction);
  const allowedFactions = new Set(
    commanderDef && allyFaction ? [commanderDef.faction, allyFaction] : []
  );
  const units = ownedHeroes.filter((hero) => {
    const def = getHeroDefinition(hero.heroId);
    return def.role === "unit" && allowedFactions.has(def.faction);
  });

  const unitDefs = selectedUnitIds
    .map((id) => ownedHeroes.find((hero) => hero.instanceId === id))
    .filter((hero): hero is NonNullable<typeof hero> => hero != null)
    .map((hero) => getHeroDefinition(hero.heroId));
  const errors = squadErrors(commanderDef, unitDefs, allyFaction);
  const ready = errors.length === 0;
  const preview = commanderDef ? describeArmy([commanderDef, ...unitDefs]) : null;

  return (
    <ScreenContainer onBack={() => navigation.goBack()} backLabel="Return to lobby">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24, gap: 16 }}>
        <View>
          <Text className="text-xs font-bold uppercase tracking-[0.14em] text-accent">War council</Text>
          <Text className="mt-1 text-2xl font-bold text-ink">Commander + two empires</Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            Pick your leader, mix soldiers from their faction and one ally, then place them in the
            20-second prep. Same-faction troops swear an Oathbound bonus. Where you stand the
            Commander changes the army — front row steels the line, back row directs the kill.
          </Text>
        </View>

        <Panel title="1. Commander">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {commanders.map((hero) => {
              const def = getHeroDefinition(hero.heroId);
              const selected = hero.instanceId === commanderInstanceId;
              const art = portraitFor(def.id);
              return (
                <Pressable
                  key={hero.instanceId}
                  onPress={() => selectCommander(hero.instanceId, def.faction)}
                  className={`overflow-hidden rounded-xl border-2 ${selected ? "border-accent" : "border-border"}`}
                  style={{ width: 128 }}
                >
                  {art ? (
                    <Image source={art} style={{ width: 128, height: 168 }} resizeMode="cover" />
                  ) : (
                    <View className="h-40 items-center justify-center bg-surface-raised">
                      <Text className="font-bold text-ink">{def.name}</Text>
                    </View>
                  )}
                  <View className="bg-surface px-2 py-2">
                    <Text numberOfLines={1} className="text-xs font-bold text-ink">
                      {def.name}
                    </Text>
                    <Text className="text-[10px] uppercase text-muted">{def.faction}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Panel>

        <Panel title="2. Ally faction">
          <View className="flex-row flex-wrap gap-2">
            {allyOptions.map((id) => {
              const info = FACTION_CATALOG.find((faction) => faction.id === id);
              const selected = allyFaction === id;
              return (
                <Pressable
                  key={id}
                  disabled={!commanderDef}
                  onPress={() => setAllyFaction(id)}
                  className={`rounded-full border px-3 py-2 ${
                    selected ? "border-accent bg-accent/20" : "border-border bg-surface"
                  }`}
                >
                  <Text className={`text-xs font-bold uppercase ${selected ? "text-accent" : "text-ink"}`}>
                    {info?.name ?? id}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {!commanderDef ? (
            <Text className="mt-2 text-xs text-muted">Choose a Commander first.</Text>
          ) : null}
        </Panel>

        <Panel title={`3. Five soldiers  ${selectedUnitIds.length}/${UNIT_COUNT}`}>
          {units.length === 0 ? (
            <Text className="text-sm text-muted">Pick an ally faction to see mixable soldiers.</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {units.map((hero) => {
                const def = getHeroDefinition(hero.heroId);
                return (
                  <HeroGridItem key={hero.instanceId}>
                    <HeroCard
                      definition={def}
                      level={hero.level}
                      selected={selectedUnitIds.includes(hero.instanceId)}
                      onPress={() => toggleUnit(hero.instanceId, def.faction)}
                    />
                  </HeroGridItem>
                );
              })}
            </View>
          )}
        </Panel>

        {preview?.pact && ready ? (
          <Panel title={preview.pact.name}>
            <Text className="text-sm text-ink">{preview.pact.blurb}</Text>
            <Text className="mt-2 text-xs text-muted">
              Oathbound: soldiers of your Commander’s empire gain extra HP and attack. Mandate:
              Commander in the front row buffs the wall; in the back row buffs the kill line.
            </Text>
          </Panel>
        ) : null}

        {errors.map((error) => (
          <Text key={error} className="text-sm text-danger">
            {error}
          </Text>
        ))}

        <PrimaryButton
          label="Save army"
          subtitle="Then Practice from the lobby"
          disabled={!ready}
          onPress={() => navigation.navigate("Lobby")}
        />
        <PrimaryButton
          label="Auto-build a legal mix"
          variant="secondary"
          onPress={() => {
            const pick = pickDefaultSquad(
              ownedHeroes.map((hero) => ({ instanceId: hero.instanceId, heroId: hero.heroId })),
              getHeroDefinition
            );
            if (pick) hydrate(pick.commanderInstanceId, pick.allyFaction, pick.unitInstanceIds);
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
