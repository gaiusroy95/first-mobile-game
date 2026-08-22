import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useMatchStore } from "../../state/matchStore";
import { pickDefaultSquad, SQUAD_SIZE, squadInstanceIds } from "@battle-formation/game-engine";
import { getHeroDefinition } from "../../state/heroCatalog";
import { useFormationStore } from "../../state/formationStore";
import { useHeroStore } from "../../state/heroStore";
import { useAuthStore } from "../../state/authStore";
import {
  fetchAdventureProgress,
  fetchAdventureStages,
  fetchEvents,
  fetchTournaments,
  joinTournament,
  playAdventureStage,
  type AdventureStage,
} from "../../api/endpoints/modes";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { Panel } from "../components/Panel";

type Props = NativeStackScreenProps<RootStackParamList, "Modes">;

export function ModesScreen({ navigation }: Props) {
  const findMatch = useMatchStore((state) => state.findMatch);
  const queueStatus = useMatchStore((state) => state.queueStatus);
  const selectedInstanceIds = useFormationStore((state) => state.selectedInstanceIds);
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const playerId = useAuthStore((state) => state.playerId);

  const [stages, setStages] = useState<AdventureStage[]>([]);
  const [highestCleared, setHighestCleared] = useState(0);
  const [events, setEvents] = useState<{ id: string; title: string; description: string }[]>([]);
  const [tournaments, setTournaments] = useState<
    { id: string; name: string; status: string; playerIds: string[]; maxPlayers: number }[]
  >([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdventureStages().then(setStages).catch(() => undefined);
    void fetchAdventureProgress()
      .then((p) => setHighestCleared(p.highestCleared))
      .catch(() => undefined);
    void fetchEvents().then(setEvents).catch(() => undefined);
    void fetchTournaments().then(setTournaments).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (queueStatus === "matched") {
      navigation.navigate("Battle");
    }
  }, [queueStatus, navigation]);

  const buildFormationFromSquad = () => {
    const saved = ownedHeroes.filter((h) => selectedInstanceIds.includes(h.instanceId));
    const pick = pickDefaultSquad(
      ownedHeroes.map((h) => ({ instanceId: h.instanceId, heroId: h.heroId })),
      getHeroDefinition
    );
    const ids =
      saved.length === SQUAD_SIZE
        ? saved.map((h) => h.instanceId)
        : pick
          ? squadInstanceIds(pick)
          : ownedHeroes.slice(0, SQUAD_SIZE).map((h) => h.instanceId);
    const source = ids
      .map((id) => ownedHeroes.find((h) => h.instanceId === id))
      .filter((h): h is NonNullable<typeof h> => h != null);
    return {
      playerId: playerId ?? "local",
      slots: source.map((hero, index) => ({
        instanceId: hero.instanceId,
        col: (index % 3) as 0 | 1 | 2,
        row: (index < 3 ? 0 : 1) as 0 | 1,
      })),
    };
  };

  return (
    <ScreenContainer onBack={() => navigation.goBack()} backLabel="Return to lobby">
      <ScrollView className="flex-1" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View>
          <Text className="text-xs font-heading uppercase tracking-[0.16em] text-accent">Play</Text>
          <Text className="mt-1 text-2xl font-display text-ink">Game modes</Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            Same battlefield rules everywhere — different ways to queue and earn rewards.
          </Text>
        </View>
        {message ? <Text className="text-sm text-accent">{message}</Text> : null}

        <Panel title="Player vs player">
          <Text className="mb-3 text-xs text-muted">
            Casual is softer on trophies. Ranked swings harder and matches closer skill.
          </Text>
          <View className="gap-2">
            <PrimaryButton label="Casual match" subtitle="Wider matchmaking" onPress={() => void findMatch("casual")} />
            <PrimaryButton label="Ranked match" subtitle="Stricter MMR · full trophies" onPress={() => void findMatch("ranked")} />
          </View>
        </Panel>

        <Panel title="Adventure">
          <Text className="mb-2 text-xs text-muted">
            Fight scripted enemy teams. Highest cleared: {highestCleared}
          </Text>
          {stages.map((stage) => {
            const locked = stage.id > highestCleared + 1;
            return (
              <View key={stage.id} className="mt-2">
                <PrimaryButton
                  label={`${stage.name} (Lv ${stage.enemyLevels})`}
                  disabled={locked || ownedHeroes.length < 6}
                  onPress={() =>
                    void playAdventureStage(stage.id, buildFormationFromSquad())
                      .then((result) => {
                        setMessage(
                          result.cleared
                            ? `Cleared ${stage.name}!`
                            : `Defeated on ${stage.name}. Try a new formation.`
                        );
                        if (result.cleared) setHighestCleared((h) => Math.max(h, stage.id));
                      })
                      .catch((err) => setMessage(err instanceof Error ? err.message : "Adventure failed"))
                  }
                />
              </View>
            );
          })}
        </Panel>

        <Panel title="Events">
          {events.length === 0 ? (
            <Text className="text-muted">No active events right now.</Text>
          ) : (
            events.map((event) => (
              <View key={event.id} className="mb-3 border-b border-border pb-3 last:mb-0 last:border-b-0 last:pb-0">
                <Text className="font-semibold text-ink">{event.title}</Text>
                <Text className="mt-1 text-xs text-muted">{event.description}</Text>
              </View>
            ))
          )}
        </Panel>

        <Panel title="Tournament">
          {tournaments.length === 0 ? (
            <Text className="text-muted">No tournaments open.</Text>
          ) : (
            tournaments.map((tournament) => (
              <View key={tournament.id} className="mb-3 gap-2">
                <Text className="text-ink">
                  {tournament.name} — {tournament.status} ({tournament.playerIds.length}/
                  {tournament.maxPlayers})
                </Text>
                <PrimaryButton
                  label="Join bracket"
                  disabled={tournament.status !== "open"}
                  onPress={() =>
                    void joinTournament(tournament.id)
                      .then(() => {
                        setMessage(`Joined ${tournament.name}`);
                        return fetchTournaments().then(setTournaments);
                      })
                      .catch((err) => setMessage(err instanceof Error ? err.message : "Join failed"))
                  }
                />
              </View>
            ))
          )}
        </Panel>
      </ScrollView>
    </ScreenContainer>
  );
}
