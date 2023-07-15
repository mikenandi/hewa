import React, { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";
import { Path, Svg } from "react-native-svg";

interface ScreenProps {
  children?: ReactNode;
}

export const BottomSvg: React.FC<ScreenProps> = (props) => {
  return (
    <>
      <Svg
        height="55%"
        width="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={styles.downwardSemiCircle}
      >
        <Path d="M0 0 V 50 Q 20 45 50 52 T 100 50 V 0 H 0 Z" fill="#005C97" />
      </Svg>
    </>
  );
};

const styles = StyleSheet.create({
  downwardSemiCircle: {
    position: "absolute",
    bottom: 0,
    flex: 1,
    transform: [{ rotate: "180deg" }],
  },
});
