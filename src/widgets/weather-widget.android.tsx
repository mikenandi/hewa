import { Column, Text } from "@expo/ui/jetpack-compose";
import {
  background,
  cornerRadius,
  fillMaxSize,
  paddingAll,
} from "@expo/ui/jetpack-compose/modifiers";
import { createWidget } from "expo-widgets";
import type { WeatherWidgetProps } from "./types";

// Runs in the isolated widget runtime: no hooks, no module-scope constants.
const WeatherWidget = (props: WeatherWidgetProps) => {
  "widget";
  return (
    <Column
      modifiers={[
        fillMaxSize(),
        cornerRadius(20),
        background("#224496"),
        paddingAll(16),
      ]}
    >
      <Text color="#FFFFFF" style={{ fontSize: 14, fontWeight: "600" }}>
        {props.place}
      </Text>
      <Text color="#FFFFFF" style={{ fontSize: 42, fontWeight: "bold" }}>
        {props.temperature}
      </Text>
      <Text color="#FFB200" style={{ fontSize: 14, fontWeight: "600" }}>
        {props.condition}
      </Text>
      <Text color="#F2F2F2" style={{ fontSize: 12 }}>
        {props.highLow}
      </Text>
    </Column>
  );
};

export default createWidget("HewaWeather", WeatherWidget, {
  place: "Hewa",
  temperature: "--°",
  condition: "",
  highLow: "",
});
