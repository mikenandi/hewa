import React from "react";
import { Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import Colors from "../../costants/Colors";
import type { RootState } from "../../redux/redux";
import { getCondition } from "../../utils/weather-codes";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Built-in icons used in low-data mode (no image downloads).
const VECTOR: Record<string, [IconName, IconName]> = {
  "01": ["weather-sunny", "weather-night"],
  "02": ["weather-partly-cloudy", "weather-night-partly-cloudy"],
  "03": ["weather-partly-cloudy", "weather-night-partly-cloudy"],
  "04": ["weather-cloudy", "weather-cloudy"],
  "09": ["weather-pouring", "weather-pouring"],
  "10": ["weather-rainy", "weather-rainy"],
  "11": ["weather-lightning-rainy", "weather-lightning-rainy"],
  "13": ["weather-snowy", "weather-snowy"],
  "50": ["weather-fog", "weather-fog"],
};

interface WeatherIconProps {
  code: number;
  isDay: boolean | number;
  size: number;
  large?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay,
  size,
  large,
}) => {
  const lowData = useSelector((state: RootState) => state.settings.lowData);
  const { icon } = getCondition(code);

  if (lowData) {
    const [day, night] = VECTOR[icon] ?? VECTOR["03"];
    return (
      <MaterialCommunityIcons
        name={isDay ? day : night}
        size={size * 0.7}
        color={icon === "01" && isDay ? Colors.secondary : Colors.white}
        style={{
          width: size,
          height: size,
          textAlign: "center",
          textAlignVertical: "center",
          lineHeight: size,
        }}
      />
    );
  }

  return (
    <Image
      source={{
        uri: `https://openweathermap.org/img/wn/${icon}${isDay ? "d" : "n"}@${large ? 4 : 2}x.png`,
      }}
      style={{ width: size, height: size }}
    />
  );
};
