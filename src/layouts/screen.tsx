import React, { ReactNode } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BottomSvg } from "../components/bottom-svg";

interface ScreenProps {
  children?: ReactNode;
}

export const Screen: React.FC<ScreenProps> = (props) => {
  return (
    <>
      <StatusBar backgroundColor="#005C97" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#005C97", "#363795"]}
          style={styles.linearGradient}
        >
          <View style={styles.weatherDetailsContainer}>{props.children}</View>
          <BottomSvg />
        </LinearGradient>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
  },
  weatherDetailsContainer: {
    flex: 1,
    // justifyContent: "flex-end", // Align children at the bottom
  },
});
