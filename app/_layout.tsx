// i18n first: it installs the localStorage polyfill the Redux store reads on import.
import "@/i18n";
import "@/tasks/weather-task";
import { useFonts } from "expo-font";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import { APP_FONTS } from "@/costants/app-fonts";
import { GRADIENT } from "@/layouts/screen";
import { store } from "@/redux/redux";
import { registerWeatherTask } from "@/tasks/weather-task";

LogBox.ignoreAllLogs();

SplashScreen.preventAutoHideAsync();

// Navigator background matches the bottom of the gradient, so the tab bar's
// rounded top corners blend into the screen instead of showing white.
const NAVIGATION_THEME = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: GRADIENT[1] },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    registerWeatherTask();
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <PaperProvider>
      <ReduxProvider store={store}>
        <ThemeProvider value={NAVIGATION_THEME}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="city/[id]"
              options={{ animation: "slide_from_right" }}
            />
          </Stack>
        </ThemeProvider>
      </ReduxProvider>
    </PaperProvider>
  );
}
