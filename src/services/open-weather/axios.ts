import Axios from "axios";

export const axios = Axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5",
  timeout: 9000,
});
