import * as Speech from "expo-speech";

export type SpeakResult = "started" | "noVoice";

// Reads text aloud in the app language. Swahili needs a Swahili text-to-speech
// voice on the phone; if the phone lists voices but none is Swahili we report
// it instead of reading Swahili text with an English voice.
export const speak = async (
  text: string,
  language: string,
  onDone: () => void,
): Promise<SpeakResult> => {
  const code = language === "sw" ? "sw" : "en";
  const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
  const voice = voices.find((v) => v.language.toLowerCase().startsWith(code));
  if (code === "sw" && voices.length > 0 && !voice) return "noVoice";

  Speech.stop();
  Speech.speak(text, {
    language: voice?.language ?? (code === "sw" ? "sw-TZ" : "en-US"),
    voice: voice?.identifier,
    rate: 0.95,
    onDone,
    onStopped: onDone,
    onError: onDone,
  });
  return "started";
};

export const stopSpeaking = () => Speech.stop();
