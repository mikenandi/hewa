import Colors from "../../costants/Colors";
import type { InsightSeverity } from "../../utils/insights";

export const SEVERITY_COLORS: Record<InsightSeverity, string> = {
  warning: "#FF6B5E",
  tip: Colors.secondary,
  info: "#4CD964",
};
