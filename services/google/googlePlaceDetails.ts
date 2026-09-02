import { GOOGLE_MAPS_API_KEY } from "@/config/env";

import {
  GooglePlaceDetailsResponse,
  GooglePlaceLocation,
} from "./types";

const BASE_URL =
  "https://places.googleapis.com/v1/places";

export default async function googlePlaceDetails(
  placeId: string
): Promise<GooglePlaceLocation> {

  const response =
    await fetch(
      `${BASE_URL}/${placeId}`,
      {

        method: "GET",

        headers: {

          "X-Goog-Api-Key":
            GOOGLE_MAPS_API_KEY,

          "X-Goog-FieldMask":
            "id,formattedAddress,location",

        },

      }
    );

  if (!response.ok) {

    throw new Error(
      "Failed to fetch Google Place Details."
    );

  }

  const data =
    (await response.json()) as GooglePlaceDetailsResponse;

  return {

    latitude:
      data.location.latitude,

    longitude:
      data.location.longitude,

    address:
      data.formattedAddress,

  };

}