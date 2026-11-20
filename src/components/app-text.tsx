import React from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import Colors from "../costants/Colors";

type Variant =
  "sectionTitle" | "body" | "bodyBold" | "caption" | "value" | "valueLarge";

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  style?: TextStyle | TextStyle[];
}

// Text styles for the forecast sections, built only from the app's existing
// fonts (DMSans for labels, Lato for numbers) and colors.
export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color = Colors.white,
  style,
  ...rest
}) => (
  <Text
    allowFontScaling={false}
    style={[styles[variant], { color }, style]}
    {...rest}
  />
);

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: "DMSansBold", fontSize: 16 },
  body: { fontFamily: "DMSansMedium", fontSize: 14, lineHeight: 20 },
  bodyBold: { fontFamily: "DMSansBold", fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: "DMSansMedium", fontSize: 12 },
  value: { fontFamily: "LatoBold", fontSize: 22 },
  valueLarge: { fontFamily: "LatoBold", fontSize: 34 },
});
