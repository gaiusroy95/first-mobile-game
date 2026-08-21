import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { mainMenuArt } from "../main-menu/art";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const DISPLAY_MS = 5000;
const FADE_MS = 600;

export function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }),
      Animated.delay(DISPLAY_MS - FADE_MS * 2),
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }),
    ]);
    sequence.start(({ finished }) => {
      if (finished) {
        navigation.replace("Login");
      }
    });
    return () => sequence.stop();
  }, [navigation, opacity]);

  return (
    <View style={styles.root}>
      <Animated.Image
        source={mainMenuArt.full}
        style={[StyleSheet.absoluteFill, { opacity }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#05070a",
  },
});
