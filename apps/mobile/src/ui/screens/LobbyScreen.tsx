import { useEffect } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { usePlayerStore } from "../../state/playerStore";
import { useHeroStore } from "../../state/heroStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { CurrencyBadge } from "../components/CurrencyBadge";

type Props = NativeStackScreenProps<RootStackParamList, "Lobby">;

export function LobbyScreen({ navigation }: Props) {
  const displayName = useAuthStore((state) => state.displayName);
  const logout = useAuthStore((state) => state.logout);
  const gold = usePlayerStore((state) => state.gold);
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const fetchOwnedHeroes = useHeroStore((state) => state.fetchOwnedHeroes);

  useEffect(() => {
    if (ownedHeroes.length === 0) {
      fetchOwnedHeroes();
    }
  }, [ownedHeroes.length, fetchOwnedHeroes]);

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-white">{displayName ?? "Player"}</Text>
          <Text className="text-xs text-muted">{ownedHeroes.length} heroes owned</Text>
        </View>
        <CurrencyBadge amount={gold} />
      </View>

      <View className="flex-1 items-center justify-center gap-4">
        <Text className="mb-4 text-2xl font-bold text-white">Main Lobby</Text>
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
