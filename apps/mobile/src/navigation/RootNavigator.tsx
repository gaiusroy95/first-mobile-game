import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../ui/screens/LoginScreen";
import { LobbyScreen } from "../ui/screens/LobbyScreen";
import { CollectionScreen } from "../ui/screens/CollectionScreen";
import { FormationScreen } from "../ui/screens/FormationScreen";
import { BattleScreen } from "../ui/screens/BattleScreen";
import { VictoryScreen } from "../ui/screens/VictoryScreen";
import { UpgradeScreen } from "../ui/screens/UpgradeScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="Formation" component={FormationScreen} />
      <Stack.Screen name="Battle" component={BattleScreen} />
      <Stack.Screen name="Victory" component={VictoryScreen} />
      <Stack.Screen name="Upgrade" component={UpgradeScreen} />
    </Stack.Navigator>
  );
}
