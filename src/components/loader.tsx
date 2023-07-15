import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Screen } from "../layouts/screen";
import Colors from "../costants/Colors";

export const Loader: React.FC = () => {
  return (
    <>
      <Screen>
        <View style={styles.container}>
          <ActivityIndicator
            animating={true}
            color={Colors.secondary}
            size={36}
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
