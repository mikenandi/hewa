import React, { ReactNode } from "react";
import { View, StyleSheet, Text } from "react-native";
import Colors from "../costants/Colors";

interface WeatherDetailProps {
  children: ReactNode;
  detailName: string;
  detailValue: string;
}

export const WeatherDetail: React.FC<WeatherDetailProps> = (props) => {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          {props.children}
          <Text style={styles.labelText}>{props.detailName}</Text>
        </View>

        <Text style={styles.labelText}>{props.detailValue}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  labelText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 19.44,
    color: Colors.white,
  },
});
