import { Text, TextInput, View, type TextInputProps } from "react-native";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "none",
}: TextFieldProps) {
  return (
    <View className="w-full">
      <Text className="mb-1.5 font-heading text-[10px] uppercase tracking-[0.16em] text-accent/80">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7a70"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="rounded-2xl border border-accent/30 bg-surface-raised/90 px-4 py-3.5 text-ink"
      />
    </View>
  );
}
