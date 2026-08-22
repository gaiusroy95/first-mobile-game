import "./global.css";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  Cinzel_900Black,
} from "@expo-google-fonts/cinzel";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Cinzel_900Black,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#0b1210" }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
