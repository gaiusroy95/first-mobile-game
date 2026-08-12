import { useEffect } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { usePlayerStore } from "../../state/playerStore";
import { useHeroStore } from "../../state/heroStore";
import { useMatchStore } from "../../state/matchStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { CurrencyBadge } from "../components/CurrencyBadge";

type Props = NativeStackScreenProps<RootStackParamList, "Lobby">;

export function LobbyScreen({ navigation }: Props) {
  const displayName = useAuthStore((state) => state.displayName);
  const playerId = useAuthStore((state) => state.playerId);
  const logout = useAuthStore((state) => state.logout);
  const gold = usePlayerStore((state) => state.gold);
  const trophies = usePlayerStore((state) => state.trophies);
  const gems = usePlayerStore((state) => state.gems);
  const refreshProfile = usePlayerStore((state) => state.refreshProfile);
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const fetchOwnedHeroes = useHeroStore((state) => state.fetchOwnedHeroes);
  const queueStatus = useMatchStore((state) => state.queueStatus);
  const queueError = useMatchStore((state) => state.queueError);
  const matchId = useMatchStore((state) => state.matchId);
  const findMatch = useMatchStore((state) => state.findMatch);
  const cancelQueue = useMatchStore((state) => state.cancelQueue);
  const bindSocket = useMatchStore((state) => state.bindSocket);

  useEffect(() => {
    if (playerId) {
      bindSocket(playerId);
    }
    void refreshProfile();
    void fetchOwnedHeroes();
  }, [playerId, bindSocket, refreshProfile, fetchOwnedHeroes]);

  useEffect(() => {
    if (queueStatus === "matched" && matchId) {
      navigation.navigate("Battle");
    }
  }, [queueStatus, matchId, navigation]);

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-white">{displayName ?? "Player"}</Text>
          <Text className="text-xs text-muted">
            {ownedHeroes.length} heroes · {trophies} trophies
          </Text>
        </View>
        <View className="flex-row gap-2">
          <CurrencyBadge amount={gold} />
          <View className="flex-row items-center gap-1 rounded-full bg-surface px-3 py-1.5">
            <Text className="font-semibold text-amber-300">{gems}✦</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 items-center justify-center gap-4">
        <Text className="mb-2 text-2xl font-bold text-white">Main Lobby</Text>
        {queueError ? <Text className="text-center text-sm text-red-400">{queueError}</Text> : null}
        {queueStatus === "queued" ? (
          <>
            <Text className="text-muted">Searching for opponent...</Text>
            <PrimaryButton label="Cancel Search" variant="secondary" onPress={() => void cancelQueue()} />
          </>
        ) : (
          <PrimaryButton
            label="Find Match"
            onPress={() => void findMatch()}
            disabled={ownedHeroes.length < 6}
          />
        )}
        <PrimaryButton label="Modes" onPress={() => navigation.navigate("Modes")} />
        <PrimaryButton label="Hero Collection" onPress={() => navigation.navigate("Collection")} />
        <PrimaryButton label="Formation Setup" onPress={() => navigation.navigate("Formation")} />
        <PrimaryButton label="Upgrade Heroes" onPress={() => navigation.navigate("Upgrade")} />
      </View>

      <View className="pb-2">
        <PrimaryButton
          label="Log Out"
          variant="secondary"
          onPress={() => {
            logout();
            navigation.replace("Login");
          }}
        />
      </View>
    </ScreenContainer>
  );
}
