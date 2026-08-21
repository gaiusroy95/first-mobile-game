import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "../ui/screens/SplashScreen";
import { LoginScreen } from "../ui/screens/LoginScreen";
import { LobbyScreen } from "../ui/screens/LobbyScreen";
import { ModesScreen } from "../ui/screens/ModesScreen";
import { CollectionScreen } from "../ui/screens/CollectionScreen";
import { FormationScreen } from "../ui/screens/FormationScreen";
import { BattleScreen } from "../ui/screens/BattleScreen";
import { VictoryScreen } from "../ui/screens/VictoryScreen";
import { UpgradeScreen } from "../ui/screens/UpgradeScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} />
      <Stack.Screen name="Modes" component={ModesScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="Formation" component={FormationScreen} />
      <Stack.Screen name="Battle" component={BattleScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Victory" component={VictoryScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Upgrade" component={UpgradeScreen} />
    </Stack.Navigator>
  );
}
