import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { PrimaryButton } from "../components/PrimaryButton";
import { HowToPlay } from "../components/HowToPlay";

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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 mt-2">
          <Text className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Online auto-battler
          </Text>
          <Text className="mt-2 text-4xl font-bold tracking-tight text-ink">Battle Formation</Text>
          <Text className="mt-3 text-base leading-6 text-muted">
            Outsmart another player in under two minutes. Build a team of six, place them on the
            field, then let them fight — positioning is everything.
          </Text>
        </View>

        <HowToPlay compact />

        <View className="mt-6 gap-4">
          <Text className="text-sm font-semibold text-ink">
            {mode === "login" ? "Sign in to battle" : "Create your commander"}
          </Text>
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
          {error ? <Text className="text-center text-sm text-danger">{error}</Text> : null}
          <PrimaryButton
            label={mode === "login" ? "Enter the arena" : "Create account"}
            onPress={handleSubmit}
            loading={status === "loading"}
            disabled={username.trim().length === 0 || password.length === 0}
          />
          <PrimaryButton
            label={mode === "login" ? "New here? Register" : "Already registered? Sign in"}
            variant="ghost"
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
