import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  StyleSheet,
  View,
} from "react-native";

import * as Location from "expo-location";

import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type WorkerLiveLocationTrackerProps = {
  orderId: string;
  enabled: boolean;
};

type TrackerState =
  | "idle"
  | "starting"
  | "active"
  | "denied"
  | "error";

/* ============================================================
   CONSTANTS
============================================================ */

const LOCATION_DISTANCE_INTERVAL = 20;

const LOCATION_TIME_INTERVAL = 10_000;

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerLiveLocationTracker({
  orderId,
  enabled,
}: WorkerLiveLocationTrackerProps) {
  const [
    state,
    setState,
  ] = useState<TrackerState>(
    "idle",
  );

  const subscriptionRef =
    useRef<Location.LocationSubscription | null>(
      null,
    );

  const updatingRef =
    useRef(false);

  /* ==========================================================
     CLEANUP
  ========================================================== */

  useEffect(() => {
    return () => {
      if (
        subscriptionRef.current
      ) {
        subscriptionRef.current.remove();

        subscriptionRef.current =
          null;
      }
    };
  }, []);

  /* ==========================================================
     TRACKER
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function startTracking() {
      if (!enabled) {
        setState("idle");

        return;
      }

      if (!orderId.trim()) {
        setState("error");

        return;
      }

      const workerId =
        auth.currentUser?.uid;

      if (!workerId) {
        setState("error");

        return;
      }

      try {
        setState("starting");

        /*
         * Make sure an old subscription
         * cannot remain active.
         */

        if (
          subscriptionRef.current
        ) {
          subscriptionRef.current.remove();

          subscriptionRef.current =
            null;
        }

        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (cancelled) {
          return;
        }

        if (
          permission.status !==
          Location.PermissionStatus.GRANTED
        ) {
          setState("denied");

          Alert.alert(
            "Location permission required",
            "Please allow location access so customers can see your live location while you are working.",
          );

          return;
        }

        /*
         * Get one immediate location first.
         * This prevents waiting for the first
         * watchPositionAsync callback.
         */

        const currentLocation =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,
            },
          );

        if (cancelled) {
          return;
        }

        await saveLocation(
          orderId,
          currentLocation,
        );

        if (cancelled) {
          return;
        }

        /*
         * Start continuous foreground tracking.
         */

        const subscription =
          await Location.watchPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,

              distanceInterval:
                LOCATION_DISTANCE_INTERVAL,

              timeInterval:
                LOCATION_TIME_INTERVAL,

              mayShowUserSettingsDialog:
                true,
            },

            async (
              location,
            ) => {
              if (
                cancelled ||
                updatingRef.current
              ) {
                return;
              }

              try {
                updatingRef.current =
                  true;

                await saveLocation(
                  orderId,
                  location,
                );
              } catch (
                error
              ) {
                console.error(
                  "WORKER_LIVE_LOCATION_UPDATE_ERROR",
                  error,
                );
              } finally {
                updatingRef.current =
                  false;
              }
            },

            (reason) => {
              console.error(
                "WORKER_LIVE_LOCATION_WATCH_ERROR",
                reason,
              );

              if (!cancelled) {
                setState("error");
              }
            },
          );

        if (cancelled) {
          subscription.remove();

          return;
        }

        subscriptionRef.current =
          subscription;

        setState("active");
      } catch (error) {
        console.error(
          "WORKER_LIVE_LOCATION_START_ERROR",
          error,
        );

        if (!cancelled) {
          setState("error");
        }
      }
    }

    void startTracking();

    return () => {
      cancelled = true;

      if (
        subscriptionRef.current
      ) {
        subscriptionRef.current.remove();

        subscriptionRef.current =
          null;
      }
    };
  }, [
    orderId,
    enabled,
  ]);

  /* ==========================================================
     UI
  ========================================================== */

  if (!enabled) {
    return null;
  }

  if (state === "idle") {
    return null;
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={[
          styles.icon,
          state === "active"
            ? styles.iconActive
            : styles.iconWaiting,
        ]}
      >
        <Ionicons
          name={
            state === "active"
              ? "navigate"
              : "location-outline"
          }
          size={17}
          color={
            state === "active"
              ? "#16A34A"
              : "#2563EB"
          }
        />
      </View>

      <View
        style={
          styles.content
        }
      >
        <AppText
          weight="bold"
          style={
            styles.title
          }
        >
          {state === "active"
            ? "LIVE LOCATION ACTIVE"
            : state === "denied"
              ? "LOCATION PERMISSION NEEDED"
              : state === "error"
                ? "LOCATION UNAVAILABLE"
                : "STARTING LIVE LOCATION"}
        </AppText>

        <AppText
          style={
            styles.text
          }
        >
          {state === "active"
            ? "Customer can now see your live location."
            : state === "denied"
              ? "Allow location permission to share your location."
              : state === "error"
                ? "We could not update your live location."
                : "Preparing your live location..."}
        </AppText>
      </View>

      {state === "active" && (
        <View
          style={
            styles.liveDot
          }
        />
      )}
    </View>
  );
}

/* ============================================================
   SAVE LOCATION
============================================================ */

async function saveLocation(
  orderId: string,
  location: Location.LocationObject,
) {
  const workerId =
    auth.currentUser?.uid;

  if (!workerId) {
    return;
  }

  const {
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
  } = location.coords;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return;
  }

  const bookingRef = doc(
    db,
    "bookings",
    orderId,
  );

  await updateDoc(
    bookingRef,
    {
      liveLocation: {
        latitude,
        longitude,

        accuracy:
          typeof accuracy ===
          "number"
            ? accuracy
            : null,

        heading:
          typeof heading ===
          "number"
            ? heading
            : null,

        speed:
          typeof speed ===
          "number"
            ? speed
            : null,

        workerId,

        updatedAt:
          serverTimestamp(),
      },

      updatedAt:
        serverTimestamp(),
    },
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 14,
      padding: 12,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    icon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    iconActive: {
      backgroundColor:
        "#DCFCE7",
    },

    iconWaiting: {
      backgroundColor:
        "#EFF6FF",
    },

    content: {
      flex: 1,
      marginLeft: 10,
      marginRight: 8,
    },

    title: {
      fontSize: 9.5,
      color: "#0F172A",
    },

    text: {
      marginTop: 3,
      fontSize: 9,
      lineHeight: 14,
      color: "#64748B",
    },

    liveDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor:
        "#16A34A",
    },
  });