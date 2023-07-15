import moment from "moment-timezone";

export const getCurrentTime = (): string => {
  const timezone = "Africa/Dar_es_Salaam";
  const currentTime = moment().tz(timezone).format("HH:mm");

  return currentTime;
};
