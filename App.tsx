import { LogBox } from "react-native";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { Navigation } from "./src/naviagation/app-tabs";

LogBox.ignoreAllLogs();

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
};

export default App;
