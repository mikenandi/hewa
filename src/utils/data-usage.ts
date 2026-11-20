import { AppLocalStorage } from "@/costants/storage-keys";
import { readJson, writeJson } from "./storage";

interface DataUsage {
  date: string;
  bytes: number;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export const recordDataUsage = (bytes: number) => {
  if (!bytes) return;
  const usage = readJson<DataUsage>(AppLocalStorage.DATA_USAGE, {
    date: todayKey(),
    bytes: 0,
  });
  const date = todayKey();
  writeJson(AppLocalStorage.DATA_USAGE, {
    date,
    bytes: (usage.date === date ? usage.bytes : 0) + bytes,
  });
};

export const dataUsedToday = (): number => {
  const usage = readJson<DataUsage | null>(AppLocalStorage.DATA_USAGE, null);
  return usage && usage.date === todayKey() ? usage.bytes : 0;
};

export const formatBytes = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
