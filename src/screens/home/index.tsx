import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getWeather } from "../../services/open-weather/weather";
import { getCurrentDate, getCurrentTime, tempValue } from "../../utils";
import { Loader, WeatherDetail } from "../../components";
import { Screen, Topbar } from "../../layouts";
import Colors from "../../costants/Colors";

interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export const Home: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      const response = await getWeather("Dar es Salaam");

      setWeather(response);

      setIsLoading(false);
    })();
  }, []);

  if (isLoading || false) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <>
      <Screen>
        <Topbar />

        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={30} color={Colors.secondary} />
          <Text style={styles.locationText}>{weather?.name}</Text>
        </View>

        <View style={styles.weatherIconContainer}>
          <Image
            source={{
              uri: `https://openweathermap.org/img/wn/${weather?.weather[0].icon}@2x.png`,
            }}
            style={styles.weatherIcon}
          />
        </View>

        <View style={styles.temperatureContainer}>
          <View style={styles.tempValueContainer}>
            <Text style={styles.temperatureValueText}>
              {tempValue(weather?.main.temp || 0)}
            </Text>
            <MaterialCommunityIcons
              name="temperature-celsius"
              size={42}
              color={Colors.white}
            />
          </View>

          <View>
            <Text style={styles.feelsLikeText}>
              Feels like{" "}
              <Text style={{ fontFamily: "LatoBold", color: Colors.secondary }}>
                {tempValue(weather?.main.feels_like || 0)} °C
              </Text>
            </Text>
          </View>
          <Text style={styles.weatherText}>{weather?.weather[0].main}</Text>
        </View>
      </Screen>

      <View style={styles.weatherDetailsContainerBottom}>
        <WeatherDetail
          detailName="Windspeed"
          detailValue={`${weather?.wind.speed} km/h`}
        >
          <Image
            tintColor={Colors.white}
            source={require("../../../assets/wind.png")}
            style={styles.imgIcon}
          />
        </WeatherDetail>

        <WeatherDetail
          detailName={getCurrentDate()}
          detailValue={getCurrentTime()}
        >
          <Image
            tintColor={Colors.white}
            source={require("../../../assets/schedule.png")}
            style={styles.imgIcon}
          />
        </WeatherDetail>
        <WeatherDetail
          detailName="Humidity"
          detailValue={`${weather?.main.humidity} %`}
        >
          <Image
            tintColor={Colors.white}
            source={require("../../../assets/humidity.png")}
            style={styles.imgIcon}
          />
        </WeatherDetail>
      </View>
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
  locationText: {
    // fontWeight: "700",
    fontSize: 30,
    color: Colors.white,
    fontFamily: "DMSansMedium",
  },
  locationContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
  },
  temperatureContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 50,
  },
  temperatureValueText: {
    fontSize: 130,
    // fontWeight: "700",
    // lineHeight: 157.95,
    fontFamily: "LatoSemiBold",
    textAlign: "center",
    color: Colors.white,
  },
  tempValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  weatherIcon: {
    width: 120,
    height: 60,
  },
  feelsLikeText: {
    // fontWeight: "400",
    fontFamily: "LatoRegular",
    fontSize: 22,
    lineHeight: 26.73,
    color: Colors.white,
    textAlign: "center",
  },
  weatherText: {
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 26.73,
    color: Colors.white,
    textAlign: "center",
  },
  weatherDetailsContainerBottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  curvesContainer: {
    backgroundColor: Colors.secondary,
    width: "100%",
    height: 40,
    marginTop: 40,
  },
  weatherIconContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  imgIcon: {
    width: 40,
    height: undefined,
    aspectRatio: 1 / 1,
  },
});
