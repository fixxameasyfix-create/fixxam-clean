import {
  useCallback,
  useEffect,
  useState,
} from "react";

import * as Location from "expo-location";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  geohashForLocation,
} from "geofire-common";

/* ============================================================
   TYPES
============================================================ */

export type CustomerLocation = {
  latitude: number;
  longitude: number;
  geohash: string;
  address: string | null;
};

/* ============================================================
   HELPERS
============================================================ */

function isValidCoordinates(
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

/* ============================================================
   REVERSE GEOCODING
============================================================ */

async function getReadableAddress(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const results =
      await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

    const place = results[0];

    if (!place) {
      return null;
    }

    const parts = [
      place.name,
      place.street,
      place.district,
      place.city,
      place.subregion,
      place.region,
    ]
      .map((value) =>
        typeof value === "string"
          ? value.trim()
          : "",
      )
      .filter(Boolean);

    const uniqueParts =
      Array.from(
        new Set(parts),
      );

    return uniqueParts.length > 0
      ? uniqueParts.join(", ")
      : null;
  } catch (error) {
    console.warn(
      "FIXXAM_REVERSE_GEOCODING_ERROR:",
      error,
    );

    return null;
  }
}

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerLocation() {
  const [
    location,
    setLocation,
  ] = useState<CustomerLocation | null>(
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

  /* ==========================================================
     SAVE LOCATION
  ========================================================== */

  const saveLocation =
    useCallback(
      async (
        latitude: number,
        longitude: number,
        address: string | null,
      ) => {
        if (
          !isValidCoordinates(
            latitude,
            longitude,
          )
        ) {
          throw new Error(
            "Invalid coordinates.",
          );
        }

        await auth.authStateReady();

        const user =
          auth.currentUser;

        if (!user) {
          throw new Error(
            "Customer is not authenticated.",
          );
        }

        const geohash =
          geohashForLocation([
            latitude,
            longitude,
          ]);

        const customerLocation: CustomerLocation =
          {
            latitude,
            longitude,
            geohash,
            address,
          };

        /*
         * Save location without deleting
         * existing customer profile fields.
         */

        await setDoc(
          doc(
            db,
            "users",
            user.uid,
          ),
          {
            latitude,
            longitude,
            geohash,
            currentLocation:
              address,
            locationUpdatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        setLocation(
          customerLocation,
        );

        console.log(
          "FIXXAM_CUSTOMER_LOCATION_SAVED:",
          {
            uid: user.uid,
            latitude,
            longitude,
            geohash,
            address,
          },
        );

        return customerLocation;
      },
      [],
    );

  /* ==========================================================
     GET CURRENT LOCATION
  ========================================================== */

  const getCurrentLocation =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          await auth.authStateReady();

          const user =
            auth.currentUser;

          if (!user) {
            setLocation(null);
            return null;
          }

          /* ----------------------------------------------------
             CHECK PERMISSION
          ---------------------------------------------------- */

          const permission =
            await Location.getForegroundPermissionsAsync();

          let status =
            permission.status;

          if (
            status !==
            Location.PermissionStatus.GRANTED
          ) {
            const requested =
              await Location.requestForegroundPermissionsAsync();

            status =
              requested.status;
          }

          if (
            status !==
            Location.PermissionStatus.GRANTED
          ) {
            throw new Error(
              "Location permission was not granted.",
            );
          }

          /* ----------------------------------------------------
             CHECK DEVICE LOCATION
          ---------------------------------------------------- */

          const enabled =
            await Location.hasServicesEnabledAsync();

          if (!enabled) {
            throw new Error(
              "Location services are disabled.",
            );
          }

          /* ----------------------------------------------------
             GET GPS
          ---------------------------------------------------- */

          const position =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,
              },
            );

          const {
            latitude,
            longitude,
          } =
            position.coords;

          if (
            !isValidCoordinates(
              latitude,
              longitude,
            )
          ) {
            throw new Error(
              "Device returned invalid coordinates.",
            );
          }

          /* ----------------------------------------------------
             REVERSE GEOCODE
          ---------------------------------------------------- */

          const address =
            await getReadableAddress(
              latitude,
              longitude,
            );

          /* ----------------------------------------------------
             SAVE TO FIRESTORE
          ---------------------------------------------------- */

          return await saveLocation(
            latitude,
            longitude,
            address,
          );
        } catch (error) {
          console.error(
            "FIXXAM_CUSTOMER_LOCATION_ERROR:",
            error,
          );

          const message =
            error instanceof Error
              ? error.message
              : "Unable to get customer location.";

          setError(message);

          return null;
        } finally {
          setLoading(false);
        }
      },
      [saveLocation],
    );

  /* ==========================================================
     INITIAL LOCATION SYNC
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const initialize =
      async () => {
        const result =
          await getCurrentLocation();

        if (!mounted) {
          return;
        }

        if (result) {
          setLocation(result);
        }
      };

    initialize();

    return () => {
      mounted = false;
    };
  }, [
    getCurrentLocation,
  ]);

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    location,

    address:
      location?.address ??
      null,

    latitude:
      location?.latitude ??
      null,

    longitude:
      location?.longitude ??
      null,

    geohash:
      location?.geohash ??
      null,

    loading,

    error,

    refresh:
      getCurrentLocation,
  };
}