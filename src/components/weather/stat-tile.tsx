import React from "react";
import { StyleSheet, View } from "react-native";
import Colors from "../../costants/Colors";
import { AppText } from "../app-text";

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, hint }) => (
  <View style={styles.tile}>
    <AppText variant="caption" color={Colors.white + "B3"}>
      {label}
    </AppText>
    <AppText variant="value" style={styles.value}>
      {value}
    </AppText>
    {hint ? (
      <AppText variant="caption" color={Colors.secondary}>
        {hint}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.white + "10",
    borderRadius: 16,
    padding: 12,
  },
  value: { marginVertical: 2 },
});
