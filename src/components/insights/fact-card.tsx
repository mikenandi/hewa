import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Colors from "../../costants/Colors";
import { AppText } from "../app-text";

export const FactCard: React.FC<{ factKey: string }> = ({ factKey }) => {
  const { t } = useTranslation("insights");
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons
        name="lightbulb-on-outline"
        size={26}
        color={Colors.primary}
      />
      <View style={styles.body}>
        <AppText variant="bodyBold" color={Colors.primary}>
          {t("didYouKnow")}
        </AppText>
        <AppText variant="body" color={Colors.primary}>
          {t(`facts.${factKey}`)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
  },
  body: { flex: 1, gap: 4 },
});
