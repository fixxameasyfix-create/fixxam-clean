const GOOGLE_PLACES_URL =
  "https://places.googleapis.com/v1/places:searchNearby";

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

type Coordinates = {
  latitude: number;
  longitude: number;
};

type GooglePlace = {
  displayName?: {
    text?: string;
  };

  formattedAddress?: string;

  location?: {
    latitude?: number;
    longitude?: number;
  };

  types?: string[];
};

type GooglePlacesResponse = {
  places?: GooglePlace[];
};

function isValidCoordinates({
  latitude,
  longitude,
}: Coordinates): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceInMeters(
  from: Coordinates,
  to: Coordinates,
): number {
  const earthRadius = 6_371_000;

  const dLatitude = toRadians(
    to.latitude - from.latitude,
  );

  const dLongitude = toRadians(
    to.longitude - from.longitude,
  );

  const latitude1 = toRadians(
    from.latitude,
  );

  const latitude2 = toRadians(
    to.latitude,
  );

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(dLongitude / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadius * c;
}

export async function resolvePlaceName(
  coordinates: Coordinates,
): Promise<string | null> {
  // Validate coordinates first.
  if (!isValidCoordinates(coordinates)) {
    return null;
  }

  // Use the existing Maps API key from .env.
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn(
      "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is missing.",
    );

    return null;
  }

  try {
    const response = await fetch(
      GOOGLE_PLACES_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "X-Goog-Api-Key":
            GOOGLE_MAPS_API_KEY,

          // Request only the fields we actually use.
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location,places.types",
        },

        body: JSON.stringify({
          // Search close to the worker's coordinates.
          locationRestriction: {
            circle: {
              center: {
                latitude:
                  coordinates.latitude,

                longitude:
                  coordinates.longitude,
              },

              radius: 150,
            },
          },

          // Get the nearest place first.
          rankPreference: "DISTANCE",

          maxResultCount: 5,

          languageCode: "en",
        }),
      },
    );

    if (!response.ok) {
      console.warn(
        "GOOGLE_PLACES_ERROR",
        response.status,
      );

      return null;
    }

    const data =
      (await response.json()) as GooglePlacesResponse;

    const places =
      data.places ?? [];

    if (places.length === 0) {
      return null;
    }

    // Find the closest valid place.
    const closestPlace =
      places
        .filter(
          (place) =>
            place.location &&
            Number.isFinite(
              place.location.latitude,
            ) &&
            Number.isFinite(
              place.location.longitude,
            ),
        )
        .map((place) => ({
          place,

          distance: distanceInMeters(
            coordinates,
            {
              latitude:
                place.location!.latitude!,

              longitude:
                place.location!.longitude!,
            },
          ),
        }))
        .sort(
          (a, b) =>
            a.distance -
            b.distance,
        )[0];

    if (!closestPlace) {
      return null;
    }

    // Don't return a place farther than 150m.
    if (closestPlace.distance > 150) {
      return null;
    }

    const name =
      closestPlace.place.displayName?.text?.trim();

    if (name) {
      return name;
    }

    return null;
  } catch (error) {
    console.warn(
      "PLACE_NAME_RESOLUTION_ERROR",
      error,
    );

    return null;
  }
}