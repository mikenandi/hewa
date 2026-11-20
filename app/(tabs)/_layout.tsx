import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import Colors from "@/costants/Colors";
import { GRADIENT } from "@/layouts/screen";

const TAB_ICON_SIZE = 28;
const TAB_BAR_RADIUS = 24;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarInactiveTintColor: Colors.white + "99",
        tabBarActiveTintColor: Colors.secondary,
        tabBarStyle: {
          // Matches the bottom of the screen gradient so the bar blends in.
          backgroundColor: GRADIENT[1],
          borderTopLeftRadius: TAB_BAR_RADIUS,
          borderTopRightRadius: TAB_BAR_RADIUS,
          // A hairline outline that follows the curved top edge.
          borderTopWidth: StyleSheet.hairlineWidth,
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderRightWidth: StyleSheet.hairlineWidth,
          borderColor: Colors.white + "26",
          borderTopColor: Colors.white + "26",
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="home-filled"
              size={TAB_ICON_SIZE}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => (
            <Entypo
              name="magnifying-glass"
              size={TAB_ICON_SIZE}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="settings"
              size={TAB_ICON_SIZE}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
