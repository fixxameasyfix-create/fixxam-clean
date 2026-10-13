import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as Location from "expo-location";

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type UseCustomerLiveLocationParams = {
  orderId: string;

  customerId: string;

  bookingCustomerId?:
    | string
    | null;

  enabled: boolean;
};

export type CustomerLiveTrackingState =
  | "idle"
  | "requesting-permission"
  | "tracking"
  | "permission-denied"
  | "error";

type LastPublishedLocation = {
  latitude: number;

  longitude: number;

  timestamp: number;
};

/* ============================================================
   CONFIG
============================================================ */

const LOCATION_TIME_INTERVAL_MS =
  5_000;

const LOCATION_DISTANCE_INTERVAL_METERS =
  10;

const MIN_FIRESTORE_UPDATE_INTERVAL_MS =
  5_000;

const MIN_FIRESTORE_DISTANCE_METERS =
  10;

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidCoordinate(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(
      latitude,
    ) &&
    Number.isFinite(
      longitude,
    ) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* ============================================================
   HAVERSINE DISTANCE
============================================================ */

function getDistanceMeters(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number,
): number {
  const earthRadius =
    6_371_000;

  const toRadians = (
    value: number,
  ) =>
    (value * Math.PI) /
    180;

  const latitudeDelta =
    toRadians(
      secondLatitude -
        firstLatitude,
    );

  const longitudeDelta =
    toRadians(
      secondLongitude -
        firstLongitude,
    );

  const latitude1 =
    toRadians(
      firstLatitude,
    );

  const latitude2 =
    toRadians(
      secondLatitude,
    );

  const a =
    Math.sin(
      latitudeDelta / 2,
    ) **
      2 +
    Math.cos(
      latitude1,
    ) *
      Math.cos(
        latitude2,
      ) *
      Math.sin(
        longitudeDelta / 2,
      ) **
        2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(
        a,
      ),
      Math.sqrt(
        1 - a,
      ),
    );

  return (
    earthRadius *
    c
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useCustomerLiveLocation({
  orderId,
  customerId,
  bookingCustomerId,
  enabled,
}: UseCustomerLiveLocationParams) {
  const subscriptionRef =
    useRef<Location.LocationSubscription | null>(
      null,
    );

  const lastPublishedRef =
    useRef<LastPublishedLocation | null>(
      null,
    );

  const publishingRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const [
    state,
    setState,
  ] =
    useState<CustomerLiveTrackingState>(
      "idle",
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /* ==========================================================
     MOUNT STATE
  ========================================================== */

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  /* ==========================================================
     LIVE LOCATION
  ========================================================== */

  useEffect(() => {
    const cleanOrderId =
      normalizeString(
        orderId,
      );

    const cleanCustomerId =
      normalizeString(
        customerId,
      );

    const cleanBookingCustomerId =
      normalizeString(
        bookingCustomerId,
      );

    let cancelled =
      false;

    /* ========================================================
       STOP LOCAL GPS WATCHER

       IMPORTANT:
       This stops only the local Expo Location subscription.

       It does NOT write:
       customerLiveSharingEnabled: false

       Explicit Stop Sharing is handled by the customer action.
    ======================================================== */

    const stopTracking =
      () => {
        subscriptionRef.current?.remove();

        subscriptionRef.current =
          null;

        lastPublishedRef.current =
          null;

        publishingRef.current =
          false;
      };

    /* ========================================================
       DISABLED
    ======================================================== */

    if (!enabled) {
      stopTracking();

      if (
        mountedRef.current
      ) {
        setState(
          "idle",
        );

        setError(
          null,
        );
      }

      return stopTracking;
    }

    /* ========================================================
       VALIDATION
    ======================================================== */

    if (
      !cleanOrderId ||
      !cleanCustomerId ||
      !cleanBookingCustomerId ||
      cleanCustomerId !==
        cleanBookingCustomerId
    ) {
      stopTracking();

      if (
        mountedRef.current
      ) {
        setState(
          "error",
        );

        setError(
          "Live tracking could not verify this customer and order.",
        );
      }

      return stopTracking;
    }

    /* ========================================================
       START TRACKING
    ======================================================== */

    const startTracking =
      async () => {
        try {
          if (
            mountedRef.current
          ) {
            setState(
              "requesting-permission",
            );

            setError(
              null,
            );
          }

          /* ==================================================
             LOCATION SERVICES
          ================================================== */

          const servicesEnabled =
            await Location.hasServicesEnabledAsync();

          if (cancelled) {
            return;
          }

          if (
            !servicesEnabled
          ) {
            if (
              mountedRef.current
            ) {
              setState(
                "error",
              );

              setError(
                "Turn on device location services to share your live location.",
              );
            }

            return;
          }

          /* ==================================================
             FOREGROUND PERMISSION
          ================================================== */

          let permission =
            await Location.getForegroundPermissionsAsync();

          if (
            permission.status !==
            Location.PermissionStatus.GRANTED
          ) {
            permission =
              await Location.requestForegroundPermissionsAsync();
          }

          if (cancelled) {
            return;
          }

          if (
            permission.status !==
            Location.PermissionStatus.GRANTED
          ) {
            if (
              mountedRef.current
            ) {
              setState(
                "permission-denied",
              );

              setError(
                "Location permission is required to share your live location with the worker.",
              );
            }

            return;
          }

          /* ==================================================
             BOOKING REFERENCE
          ================================================== */

          const bookingRef =
            doc(
              db,
              "bookings",
              cleanOrderId,
            );

          /* ==================================================
             INITIAL LOCATION
          ================================================== */

          const initialPosition =
            await Location.getCurrentPositionAsync({
              accuracy:
                Location.Accuracy.High,
            });

          if (cancelled) {
            return;
          }

          const initialLatitude =
            initialPosition.coords
              .latitude;

          const initialLongitude =
            initialPosition.coords
              .longitude;

          if (
            !isValidCoordinate(
              initialLatitude,
              initialLongitude,
            )
          ) {
            throw new Error(
              "INVALID_CUSTOMER_LOCATION",
            );
          }

          /* ==================================================
             INITIAL FIRESTORE PUBLISH

             Only advertise sharing after a valid location
             exists.
          ================================================== */

          await updateDoc(
            bookingRef,
            {
              customerLiveSharingEnabled:
                true,

              customerLiveLocation: {
                latitude:
                  initialLatitude,

                longitude:
                  initialLongitude,

                accuracy:
                  Number.isFinite(
                    initialPosition.coords
                      .accuracy,
                  )
                    ? initialPosition.coords
                        .accuracy
                    : null,

                userId:
                  cleanCustomerId,

                updatedAt:
                  serverTimestamp(),
              },
            },
          );

          if (cancelled) {
            return;
          }

          lastPublishedRef.current =
            {
              latitude:
                initialLatitude,

              longitude:
                initialLongitude,

              timestamp:
                Date.now(),
            };

          if (
            mountedRef.current
          ) {
            setState(
              "tracking",
            );

            setError(
              null,
            );
          }

          /* ==================================================
             WATCH POSITION
          ================================================== */

          const subscription =
            await Location.watchPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,

                timeInterval:
                  LOCATION_TIME_INTERVAL_MS,

                distanceInterval:
                  LOCATION_DISTANCE_INTERVAL_METERS,
              },

              async position => {
                if (
                  cancelled ||
                  publishingRef.current
                ) {
                  return;
                }

                const latitude =
                  position.coords
                    .latitude;

                const longitude =
                  position.coords
                    .longitude;

                if (
                  !isValidCoordinate(
                    latitude,
                    longitude,
                  )
                ) {
                  return;
                }

                const now =
                  Date.now();

                const previous =
                  lastPublishedRef.current;

                if (previous) {
                  const elapsed =
                    now -
                    previous.timestamp;

                  const distance =
                    getDistanceMeters(
                      previous.latitude,
                      previous.longitude,
                      latitude,
                      longitude,
                    );

                  /*
                   * Reduce GPS noise and unnecessary Firestore
                   * writes.
                   *
                   * Publish if enough time passed OR enough
                   * movement occurred.
                   */
                  if (
                    elapsed <
                      MIN_FIRESTORE_UPDATE_INTERVAL_MS &&
                    distance <
                      MIN_FIRESTORE_DISTANCE_METERS
                  ) {
                    return;
                  }
                }

                publishingRef.current =
                  true;

                try {
                  await updateDoc(
                    bookingRef,
                    {
                      customerLiveSharingEnabled:
                        true,

                      customerLiveLocation: {
                        latitude,

                        longitude,

                        accuracy:
                          Number.isFinite(
                            position.coords
                              .accuracy,
                          )
                            ? position.coords
                                .accuracy
                            : null,

                        userId:
                          cleanCustomerId,

                        updatedAt:
                          serverTimestamp(),
                      },
                    },
                  );

                  if (cancelled) {
                    return;
                  }

                  lastPublishedRef.current =
                    {
                      latitude,

                      longitude,

                      timestamp:
                        now,
                    };

                  if (
                    mountedRef.current
                  ) {
                    setState(
                      "tracking",
                    );

                    setError(
                      null,
                    );
                  }
                } catch (
                  publishError
                ) {
                  if (__DEV__) {
                    console.warn(
                      "CUSTOMER_LIVE_LOCATION_UPDATE_ERROR",
                      publishError,
                    );
                  }

                  /*
                   * Keep GPS subscription alive after a
                   * temporary Firestore/network failure.
                   */
                  if (
                    !cancelled &&
                    mountedRef.current
                  ) {
                    setError(
                      "Live location could not be updated. Check your connection and try again.",
                    );
                  }
                } finally {
                  publishingRef.current =
                    false;
                }
              },
            );

          /* ==================================================
             RACE-SAFE SUBSCRIPTION ASSIGNMENT
          ================================================== */

          if (cancelled) {
            subscription.remove();

            return;
          }

          subscriptionRef.current =
            subscription;
        } catch (
          trackingError
        ) {
          if (__DEV__) {
            console.warn(
              "CUSTOMER_LIVE_LOCATION_ERROR",
              trackingError,
            );
          }

          stopTracking();

          if (
            !cancelled &&
            mountedRef.current
          ) {
            setState(
              "error",
            );

            setError(
              "Unable to start live location sharing.",
            );
          }
        }
      };

    void startTracking();

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      cancelled =
        true;

      stopTracking();
    };
  }, [
    bookingCustomerId,
    customerId,
    enabled,
    orderId,
  ]);

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    state,

    error,

    /*
     * Do not advertise LIVE while the latest Firestore publish
     * is known to have failed.
     */
    isTracking:
      state ===
        "tracking" &&
      !error,
  };
}

/* ============================================================
   DEFAULT EXPORT

   Supports both:

   import { useCustomerLiveLocation } from "...";

   and:

   import useCustomerLiveLocation from "...";
============================================================ */

export default useCustomerLiveLocation;