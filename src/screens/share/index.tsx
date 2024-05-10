import { StyleSheet, Text, View, Image } from "react-native";
import { Screen } from "../../layouts/screen";
import { Topbar } from "../../layouts/topbar";
import Colors from "../../costants/Colors";
import * as Linking from "expo-linking";

export const Share: React.FC = () => {
  function handleOpenEmail() {
    const subject = "suggestions to improve hewa app.";
    Linking.openURL(`mailto:michaelnandi05@gmail.com?Subject=${subject}`);
  }

  return (
    <>
      <Screen>
        <Topbar />

        <View style={styles.container}>
          <Image
            source={require("../../../assets/trees.png")}
            style={styles.topImg}
          />
          <Text style={styles.titleText} onPress={handleOpenEmail}>
            🚀 Share Your Ideas! 🚀
          </Text>

          <Text style={styles.descriptionText}>
            Got suggestions to improve our app? We're all ears! Send us your
            ideas via email at{" "}
            <Text style={styles.emailText} onPress={handleOpenEmail}>
              michaelnandi05@gmail.com
            </Text>{" "}
            and let's make our app even better together!
          </Text>
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: "center",
    // justifyContent: "center",
  },
  topImg: {
    width: 200,
    height: undefined,
    aspectRatio: 1 / 1,
  },
  titleText: {
    color: Colors.secondary,
    fontFamily: "PoppinsMedium",
    fontSize: 20,
  },
  descriptionText: {
    color: Colors.white,
    fontFamily: "DMSansMedium",
    marginHorizontal: 16,
    fontSize: 14,
  },
  emailText: {
    color: Colors.secondary,
    fontFamily: "DMSansBold",
  },
});
