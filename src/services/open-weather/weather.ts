import { OPEN_WEATHER_API } from "../../costants";
import { axios } from "./axios";

export const getWeather = async (locationName: string) => {
  try {
    let response = await axios({
      method: "GET",
      url: `/weather?q=${locationName}&appid=${OPEN_WEATHER_API}&units=metric`,
    });

    return response.data;
  } catch (error: any) {
    throw error.response.data;
  }
};
