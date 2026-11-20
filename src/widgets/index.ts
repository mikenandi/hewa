import { requireOptionalNativeModule } from "expo";
import type { WeatherWidgetProps } from "./types";

// expo-widgets needs a development/production build. In Expo Go (or on web)
// the native module is missing, so check first and skip loading the widget
// module entirely — loading it would throw while evaluating.
const widgetsAvailable = requireOptionalNativeModule("ExpoWidgets") != null;

export const updateWeatherWidget = (props: WeatherWidgetProps) => {
  if (!widgetsAvailable) return;
  try {
    const widget = require("./weather-widget").default;
    widget?.updateSnapshot(props);
  } catch {
    // Widget runtime not available in this build.
  }
};
