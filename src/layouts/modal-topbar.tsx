import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Octicons, Ionicons } from "@expo/vector-icons";
import Colors from "../costants/Colors";
import { TouchableRipple } from "react-native-paper";

interface ModalTopbarProps {
  onPress?: () => void;
}

export const ModalTopbar: React.FC<ModalTopbarProps> = (props) => {
  return (
    <>
      <View style={styles.container}>
        <TouchableRipple
          onPress={props.onPress}
          rippleColor={Colors.tertiary}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={30}
            color={Colors.white}
            style={styles.arrowIcon}
          />
        </TouchableRipple>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Hewa</Text>
          <Octicons
            name="dot-fill"
            size={20}
            color={Colors.secondary}
            style={{
              ...styles.dotIcon,
            }}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "60%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 12,
    paddingLeft: 20,
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
  },
  arrowIcon: {
    borderRadius: 20,
  },
});
