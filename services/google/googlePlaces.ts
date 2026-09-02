import { GOOGLE_MAPS_API_KEY } from "@/config/env";

import {
  GooglePlacesResponse,
} from "./types";

const BASE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

export default async function googlePlaces(
  input: string,
  sessionToken: string
): Promise<GooglePlacesResponse> {

  const query =
    input.trim();

  if (!query) {

    return {
      suggestions: [],
    };

  }

  const response =
    await fetch(
      BASE_URL,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "X-Goog-Api-Key":
            GOOGLE_MAPS_API_KEY,

          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",

        },

        body: JSON.stringify({

          input: query,

          sessionToken,

          includedRegionCodes: [
            "ng",
          ],

          languageCode: "en",

        }),

      }
    );

  if (!response.ok) {

    throw new Error(
      "Failed to fetch Google Places."
    );

  }

  return await response.json();

}