import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { usePlayerStore } from "../../state/playerStore";
import { useHeroStore } from "../../state/heroStore";
import { useMatchStore } from "../../state/matchStore";
import { useFormationStore, SQUAD_SIZE } from "../../state/formationStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { CurrencyBadge } from "../components/CurrencyBadge";
import { HowToPlay } from "../components/HowToPlay";
import { MenuRow } from "../components/MenuRow";
import { Panel } from "../components/Panel";

type Props = NativeStackScreenProps<RootStackParamList, "Lobby">;

export function LobbyScreen({ navigation }: Props) {
  const displayName = useAuthStore((state) => state.displayName);
  const playerId = useAuthStore((state) => state.playerId);
  const logout = useAuthStore((state) => state.logout);
  const gold = usePlayerStore((state) => state.gold);
  const trophies = usePlayerStore((state) => state.trophies);
  const gems = usePlayerStore((state) => state.gems);
  const level = usePlayerStore((state) => state.level);
  const refreshProfile = usePlayerStore((state) => state.refreshProfile);
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const fetchOwnedHeroes = useHeroStore((state) => state.fetchOwnedHeroes);
  const selectedInstanceIds = useFormationStore((state) => state.selectedInstanceIds);
  const queueStatus = useMatchStore((state) => state.queueStatus);
  const queueError = useMatchStore((state) => state.queueError);
  const matchId = useMatchStore((state) => state.matchId);
  const localSide = useMatchStore((state) => state.localSide);
  const roster = useMatchStore((state) => state.roster);
  const battleResult = useMatchStore((state) => state.battleResult);
  const findMatch = useMatchStore((state) => state.findMatch);
  const practiceMatch = useMatchStore((state) => state.practiceMatch);
  const cancelQueue = useMatchStore((state) => state.cancelQueue);
  const bindSocket = useMatchStore((state) => state.bindSocket);
  const isPractice = useMatchStore((state) => state.isPractice);

  const canBattle = ownedHeroes.length >= 6;
  const squadReady = selectedInstanceIds.length === SQUAD_SIZE;

  useEffect(() => {
    if (playerId) {
      bindSocket(playerId);
    }
    void refreshProfile();
    void fetchOwnedHeroes();
  }, [playerId, bindSocket, refreshProfile, fetchOwnedHeroes]);

  useEffect(() => {
    if (queueStatus === "matched" && matchId && localSide && roster.length > 0 && !battleResult) {
      navigation.navigate("Battle");
    }
  }, [queueStatus, matchId, localSide, roster.length, battleResult, navigation]);

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20, gap: 16 }}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Commander</Text>
            <Text className="mt-1 text-2xl font-bold text-ink">{displayName ?? "Player"}</Text>
            <Text className="mt-1 text-xs text-muted">
              Level {level} · {ownedHeroes.length} heroes owned
            </Text>
          </View>
          <View className="items-end gap-1.5">
            <CurrencyBadge amount={gold} kind="gold" />
            <CurrencyBadge amount={trophies} kind="trophies" />
            <CurrencyBadge amount={gems} kind="gems" />
          </View>
        </View>

        <Panel>
          <Text className="text-lg font-bold text-ink">Ready to fight?</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">
            Start with Practice (one device), then queue real PvP when a second player is ready. You
            get 20 seconds to place six heroes — then they fight on their own.
          </Text>
          {queueError ? <Text className="mt-2 text-sm text-danger">{queueError}</Text> : null}
          {!canBattle ? (
            <Text className="mt-2 text-sm text-accent">
              You need at least 6 heroes — open Collection after registering.
            </Text>
          ) : null}
          {canBattle && !squadReady ? (
            <Text className="mt-2 text-sm text-muted">
              Tip: pick your 6 in “Choose your 6” first (optional — you can still place from your
              full roster in battle).
            </Text>
          ) : null}

          <View className="mt-4 gap-2">
            {queueStatus === "queued" ? (
              <>
                <Text className="text-center text-sm text-accent">
                  {isPractice ? "Starting practice…" : "Searching for an opponent…"}
                </Text>
                {!isPractice ? (
                  <PrimaryButton label="Cancel search" variant="secondary" onPress={() => void cancelQueue()} />
                ) : null}
              </>
            ) : (
              <>
                <PrimaryButton
                  label="Practice vs Bot"
                  subtitle="1 device · instant demo match"
                  onPress={() => void practiceMatch()}
                  disabled={!canBattle}
                />
                <PrimaryButton
                  label="Find real match"
                  subtitle="Casual PvP · needs a second player"
                  variant="secondary"
                  onPress={() => void findMatch("casual")}
                  disabled={!canBattle}
                />
              </>
            )}
          </View>
        </Panel>

        <View className="gap-2">
          <Text className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">Prepare</Text>
          <MenuRow
            title="Choose your 6"
            subtitle="Pick who enters the next match (placement is in-battle)"
            onPress={() => navigation.navigate("Formation")}
          />
          <MenuRow
            title="Hero collection"
            subtitle="Browse roster, unlock new fighters"
            onPress={() => navigation.navigate("Collection")}
          />
          <MenuRow
            title="Upgrade heroes"
            subtitle="Spend gold and materials to grow stronger"
            onPress={() => navigation.navigate("Upgrade")}
          />
          <MenuRow
            title="More modes"
            subtitle="Ranked, Adventure, Events, Tournament"
            onPress={() => navigation.navigate("Modes")}
          />
        </View>

        <HowToPlay />

        <PrimaryButton
          label="Log out"
          variant="ghost"
          onPress={() => {
            logout();
            navigation.replace("Login");
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
