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

type UseWorkerLiveLocationParams = {
  orderId: string;
  workerId: string;
  bookingWorkerId?: string | null;
  enabled: boolean;
};

export type WorkerLiveTrackingState =
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

/*
 * Foreground live tracking.
 *
 * The parent screen controls when tracking is enabled.
 *
 * Expected booking lifecycle:
 *
 * pending
 *   -> disabled
 *
 * accepted
 *   -> enabled
 *
 * in-progress
 *   -> enabled
 *
 * completed / cancelled / expired
 *   -> disabled
 *
 * IMPORTANT:
 * This hook publishes WORKER realtime GPS only.
 *
 * It must never overwrite:
 * - booking.latitude
 * - booking.longitude
 * - customerLiveLocation
 */
const LOCATION_TIME_INTERVAL_MS =
  5_000;

const LOCATION_DISTANCE_INTERVAL_METERS =
  10;

/*
 * Firestore write throttling.
 *
 * A location update is skipped only when BOTH:
 *
 * - less than 5 seconds have passed
 * - worker moved less than 10 metres
 *
 * This reduces noisy GPS writes while keeping
 * live tracking responsive.
 */
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
  return typeof value ===
    "string"
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
    latitude >=
      -90 &&
    latitude <=
      90 &&
    longitude >=
      -180 &&
    longitude <=
      180
  );
}

/*
 * Haversine distance in metres.
 */
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
    (value *
      Math.PI) /
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
      latitudeDelta /
        2,
    ) **
      2 +
    Math.cos(
      latitude1,
    ) *
      Math.cos(
        latitude2,
      ) *
      Math.sin(
        longitudeDelta /
          2,
      ) **
        2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(
        a,
      ),
      Math.sqrt(
        1 -
          a,
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

export default function useWorkerLiveLocation({
  orderId,
  workerId,
  bookingWorkerId,
  enabled,
}: UseWorkerLiveLocationParams) {
  const subscriptionRef =
    useRef<Location.LocationSubscription | null>(
      null,
    );

  const lastPublishedRef =
    useRef<LastPublishedLocation | null>(
      null,
    );

  /*
   * Prevent overlapping Firestore writes from
   * multiple fast GPS callbacks.
   */
  const publishingRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const [
    state,
    setState,
  ] =
    useState<WorkerLiveTrackingState>(
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
     LIVE TRACKING
  ========================================================== */

  useEffect(() => {
    const cleanOrderId =
      normalizeString(
        orderId,
      );

    const cleanWorkerId =
      normalizeString(
        workerId,
      );

    const cleanBookingWorkerId =
      normalizeString(
        bookingWorkerId,
      );

    let cancelled =
      false;

    /* ========================================================
       STOP EXISTING SUBSCRIPTION
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
       IDENTITY VALIDATION
    ======================================================== */

    if (
      !cleanOrderId ||
      !cleanWorkerId ||
      !cleanBookingWorkerId ||
      cleanWorkerId !==
        cleanBookingWorkerId
    ) {
      stopTracking();

      if (
        mountedRef.current
      ) {
        setState(
          "error",
        );

        setError(
          "Live tracking could not verify this worker and order.",
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
             DEVICE LOCATION SERVICES
          ================================================== */

          const servicesEnabled =
            await Location.hasServicesEnabledAsync();

          if (
            cancelled
          ) {
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
             FOREGROUND LOCATION PERMISSION
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

          if (
            cancelled
          ) {
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
                "Location permission is required to share your live location after the booking is accepted.",
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

             Publish immediately so the customer does not have
             to wait for watchPositionAsync's first callback.
          ================================================== */

          const initialPosition =
            await Location.getCurrentPositionAsync({
              accuracy:
                Location.Accuracy.High,
            });

          if (
            cancelled
          ) {
            return;
          }

          const initialLatitude =
            initialPosition
              .coords
              .latitude;

          const initialLongitude =
            initialPosition
              .coords
              .longitude;

          if (
            !isValidCoordinate(
              initialLatitude,
              initialLongitude,
            )
          ) {
            throw new Error(
              "INVALID_INITIAL_LOCATION",
            );
          }

          /* ==================================================
             INITIAL FIRESTORE PUBLISH

             liveLocation belongs to WORKER.

             userId allows customer-side validation that this
             location belongs to the assigned worker.
          ================================================== */

          await updateDoc(
            bookingRef,
            {
              liveLocation: {
                latitude:
                  initialLatitude,

                longitude:
                  initialLongitude,

                accuracy:
                  Number.isFinite(
                    initialPosition
                      .coords
                      .accuracy,
                  )
                    ? initialPosition
                        .coords
                        .accuracy
                    : null,

                userId:
                  cleanWorkerId,

                updatedAt:
                  serverTimestamp(),
              },
            },
          );

          if (
            cancelled
          ) {
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
             WATCH REALTIME LOCATION
          ================================================== */

          subscriptionRef.current =
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
                  position
                    .coords
                    .latitude;

                const longitude =
                  position
                    .coords
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

                /* ============================================
                   FIRESTORE THROTTLING
                ============================================ */

                if (
                  previous
                ) {
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
                   * Skip only when BOTH conditions are small.
                   *
                   * If enough time has passed OR the worker
                   * moved enough, publish the update.
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
                  /* ==========================================
                     REALTIME FIRESTORE PUBLISH
                  ========================================== */

                  await updateDoc(
                    bookingRef,
                    {
                      liveLocation: {
                        latitude,

                        longitude,

                        accuracy:
                          Number.isFinite(
                            position
                              .coords
                              .accuracy,
                          )
                            ? position
                                .coords
                                .accuracy
                            : null,

                        userId:
                          cleanWorkerId,

                        updatedAt:
                          serverTimestamp(),
                      },
                    },
                  );

                  if (
                    cancelled
                  ) {
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
                      "WORKER_LIVE_LOCATION_UPDATE_ERROR",
                      publishError,
                    );
                  }

                  /*
                   * Keep the location subscription alive.
                   *
                   * A temporary Firestore/network failure
                   * should not destroy GPS tracking.
                   *
                   * UI should prioritize this error message
                   * over the "tracking" state until a future
                   * publish succeeds.
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
             COMPONENT / EFFECT CANCELLED DURING WATCH START
          ================================================== */

          if (
            cancelled
          ) {
            subscriptionRef.current?.remove();

            subscriptionRef.current =
              null;

            return;
          }
        } catch (
          trackingError
        ) {
          if (__DEV__) {
            console.warn(
              "WORKER_LIVE_LOCATION_ERROR",
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
              "Unable to start live location tracking.",
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
    bookingWorkerId,
    enabled,
    orderId,
    workerId,
  ]);

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    state,

    error,

    isTracking:
      state ===
        "tracking" &&
      !error,
  };
}