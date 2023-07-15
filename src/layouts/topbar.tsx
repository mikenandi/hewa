import React from "react";
import { Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { Octicons } from "@expo/vector-icons";
import Colors from "../costants/Colors";

export const Topbar: React.FC = () => {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.logoText}>Hewa</Text>
        <Octicons
          name="dot-fill"
          size={20}
          color={Colors.secondary}
          style={styles.dotIcon}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 12,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.white,
  },
  dotIcon: {
    marginTop: 14,
    marginLeft: 2,
  },
});
