import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  useWindowDimensions,
  Modal,
  Keyboard,
  Text,
} from "react-native";
import Colors from "../../costants/Colors";
import { Button } from "react-native-paper";
import { Screen, Topbar } from "../../layouts";
import { SearchResults } from "../search-results";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  locationInputReducer,
  searchErrorReducer,
} from "../../redux/search-slice";
import { searchVisibleReducer } from "../../redux/modal-slice";

export const Search: React.FC = () => {
  const dispatch = useDispatch();

  const { height } = useWindowDimensions();

  const SCREEN_HEIGHT: number = height;

  const searchLocation: string = useSelector(
    (state: RootState) => state.search.location,
  );

  const visible: boolean = useSelector(
    (state: RootState) => state.modal.searchResultsVisible,
  );

  const handleSearchInput = (value: string): void => {
    dispatch(locationInputReducer(value));
  };

  const handleSearch = () => {
    dispatch(searchVisibleReducer());
  };

  const searchError = useSelector(
    (state: RootState) => state.search.searchError,
  );

  useEffect(() => {
    (() => {
      setTimeout(() => {
        dispatch(searchErrorReducer(""));

        return;
      }, 9000);
    })();
  }, [searchError]);

  return (
    <>
      <Screen>
        <Topbar />

        <View style={{ ...styles.container, marginTop: SCREEN_HEIGHT / 6 }}>
          {searchError && (
            <Text style={styles.errorText}>Oops! {searchError}</Text>
          )}

          <TextInput
            placeholder="Enter city name to search"
            placeholderTextColor={Colors.lightgray}
            style={styles.searchInputText}
            value={searchLocation}
            onChangeText={handleSearchInput}
          />

          <Button
            mode="contained"
            icon="magnify"
            buttonColor={Colors.secondary}
            style={styles.buttonStyle}
            onPress={handleSearch}
          >
            Search
          </Button>
        </View>
      </Screen>

      <Modal visible={visible} animationType="fade">
        <SearchResults />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  searchInputText: {
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 10,
    width: 312,
    height: 42,
    textAlign: "center",
    color: Colors.white,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 34.2,
  },
  buttonStyle: {
    marginTop: 10,
    borderRadius: 10,
  },
  errorText: {
    textAlign: "center",
    color: Colors.lightgray,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 34.2,
    marginBottom: 10,
  },
});
