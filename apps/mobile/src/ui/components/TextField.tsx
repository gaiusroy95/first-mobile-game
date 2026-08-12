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
      <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
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
        className="rounded-2xl border border-border bg-surface-raised px-4 py-3.5 text-ink"
      />
    </View>
  );
}
