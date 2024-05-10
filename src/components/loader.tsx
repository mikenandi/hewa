import { StyleSheet, View, Image } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Screen } from "../layouts/screen";
import Colors from "../costants/Colors";

export const Loader: React.FC = () => {
  return (
    <>
      <Screen>
        <View style={styles.container}>
          {/* <ActivityIndicator
            animating={true}
            color={Colors.secondary}
            size={36}
          /> */}

          <Image
            source={require("../../assets/weather-loading-2.gif")}
            // tintColor={Colors.secondary}
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              overlayColor: Colors.primary,
            }}
          />
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
