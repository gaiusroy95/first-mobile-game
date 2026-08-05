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
      <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="rounded-lg border border-slate-600 bg-surface px-4 py-3 text-white"
      />
    </View>
  );
}
