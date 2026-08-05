import { useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);

  const handleLogin = async () => {
    await login(username, password);
    navigation.replace("Lobby");
  };

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center gap-6 px-2">
        <View className="items-center gap-1">
          <Text className="text-3xl font-bold text-white">Battle Formation</Text>
          <Text className="text-muted">Sign in to continue</Text>
        </View>

        <View className="w-full gap-4">
          <TextField label="Username" value={username} onChangeText={setUsername} placeholder="Player123" />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <View className="w-full">
          <PrimaryButton
            label="Log In"
            onPress={handleLogin}
            loading={status === "loading"}
            disabled={username.trim().length === 0}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
