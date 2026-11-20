import React, { useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableRipple } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { type Place, searchPlacesReq } from "@/api/geocoding";
import { AppText } from "@/components";
import Colors from "@/costants/Colors";
import { Screen, Topbar } from "@/layouts";

export default function Search() {
  const { t, i18n } = useTranslation("search");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searchError, setSearchError] = useState("");
  const requestId = useRef(0);

  // Autocomplete: search as the user types (debounced).
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlacesReq(trimmed, i18n.language);
        if (id === requestId.current) setResults(places);
      } catch {
        if (id === requestId.current) setResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, i18n.language]);

  useEffect(() => {
    if (!searchError) return;
    const timer = setTimeout(() => setSearchError(""), 9000);
    return () => clearTimeout(timer);
  }, [searchError]);

  const openPlace = (place: Place) => {
    Keyboard.dismiss();
    router.push({
      pathname: "/city/[id]",
      params: {
        id: place.id,
        name: place.name,
        region: place.region ?? "",
        country: place.country ?? "",
        latitude: String(place.latitude),
        longitude: String(place.longitude),
      },
    });
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const places = results.length
        ? results
        : await searchPlacesReq(trimmed, i18n.language);
      if (places.length) openPlace(places[0]);
      else setSearchError(t("noResults", { query: trimmed }));
    } catch {
      setSearchError(t("error"));
    }
  };

  return (
    <Screen>
      <Topbar />

      <View style={styles.container}>
        <View style={styles.searchField}>
          <Ionicons name="search" size={20} color={Colors.white + "B3"} />
          <TextInput
            placeholder={t("placeholder")}
            placeholderTextColor={Colors.white + "80"}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            selectionColor={Colors.secondary}
          />
          {query ? (
            <TouchableRipple
              onPress={handleSearch}
              borderless
              style={styles.goButton}
            >
              <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            </TouchableRipple>
          ) : null}
        </View>

        {searchError ? (
          <AppText
            variant="body"
            color={Colors.secondary}
            style={styles.errorText}
          >
            {t("oops", { message: searchError })}
          </AppText>
        ) : null}

        <FlatList
          data={results}
          keyExtractor={(place) => place.id}
          keyboardShouldPersistTaps="handled"
          style={styles.results}
          contentContainerStyle={
            results.length ? styles.resultsCard : undefined
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableRipple
              onPress={() => openPlace(item)}
              rippleColor={Colors.tertiary}
              style={styles.resultRow}
            >
              <View style={styles.resultContent}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={Colors.secondary}
                />
                <View style={styles.resultText}>
                  <AppText variant="bodyBold">{item.name}</AppText>
                  <AppText variant="caption" color={Colors.white + "B3"}>
                    {[item.region, item.country].filter(Boolean).join(", ")}
                  </AppText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.white + "66"}
                />
              </View>
            </TouchableRipple>
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingLeft: 16,
    paddingRight: 6,
    borderRadius: 26,
    backgroundColor: Colors.white + "1A",
    borderColor: Colors.white + "26",
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 17,
    fontFamily: "DMSansMedium",
  },
  goButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary,
  },
  errorText: {
    textAlign: "center",
    marginTop: 16,
  },
  results: {
    marginTop: 16,
  },
  resultsCard: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: Colors.white + "14",
    borderColor: Colors.white + "1F",
    borderWidth: StyleSheet.hairlineWidth,
  },
  resultRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resultContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultText: { flex: 1 },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
    backgroundColor: Colors.white + "26",
  },
});
