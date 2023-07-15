import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../layouts/screen";
import { Topbar } from "../../layouts/topbar";

export const Share: React.FC = () => {
  return (
    <>
      <Screen>
        <Topbar />
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
