import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../../costants/Colors";
import { AppText } from "../app-text";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface SectionCardProps {
  title?: string;
  /** Inset for the title row when the card itself has no horizontal padding. */
  titleInset?: number;
  icon?: IconName;
  children: ReactNode;
  style?: ViewStyle;
}

// Frosted "glass" card used for every section below the hero.
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  titleInset = 0,
  icon,
  children,
  style,
}) => (
  <View style={[styles.card, style]}>
    {title ? (
      <View style={[styles.titleRow, { marginHorizontal: titleInset }]}>
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={16}
            color={Colors.white + "B3"}
          />
        ) : null}
        <AppText
          variant="caption"
          color={Colors.white + "B3"}
          style={styles.title}
        >
          {title.toUpperCase()}
        </AppText>
      </View>
    ) : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white + "14",
    borderColor: Colors.white + "1F",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.white + "26",
  },
  title: { letterSpacing: 0.8 },
});
