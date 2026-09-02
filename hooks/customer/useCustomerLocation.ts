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
          };

        /*
         * IMPORTANT:
         *
         * setDoc + merge:true:
         *
         * - idan users/{uid} yana nan -> UPDATE
         * - idan babu -> CREATE
         *
         * Ba zai goge sauran customer
         * profile fields ba.
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
             SAVE TO FIRESTORE
          ---------------------------------------------------- */

          return await saveLocation(
            latitude,
            longitude,
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