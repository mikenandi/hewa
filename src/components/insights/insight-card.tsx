import React, { useState } from "react";
import { LayoutAnimation, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TouchableRipple } from "react-native-paper";
import Colors from "../../costants/Colors";
import type { Insight } from "../../utils/insights";
import { AppText } from "../app-text";
import { SEVERITY_COLORS } from "./severity";
import { useInsightText } from "./use-insight-text";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Tap to reveal "why" — the data behind the advice.
export const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const { t } = useTranslation("insights");
  const text = useInsightText()(insight);
  const [open, setOpen] = useState(false);
  const color = SEVERITY_COLORS[insight.severity];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((value) => !value);
  };

  return (
    <TouchableRipple
      onPress={toggle}
      borderless
      style={styles.card}
      rippleColor={Colors.tertiary}
    >
      <View>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: color + "26" }]}>
            <MaterialCommunityIcons
              name={insight.icon as IconName}
              size={22}
              color={color}
            />
          </View>
          <View style={styles.body}>
            <AppText variant="caption" color={color}>
              {t(`severity.${insight.severity}`).toUpperCase()}
            </AppText>
            <AppText variant="bodyBold" style={styles.title}>
              {text.title}
            </AppText>
            <AppText variant="body" color={Colors.white + "D9"}>
              {text.message}
            </AppText>
          </View>
        </View>
        <View style={styles.whyRow}>
          <AppText variant="caption" color={Colors.secondary}>
            {open ? t("hideWhy") : t("why")}
          </AppText>
          <MaterialCommunityIcons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.secondary}
          />
        </View>
        {open ? (
          <AppText
            variant="caption"
            color={Colors.white + "B3"}
            style={styles.why}
          >
            {text.why}
          </AppText>
        ) : null}
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: Colors.white + "14",
    borderColor: Colors.white + "1F",
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: "row", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 15 },
  whyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  why: { marginTop: 6, lineHeight: 18 },
});
