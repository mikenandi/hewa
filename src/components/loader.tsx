import { StyleSheet, View, Image } from "react-native";
import { Screen } from "../layouts/screen";
import Colors from "../costants/Colors";

// The animated GIF on its own, for use inside an existing screen.
export const LoadingGif: React.FC = () => (
  <View style={styles.container}>
    <Image
      source={require("../../assets/weather-loading-2.gif")}
      style={{
        width: 100,
        height: 100,
        borderRadius: 20,
        overlayColor: Colors.primary,
      }}
    />
  </View>
);

export const Loader: React.FC = () => {
  return (
    <>
      <Screen>
        <LoadingGif />
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
