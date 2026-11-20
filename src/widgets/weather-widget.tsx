import type { WeatherWidgetProps } from "./types";

// Web / type-checking fallback. Native builds resolve weather-widget.android.tsx
// and weather-widget.ios.tsx instead.
const WeatherWidget: {
  updateSnapshot: (props: WeatherWidgetProps) => void;
} | null = null;

export default WeatherWidget;
