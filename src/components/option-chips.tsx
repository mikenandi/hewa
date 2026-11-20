import React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableRipple } from "react-native-paper";
import Colors from "../costants/Colors";
import { AppText } from "./app-text";

interface OptionChipsProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function OptionChips<T extends string | number>({
  options,
  value,
  onChange,
}: OptionChipsProps<T>) {
  const getBackgroundColor = (selected: boolean) =>
    selected ? Colors.secondary : Colors.white + "14";
  const getTextColor = (selected: boolean) =>
    selected ? Colors.primary : Colors.white;

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableRipple
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            rippleColor={Colors.tertiary}
            borderless
            style={[
              styles.chip,
              { backgroundColor: getBackgroundColor(selected) },
            ]}
          >
            <AppText variant="bodyBold" color={getTextColor(selected)}>
              {option.label}
            </AppText>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
});
