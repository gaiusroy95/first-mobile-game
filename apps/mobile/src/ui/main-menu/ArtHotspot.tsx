import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { ART_H, ART_W, type HotspotBox } from "./art";

interface Props {
  box: HotspotBox;
  label: string;
  onPress: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Invisible tap target mapped onto the 1536×1024 client mock. */
export function ArtHotspot({ box, label, onPress, selected, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        {
          position: "absolute",
          left: `${(box.x / ART_W) * 100}%`,
          top: `${(box.y / ART_H) * 100}%`,
          width: `${(box.w / ART_W) * 100}%`,
          height: `${(box.h / ART_H) * 100}%`,
          borderWidth: selected ? 2 : 0,
          borderColor: "#e0b35a",
        },
        style,
      ]}
    />
  );
}
