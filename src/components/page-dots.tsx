import React from "react";
import { StyleSheet, View } from "react-native";
import Colors from "../costants/Colors";

export const PageDots: React.FC<{ count: number; index: number }> = ({
  count,
  index,
}) => {
  if (count < 2) return null;
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i === index ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  active: { backgroundColor: Colors.secondary },
  inactive: { backgroundColor: Colors.white + "50" },
});
