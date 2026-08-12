import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useMatchStore } from "../../state/matchStore";
import { useFormationStore, SQUAD_SIZE } from "../../state/formationStore";
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
    const squad = ownedHeroes.filter((h) => selectedInstanceIds.includes(h.instanceId)).slice(0, SQUAD_SIZE);
    const source = squad.length === SQUAD_SIZE ? squad : ownedHeroes.slice(0, SQUAD_SIZE);
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
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <Text className="text-2xl font-bold text-white">Game Modes</Text>
        {message ? <Text className="text-sm text-accent">{message}</Text> : null}

        <View className="gap-2 rounded-lg bg-surface p-4">
          <Text className="text-lg font-semibold text-white">PvP</Text>
          <PrimaryButton label="Casual Match" onPress={() => void findMatch("casual")} />
          <PrimaryButton label="Ranked Match" onPress={() => void findMatch("ranked")} />
        </View>

        <View className="gap-2 rounded-lg bg-surface p-4">
          <Text className="text-lg font-semibold text-white">Adventure</Text>
          <Text className="text-xs text-muted">Highest cleared: {highestCleared}</Text>
          {stages.map((stage) => {
            const locked = stage.id > highestCleared + 1;
            return (
              <PrimaryButton
                key={stage.id}
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
            );
          })}
        </View>

        <View className="gap-2 rounded-lg bg-surface p-4">
          <Text className="text-lg font-semibold text-white">Events</Text>
          {events.length === 0 ? (
            <Text className="text-muted">No active events.</Text>
          ) : (
            events.map((event) => (
              <View key={event.id} className="mb-2">
                <Text className="font-semibold text-white">{event.title}</Text>
                <Text className="text-xs text-muted">{event.description}</Text>
              </View>
            ))
          )}
        </View>

        <View className="gap-2 rounded-lg bg-surface p-4">
          <Text className="text-lg font-semibold text-white">Tournament</Text>
          {tournaments.map((tournament) => (
            <View key={tournament.id} className="gap-2">
              <Text className="text-white">
                {tournament.name} — {tournament.status} ({tournament.playerIds.length}/
                {tournament.maxPlayers})
              </Text>
              <PrimaryButton
                label="Join"
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
          ))}
        </View>

        <PrimaryButton label="Back to Lobby" variant="secondary" onPress={() => navigation.goBack()} />
      </ScrollView>
    </ScreenContainer>
  );
}
