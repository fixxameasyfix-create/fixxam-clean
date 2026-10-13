// utils/location/createGeohash.ts

import {
  geohashForLocation,
} from "geofire-common";

/* ============================================================
   CREATE GEOHASH
============================================================ */

export default function createGeohash(
  latitude: number,
  longitude: number,
): string {
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(
      "Invalid latitude.",
    );
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Invalid longitude.",
    );
  }

  return geohashForLocation([
    latitude,
    longitude,
  ]);
}