// Rough geographic helpers. Boxes are deliberately generous approximations —
// good enough to decide which cards are relevant, not for navigation.

export const isInEastAfrica = (lat: number, lon: number): boolean =>
  lat >= -17 && lat <= 5 && lon >= 28 && lon <= 42;

export type RainRegime = "bimodal" | "unimodal";

// Tanzania (and neighbours): the north, Lake zone, north-east highlands and the
// coast down to about Dar es Salaam get two seasons (Vuli + Masika); the
// central, western and southern regions get one long season (Msimu).
export const rainRegime = (lat: number, lon: number): RainRegime =>
  lat > -3.6 || (lon > 37 && lat > -8) ? "bimodal" : "unimodal";

export type LakeKey = "victoria" | "tanganyika" | "nyasa";

const LAKES: {
  key: LakeKey;
  south: number;
  north: number;
  west: number;
  east: number;
}[] = [
  { key: "victoria", south: -3.3, north: 0.7, west: 31.4, east: 35.0 },
  { key: "tanganyika", south: -8.9, north: -3.2, west: 28.9, east: 31.4 },
  { key: "nyasa", south: -14.6, north: -9.3, west: 33.7, east: 35.4 },
];

/** The big lake a place sits on or next to (within ~0.2°), if any. */
export const nearbyLake = (lat: number, lon: number): LakeKey | null => {
  const pad = 0.2;
  const lake = LAKES.find(
    (l) =>
      lat >= l.south - pad &&
      lat <= l.north + pad &&
      lon >= l.west - pad &&
      lon <= l.east + pad,
  );
  return lake?.key ?? null;
};
