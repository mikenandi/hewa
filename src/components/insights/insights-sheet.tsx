import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { TouchableRipple } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { Place } from "../../api/geocoding";
import Colors from "../../costants/Colors";
import { GRADIENT } from "../../layouts/screen";
import type { RootState } from "../../redux/redux";
import { insightsFor } from "../../services/insights";
import { speak, stopSpeaking } from "../../services/speech";
import type { WeatherBundle } from "../../services/weather";
import {
  type InsightCategory,
  buildDayPlan,
  pickFact,
} from "../../utils/insights";
import { AppText } from "../app-text";
import { OptionChips } from "../option-chips";
import { DayPlanner } from "./day-planner";
import { FactCard } from "./fact-card";
import { InsightCard } from "./insight-card";
import { TopInsights } from "./top-insights";
import { useInsightText } from "./use-insight-text";

type Filter = "all" | InsightCategory;

interface InsightsSheetProps {
  visible: boolean;
  onClose: () => void;
  place: Place;
  bundle: WeatherBundle;
}

// Weather insights (Maarifa) in a bottom sheet: top warnings, day planner,
// all insights by category, and a "did you know" fact.
export const InsightsSheet: React.FC<InsightsSheetProps> = ({
  visible,
  onClose,
  place,
  bundle,
}) => {
  const { t, i18n } = useTranslation("insights");
  const settings = useSelector((state: RootState) => state.settings);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheetHeight = height * 0.9;
  const insightText = useInsightText();

  const [mounted, setMounted] = useState(visible);
  const [filter, setFilter] = useState<Filter>("all");
  const [speaking, setSpeaking] = useState(false);
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const result = useMemo(
    () => (visible || mounted ? insightsFor(place, bundle, settings) : null),
    [visible, mounted, place, bundle, settings],
  );

  // Slide in / out.
  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      stopSpeaking();
      setSpeaking(false);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Drag the handle down to close.
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => translateY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.8) onClose();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
      },
    }),
  ).current;

  if (!mounted || !result) return null;

  const { insights, mosquito } = result;
  const top = insights.filter((i) => i.severity !== "info").slice(0, 3);
  const listed =
    filter === "all" ? insights : insights.filter((i) => i.category === filter);

  const handleListen = async () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const text = [
      place.name,
      ...insights.slice(0, 5).map((insight) => {
        const copy = insightText(insight, "words");
        return `${copy.title}. ${copy.message}`;
      }),
    ].join(". ");
    const status = await speak(text, i18n.language, () => setSpeaking(false));
    if (status === "noVoice")
      Alert.alert(t("home:speech.noVoiceTitle"), t("home:speech.noVoice"));
    else setSpeaking(true);
  };

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { height: sheetHeight, transform: [{ translateY }] },
        ]}
      >
        <LinearGradient colors={GRADIENT} style={StyleSheet.absoluteFill} />

        <View {...pan.panHandlers}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <AppText style={styles.title}>{t("tabTitle")}</AppText>
              <AppText variant="caption" color={Colors.white + "B3"}>
                {place.name} · {t("subtitle")}
              </AppText>
            </View>
            {insights.length ? (
              <TouchableRipple
                onPress={handleListen}
                borderless
                style={styles.roundButton}
                accessibilityLabel={speaking ? t("stop") : t("listen")}
              >
                <MaterialCommunityIcons
                  name={speaking ? "stop-circle-outline" : "volume-high"}
                  size={22}
                  color={Colors.primary}
                />
              </TouchableRipple>
            ) : null}
            <TouchableRipple
              onPress={onClose}
              borderless
              style={[styles.roundButton, styles.closeButton]}
              accessibilityLabel={t("common:back")}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={Colors.white}
              />
            </TouchableRipple>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <TopInsights insights={top} />
          <DayPlanner plan={buildDayPlan(bundle.forecast, mosquito)} />

          <AppText
            variant="caption"
            color={Colors.white + "B3"}
            style={styles.sectionHeading}
          >
            {t("all").toUpperCase()}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            <OptionChips<Filter>
              options={(
                ["all", "health", "home", "travel", "farm"] as Filter[]
              ).map((value) => ({
                value,
                label: t(`categories.${value}`),
              }))}
              value={filter}
              onChange={setFilter}
            />
          </ScrollView>

          {listed.length ? (
            listed.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <AppText variant="body" style={styles.empty}>
              {t("empty")}
            </AppText>
          )}

          <FactCard factKey={pickFact(bundle.forecast, mosquito)} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000A6",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.white + "33",
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.white + "66",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerText: { flex: 1 },
  title: { fontFamily: "DMSansBold", fontSize: 26 },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  closeButton: { backgroundColor: Colors.white + "1F" },
  sectionHeading: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  filters: { paddingHorizontal: 16, paddingBottom: 12 },
  empty: { textAlign: "center", marginHorizontal: 32, marginVertical: 24 },
});
