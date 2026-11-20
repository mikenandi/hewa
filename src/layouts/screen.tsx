import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface ScreenProps {
  children?: ReactNode;
}

export const GRADIENT = ["#005C97", "#363795"] as const;

export const Screen: React.FC<ScreenProps> = (props) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={GRADIENT} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {props.children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
