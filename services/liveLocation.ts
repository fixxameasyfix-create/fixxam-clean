import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import * as Location from "expo-location";

import {
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

export type LiveLocationRole =
  | "customer"
  | "worker";

export type LiveLocationData = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  updatedAt: ReturnType<
    typeof serverTimestamp
  >;
  isSharing: boolean;
};

/* ==============================================================
   CONFIG
============================================================== */

const DISTANCE_INTERVAL = 15;

const TIME_INTERVAL = 10_000;

/* ==============================================================
   PERMISSION
============================================================== */

export async function requestLiveLocationPermission(): Promise<boolean> {
  const {
    status,
  } =
    await Location.requestForegroundPermissionsAsync();

  return status ===
    Location.PermissionStatus.GRANTED;
}

/* ==============================================================
   SAVE LOCATION
============================================================== */

async function saveLiveLocation({
  orderId,
  role,
  location,
}: {
  orderId: string;
  role: LiveLocationRole;
  location: Location.LocationObject;
}): Promise<void> {
  const latitude =
    location.coords.latitude;

  const longitude =
    location.coords.longitude;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  const bookingRef =
    doc(
      db,
      "bookings",
      orderId,
    );

  const liveLocation: LiveLocationData =
    {
      latitude,
      longitude,

      accuracy:
        Number.isFinite(
          location.coords.accuracy ??
            NaN,
        )
          ? location.coords
              .accuracy
          : null,

      heading:
        Number.isFinite(
          location.coords.heading ??
            NaN,
        )
          ? location.coords
              .heading
          : null,

      updatedAt:
        serverTimestamp(),

      isSharing: true,
    };

  await updateDoc(
    bookingRef,
    {
      [`liveLocation.${role}`]:
        liveLocation,
    },
  );
}

/* ==============================================================
   START TRACKING
============================================================== */

export async function startLiveLocationTracking({
  orderId,
  role,
}: {
  orderId: string;
  role: LiveLocationRole;
}): Promise<
  Location.LocationSubscription
> {
  const cleanOrderId =
    orderId.trim();

  if (!cleanOrderId) {
    throw new Error(
      "ORDER_ID_REQUIRED",
    );
  }

  const hasPermission =
    await requestLiveLocationPermission();

  if (!hasPermission) {
    throw new Error(
      "LOCATION_PERMISSION_DENIED",
    );
  }

  const currentLocation =
    await Location.getCurrentPositionAsync(
      {
        accuracy:
          Location.Accuracy.High,
      },
    );

  await saveLiveLocation({
    orderId: cleanOrderId,
    role,
    location:
      currentLocation,
  });

  const subscription =
    await Location.watchPositionAsync(
      {
        accuracy:
          Location.Accuracy.High,

        distanceInterval:
          DISTANCE_INTERVAL,

        timeInterval:
          TIME_INTERVAL,
      },

      async (
        location,
      ) => {
        try {
          await saveLiveLocation({
            orderId:
              cleanOrderId,

            role,

            location,
          });
        } catch (error) {
          console.error(
            "SAVE_LIVE_LOCATION_ERROR",
            error,
          );
        }
      },
    );

  return subscription;
}

/* ==============================================================
   STOP TRACKING
============================================================== */

export async function stopLiveLocationTracking({
  orderId,
  role,
  subscription,
}: {
  orderId: string;
  role: LiveLocationRole;
  subscription?: Location.LocationSubscription | null;
}): Promise<void> {
  subscription?.remove();

  const cleanOrderId =
    orderId.trim();

  if (!cleanOrderId) {
    return;
  }

  try {
    const bookingRef =
      doc(
        db,
        "bookings",
        cleanOrderId,
      );

    await updateDoc(
      bookingRef,
      {
        [`liveLocation.${role}.isSharing`]:
          false,

        [`liveLocation.${role}.updatedAt`]:
          serverTimestamp(),
      },
    );
  } catch (error) {
    console.error(
      "STOP_LIVE_LOCATION_ERROR",
      error,
    );
  }
}