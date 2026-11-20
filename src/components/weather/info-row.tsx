import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../../costants/Colors";
import { AppText } from "../app-text";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface InfoRowProps {
  icon: IconName;
  iconColor?: string;
  label?: string;
  text: string;
  detail?: string;
  right?: ReactNode;
}

// One line of advice inside a card: icon, small label, main text, optional detail.
export const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  iconColor = Colors.secondary,
  label,
  text,
  detail,
  right,
}) => (
  <View style={styles.row}>
    <View style={[styles.iconBox, { backgroundColor: iconColor + "26" }]}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.body}>
      {label ? (
        <AppText variant="caption" color={Colors.white + "B3"}>
          {label}
        </AppText>
      ) : null}
      <AppText variant="bodyBold">{text}</AppText>
      {detail ? (
        <AppText
          variant="caption"
          color={Colors.white + "B3"}
          style={styles.detail}
        >
          {detail}
        </AppText>
      ) : null}
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 6,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  detail: { marginTop: 2 },
});

export const LEVEL_COLORS = {
  good: "#4CD964",
  caution: Colors.secondary,
  bad: "#FF6B5E",
};
