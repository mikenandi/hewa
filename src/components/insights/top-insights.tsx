import React, { useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Colors from "../../costants/Colors";
import type { Insight } from "../../utils/insights";
import { AppText } from "../app-text";
import { PageDots } from "../page-dots";
import { SEVERITY_COLORS } from "./severity";
import { useInsightText } from "./use-insight-text";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Swipeable "story" cards for the day's most important insights.
export const TopInsights: React.FC<{ insights: Insight[] }> = ({
  insights,
}) => {
  const { t } = useTranslation("insights");
  const { width } = useWindowDimensions();
  const text = useInsightText();
  const [index, setIndex] = useState(0);
  const cardWidth = width - 32;
  if (insights.length === 0) return null;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(event.nativeEvent.contentOffset.x / (cardWidth + 12)));

  return (
    <View style={styles.container}>
      <AppText
        variant="caption"
        color={Colors.white + "B3"}
        style={styles.heading}
      >
        {t("topToday").toUpperCase()}
      </AppText>
      <FlatList
        data={insights}
        horizontal
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(insight) => insight.id}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => {
          const color = SEVERITY_COLORS[item.severity];
          const copy = text(item);
          return (
            <View
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: color + "26",
                  borderColor: color + "66",
                },
              ]}
            >
              <View style={[styles.bigIcon, { backgroundColor: color }]}>
                <MaterialCommunityIcons
                  name={item.icon as IconName}
                  size={34}
                  color={Colors.primary}
                />
              </View>
              <AppText variant="caption" color={color} style={styles.severity}>
                {t(`severity.${item.severity}`).toUpperCase()}
              </AppText>
              <AppText style={styles.title}>{copy.title}</AppText>
              <AppText
                variant="body"
                color={Colors.white + "E6"}
                style={styles.message}
              >
                {copy.message}
              </AppText>
            </View>
          );
        }}
      />
      <View style={styles.dots}>
        <PageDots count={insights.length} index={index} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  heading: { marginHorizontal: 16, marginBottom: 8, letterSpacing: 0.8 },
  list: { paddingHorizontal: 16, gap: 12 },
  card: { borderRadius: 26, borderWidth: 1, padding: 20, minHeight: 210 },
  bigIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  severity: { marginTop: 14, letterSpacing: 0.8 },
  title: {
    fontFamily: "DMSansBold",
    fontSize: 21,
    lineHeight: 27,
    marginTop: 4,
  },
  message: { marginTop: 6, fontSize: 15, lineHeight: 21 },
  dots: { marginTop: 10 },
});
