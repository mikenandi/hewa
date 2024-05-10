import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  MaterialIcons,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Home } from "../screens/home";
import { Search } from "../screens/search";
import { Share } from "../screens/share";
import { NavigationContainer } from "@react-navigation/native";
import Colors from "../costants/Colors";
import * as Font from "expo-font";
import { APP_FONTS } from "../costants/app-fonts";
import { Loader } from "../components";

const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 32;

export const Navigation: React.FC = () => {
  const [loading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync(APP_FONTS);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <>
        <Loader />
      </>
    );

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            tabBarInactiveTintColor: Colors.white,
            tabBarActiveTintColor: "#FFA500",
            headerShown: false,
            tabBarActiveBackgroundColor: Colors.primary,
            tabBarInactiveBackgroundColor: Colors.primary,
            tabBarLabelStyle: {
              //   fontWeight: "bold",
            },
            tabBarStyle: { borderTopWidth: 0 },
          }}
        >
          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              tabBarLabel: "",
              title: "",
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="home" size={TAB_ICON_SIZE} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Search"
            component={Search}
            options={{
              tabBarLabel: "",
              title: "",
              tabBarIcon: ({ color, size }) => (
                <Entypo
                  name="magnifying-glass"
                  size={TAB_ICON_SIZE}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={Share}
            options={{
              title: "",
              tabBarLabel: "",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="reply-outline"
                  size={TAB_ICON_SIZE}
                  color={color}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};
