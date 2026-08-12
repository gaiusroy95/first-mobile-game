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
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  const handleSubmit = async () => {
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password, displayName.trim() || username.trim());
      }
      navigation.replace("Lobby");
    } catch {
      /* error shown from store */
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center gap-6 px-2">
        <View className="items-center gap-1">
          <Text className="text-3xl font-bold text-white">Battle Formation</Text>
          <Text className="text-muted">{mode === "login" ? "Sign in to continue" : "Create an account"}</Text>
        </View>

        <View className="w-full gap-4">
          <TextField label="Username" value={username} onChangeText={setUsername} placeholder="Player123" />
          {mode === "register" && (
            <TextField
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Commander"
            />
          )}
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        {error ? <Text className="text-center text-sm text-red-400">{error}</Text> : null}

        <View className="w-full gap-3">
          <PrimaryButton
            label={mode === "login" ? "Log In" : "Register"}
            onPress={handleSubmit}
            loading={status === "loading"}
            disabled={username.trim().length === 0 || password.length === 0}
          />
          <PrimaryButton
            label={mode === "login" ? "Need an account? Register" : "Have an account? Log In"}
            variant="secondary"
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
