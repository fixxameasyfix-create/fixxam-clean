import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import * as Location from "expo-location";

import type { Region } from "react-native-maps";

/* ==============================================================
   TYPES
============================================================== */

export type BookingLocationMarker = {
  latitude: number;
  longitude: number;
};

export type BookingCurrentLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

/* ==============================================================
   DEFAULT REGION
============================================================== */

const DEFAULT_REGION: Region = {
  latitude: 9.0765,
  longitude: 7.3986,

  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const LOCATION_DELTA = 0.01;

/* ==============================================================
   HELPERS
============================================================== */

function createRegion(
  latitude: number,
  longitude: number,
): Region {
  return {
    latitude,
    longitude,

    latitudeDelta:
      LOCATION_DELTA,

    longitudeDelta:
      LOCATION_DELTA,
  };
}

function isValidCoordinate(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function formatAddress(
  item: Location.LocationGeocodedAddress,
): string {
  return [
    item.name,
    item.street,
    item.streetNumber,
    item.city,
    item.region,
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value &&
            value.trim(),
        ),
    )
    .join(", ");
}

/* ==============================================================
   HOOK
============================================================== */

export default function useBookingLocation() {
  /* ============================================================
     STATE
  ============================================================ */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    permissionGranted,
    setPermissionGranted,
  ] = useState(false);

  const [
    region,
    setRegion,
  ] = useState<Region>(
    DEFAULT_REGION,
  );

  const [
    marker,
    setMarker,
  ] =
    useState<BookingLocationMarker>({
      latitude:
        DEFAULT_REGION.latitude,

      longitude:
        DEFAULT_REGION.longitude,
    });

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /* ============================================================
     REFS
  ============================================================ */

  const mountedRef =
    useRef(true);

  const requestIdRef =
    useRef(0);

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const getCurrentLocation =
    useCallback(
      async (): Promise<
        BookingCurrentLocation | null
      > => {
        const requestId =
          ++requestIdRef.current;

        if (
          !mountedRef.current
        ) {
          return null;
        }

        setLoading(true);
        setError(null);

        try {
          /* ----------------------------------------------------
             CHECK PERMISSION
          ---------------------------------------------------- */

          const existingPermission =
            await Location.getForegroundPermissionsAsync();

          let status =
            existingPermission.status;

          /*
           * Ask the user only when
           * permission isn't already granted.
           */
          if (
            status !== "granted"
          ) {
            const requestedPermission =
              await Location.requestForegroundPermissionsAsync();

            status =
              requestedPermission.status;
          }

          const granted =
            status === "granted";

          if (
            mountedRef.current
          ) {
            setPermissionGranted(
              granted,
            );
          }

          if (!granted) {
            if (
              mountedRef.current
            ) {
              setError(
                "Location permission is required.",
              );
            }

            return null;
          }

          /* ----------------------------------------------------
             GET GPS POSITION
          ---------------------------------------------------- */

          const current =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,
              },
            );

          /*
           * Ignore an old request if
           * another refresh happened.
           */
          if (
            requestId !==
            requestIdRef.current
          ) {
            return null;
          }

          const latitude =
            current.coords.latitude;

          const longitude =
            current.coords.longitude;

          if (
            !isValidCoordinate(
              latitude,
              longitude,
            )
          ) {
            throw new Error(
              "Invalid location coordinates.",
            );
          }

          const nextRegion =
            createRegion(
              latitude,
              longitude,
            );

          /* ----------------------------------------------------
             REVERSE GEOCODE
          ---------------------------------------------------- */

          let resolvedAddress =
            "Current location";

          try {
            const results =
              await Location.reverseGeocodeAsync(
                {
                  latitude,
                  longitude,
                },
              );

            /*
             * Only use reverse-geocoding
             * for CURRENT location.
             *
             * Manual addresses never
             * pass through this logic.
             */
            if (
              results.length
            ) {
              resolvedAddress =
                formatAddress(
                  results[0],
                ) ||
                "Current location";
            }
          } catch (
            reverseError
          ) {
            console.error(
              "BOOKING_CURRENT_REVERSE_GEOCODE_ERROR",
              reverseError,
            );
          }

          if (
            requestId !==
              requestIdRef.current ||
            !mountedRef.current
          ) {
            return null;
          }

          /* ----------------------------------------------------
             UPDATE STATE
          ---------------------------------------------------- */

          setRegion(
            nextRegion,
          );

          setMarker({
            latitude,
            longitude,
          });

          setAddress(
            resolvedAddress,
          );

          return {
            address:
              resolvedAddress,

            latitude,

            longitude,
          };
        } catch (error) {
          console.error(
            "BOOKING_GET_CURRENT_LOCATION_ERROR",
            error,
          );

          if (
            requestId ===
              requestIdRef.current &&
            mountedRef.current
          ) {
            setError(
              "We couldn't detect your current location.",
            );
          }

          return null;
        } finally {
          if (
            requestId ===
              requestIdRef.current &&
            mountedRef.current
          ) {
            setLoading(false);
          }
        }
      },
      [],
    );

  /* ============================================================
     SET LOCATION FROM MAP MARKER
  ============================================================ */

  const setLocationFromCoordinates =
    useCallback(
      async (
        latitude: number,
        longitude: number,
      ) => {
        if (
          !isValidCoordinate(
            latitude,
            longitude,
          )
        ) {
          return null;
        }

        const requestId =
          ++requestIdRef.current;

        setLoading(true);
        setError(null);

        const nextRegion =
          createRegion(
            latitude,
            longitude,
          );

        if (
          mountedRef.current
        ) {
          setRegion(
            nextRegion,
          );

          setMarker({
            latitude,
            longitude,
          });
        }

        let resolvedAddress =
          "Selected location";

        try {
          const results =
            await Location.reverseGeocodeAsync(
              {
                latitude,
                longitude,
              },
            );

          if (
            results.length
          ) {
            resolvedAddress =
              formatAddress(
                results[0],
              ) ||
              resolvedAddress;
          }
        } catch (error) {
          console.error(
            "BOOKING_MARKER_REVERSE_GEOCODE_ERROR",
            error,
          );
        }

        if (
          requestId !==
            requestIdRef.current ||
          !mountedRef.current
        ) {
          return null;
        }

        setAddress(
          resolvedAddress,
        );

        setLoading(false);

        return {
          address:
            resolvedAddress,

          latitude,

          longitude,
        };
      },
      [],
    );

  /* ============================================================
     MARKER DRAG
  ============================================================ */

  const onMarkerDragEnd =
    useCallback(
      async (
        event: {
          nativeEvent: {
            coordinate: {
              latitude: number;
              longitude: number;
            };
          };
        },
      ) => {
        const {
          latitude,
          longitude,
        } =
          event.nativeEvent
            .coordinate;

        return setLocationFromCoordinates(
          latitude,
          longitude,
        );
      },
      [
        setLocationFromCoordinates,
      ],
    );

  /* ============================================================
     INITIALIZATION
  ============================================================ */

  useEffect(() => {
    mountedRef.current = true;

    getCurrentLocation();

    return () => {
      mountedRef.current = false;

      requestIdRef.current++;
    };
  }, [
    getCurrentLocation,
  ]);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,

    permissionGranted,

    error,

    region,

    marker,

    address,

    setRegion,

    setMarker,

    setAddress,

    getCurrentLocation,

    setLocationFromCoordinates,

    onMarkerDragEnd,
  };
}