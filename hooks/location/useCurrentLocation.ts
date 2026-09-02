import {
  useCallback,
  useEffect,
  useState,
} from "react";

import * as Location from "expo-location";

export type CurrentLocation = {
  latitude: number;
  longitude: number;
  address: string;
};

export default function useCurrentLocation() {
  const [
    location,
    setLocation,
  ] = useState<CurrentLocation | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadLocation =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          status,
        } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !== "granted"
        ) {
          setError(
            "Location permission denied.",
          );

          return;
        }

        const position =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.Balanced,
            },
          );

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        let address = "";

        try {
          const [
            place,
          ] =
            await Location.reverseGeocodeAsync(
              {
                latitude,
                longitude,
              },
            );

          if (place) {
            address = [
              place.name,
              place.street,
              place.city,
              place.region,
            ]
              .filter(
                (
                  value,
                ): value is string =>
                  typeof value ===
                    "string" &&
                  value.trim()
                    .length > 0,
              )
              .map(
                (value) =>
                  value.trim(),
              )
              .filter(
                (
                  value,
                  index,
                  array,
                ) =>
                  array.indexOf(
                    value,
                  ) === index,
              )
              .join(", ");
          }
        } catch (geocodeError) {
          console.warn(
            "LOCATION REVERSE GEOCODE ERROR",
            geocodeError,
          );
        }

        setLocation({
          latitude,
          longitude,
          address,
        });
      } catch (err) {
        console.error(
          "CURRENT LOCATION ERROR",
          err,
        );

        setError(
          "Unable to get current location.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadLocation();
  }, [
    loadLocation,
  ]);

  return {
    location,
    loading,
    error,
    refresh: loadLocation,
  };
}