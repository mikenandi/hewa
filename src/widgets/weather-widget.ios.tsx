import { Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget } from "expo-widgets";
import type { WeatherWidgetProps } from "./types";

// Runs in the isolated widget runtime: no hooks, no module-scope constants.
const WeatherWidget = (props: WeatherWidgetProps) => {
  "widget";
  return (
    <VStack
      alignment="leading"
      spacing={2}
      modifiers={[containerBackground("#224496", "widget")]}
    >
      <Text
        modifiers={[
          font({ size: 14, weight: "semibold" }),
          foregroundStyle("#FFFFFF"),
        ]}
      >
        {props.place}
      </Text>
      <Text
        modifiers={[
          font({ size: 42, weight: "bold" }),
          foregroundStyle("#FFFFFF"),
        ]}
      >
        {props.temperature}
      </Text>
      <Text
        modifiers={[
          font({ size: 14, weight: "semibold" }),
          foregroundStyle("#FFB200"),
        ]}
      >
        {props.condition}
      </Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle("#F2F2F2")]}>
        {props.highLow}
      </Text>
    </VStack>
  );
};

export default createWidget("HewaWeather", WeatherWidget, {
  place: "Hewa",
  temperature: "--°",
  condition: "",
  highLow: "",
});
