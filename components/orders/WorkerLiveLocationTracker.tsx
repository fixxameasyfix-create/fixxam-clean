import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import * as Location from "expo-location";

import Toast from "react-native-toast-message";

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

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

/* ==============================================================
   CONSTANTS
============================================================== */

const LOCATION_DISTANCE_INTERVAL =
  20;

const LOCATION_TIME_INTERVAL =
  10_000;

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function showError(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showWarning(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerLiveLocationTracker({
  orderId,
  enabled,
}: WorkerLiveLocationTrackerProps) {
  const [
    state,
    setState,
  ] =
    useState<TrackerState>(
      "idle",
    );

  const subscriptionRef =
    useRef<Location.LocationSubscription | null>(
      null,
    );

  const updatingRef =
    useRef(false);

  const errorShownRef =
    useRef(false);

  /* ==========================================================
     STOP TRACKING
  ========================================================== */

  function stopTracking() {
    if (
      subscriptionRef.current
    ) {
      subscriptionRef.current.remove();

      subscriptionRef.current =
        null;
    }

    updatingRef.current =
      false;
  }

  /* ==========================================================
     UNMOUNT CLEANUP
  ========================================================== */

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  /* ==========================================================
     TRACKING
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const cleanOrderId =
      cleanText(orderId);

    errorShownRef.current =
      false;

    async function startTracking() {
      /* ======================================================
         DISABLED
      ====================================================== */

      if (!enabled) {
        stopTracking();

        if (!cancelled) {
          setState("idle");
        }

        return;
      }

      /* ======================================================
         ORDER VALIDATION
      ====================================================== */

      if (!cleanOrderId) {
        stopTracking();

        if (!cancelled) {
          setState("error");

          showError(
            "Location unavailable",
            "This order could not be identified.",
          );
        }

        return;
      }

      /* ======================================================
         AUTH
      ====================================================== */

      const workerId =
        auth.currentUser?.uid?.trim();

      if (!workerId) {
        stopTracking();

        if (!cancelled) {
          setState("error");

          showError(
            "Sign in required",
            "Please sign in again before sharing your live location.",
          );
        }

        return;
      }

      try {
        if (!cancelled) {
          setState(
            "starting",
          );
        }

        /*
         * Always remove an older
         * foreground watcher first.
         */
        stopTracking();

        /* ====================================================
           FOREGROUND PERMISSION
        ==================================================== */

        const permission =
          await Location
            .requestForegroundPermissionsAsync();

        if (cancelled) {
          return;
        }

        if (
          permission.status !==
          Location.PermissionStatus
            .GRANTED
        ) {
          stopTracking();

          setState("denied");

          showWarning(
            "Location permission needed",
            "Allow location access so the customer can see your live location while you are working.",
          );

          return;
        }

        /* ====================================================
           INITIAL LOCATION
        ==================================================== */

        const currentLocation =
          await Location
            .getCurrentPositionAsync(
              {
                accuracy:
                  Location
                    .Accuracy
                    .High,
              },
            );

        if (cancelled) {
          return;
        }

        await saveLocation(
          cleanOrderId,
          currentLocation,
          workerId,
        );

        if (cancelled) {
          return;
        }

        /* ====================================================
           FOREGROUND LIVE TRACKING
        ==================================================== */

        const subscription =
          await Location
            .watchPositionAsync(
              {
                accuracy:
                  Location
                    .Accuracy
                    .High,

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
                    cleanOrderId,
                    location,
                    workerId,
                  );
                } catch (error) {
                  console.error(
                    "WORKER_LIVE_LOCATION_UPDATE_ERROR",
                    error,
                  );

                  /*
                   * Do not show a Toast
                   * every 10 seconds if
                   * the network is failing.
                   */
                  if (
                    !cancelled &&
                    !errorShownRef.current
                  ) {
                    errorShownRef.current =
                      true;

                    showError(
                      "Location update failed",
                      "We could not update your live location. Check your connection.",
                    );
                  }
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

                if (cancelled) {
                  return;
                }

                stopTracking();

                setState("error");

                if (
                  !errorShownRef.current
                ) {
                  errorShownRef.current =
                    true;

                  showError(
                    "Location unavailable",
                    "Live location tracking stopped. Please check your location settings.",
                  );
                }
              },
            );

        if (cancelled) {
          subscription.remove();

          return;
        }

        subscriptionRef.current =
          subscription;

        errorShownRef.current =
          false;

        setState("active");
      } catch (error) {
        console.error(
          "WORKER_LIVE_LOCATION_START_ERROR",
          error,
        );

        stopTracking();

        if (!cancelled) {
          setState("error");

          if (
            !errorShownRef.current
          ) {
            errorShownRef.current =
              true;

            showError(
              "Location unavailable",
              "We could not start live location tracking. Please try again.",
            );
          }
        }
      }
    }

    void startTracking();

    return () => {
      cancelled = true;

      stopTracking();
    };
  }, [
    enabled,
    orderId,
  ]);

  /* ==========================================================
     HIDDEN STATES
  ========================================================== */

  if (
    !enabled ||
    state === "idle"
  ) {
    return null;
  }

  /* ==========================================================
     UI STATE
  ========================================================== */

  const isActive =
    state === "active";

  const isDenied =
    state === "denied";

  const isError =
    state === "error";

  const iconName =
    isActive
      ? "navigation"
      : isDenied
        ? "warning"
        : isError
          ? "error"
          : "location";

  const iconColor =
    isActive
      ? Colors.success
      : isDenied
        ? Colors.warning
        : isError
          ? Colors.error
          : WorkerColors.primary;

  const title =
    isActive
      ? "LIVE LOCATION ACTIVE"
      : isDenied
        ? "LOCATION PERMISSION NEEDED"
        : isError
          ? "LOCATION UNAVAILABLE"
          : "STARTING LIVE LOCATION";

  const description =
    isActive
      ? "Customer can now see your live location."
      : isDenied
        ? "Allow location permission to share your location."
        : isError
          ? "We could not update your live location."
          : "Preparing your live location...";

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${description}`}
      style={styles.container}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.icon,

          isActive
            ? styles.iconActive
            : isDenied
              ? styles.iconWarning
              : isError
                ? styles.iconError
                : styles.iconStarting,
        ]}
      >
        <AppIcon
          name={iconName}
          role="worker"
          size="sm"
          color={iconColor}
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="caption"
          weight="bold"
          style={[
            styles.title,

            isActive
              ? styles.titleActive
              : isDenied
                ? styles.titleWarning
                : isError
                  ? styles.titleError
                  : styles.titleStarting,
          ]}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.text}
        >
          {description}
        </AppText>
      </View>

      {/* ======================================================
          LIVE INDICATOR
      ====================================================== */}

      {isActive ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={styles.liveDot}
        />
      ) : null}
    </View>
  );
}

/* ==============================================================
   SAVE LOCATION
============================================================== */

async function saveLocation(
  orderId: string,
  location: Location.LocationObject,
  workerId: string,
) {
  const cleanOrderId =
    cleanText(orderId);

  const cleanWorkerId =
    cleanText(workerId);

  if (
    !cleanOrderId ||
    !cleanWorkerId
  ) {
    return;
  }

  const {
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
  } = location.coords;

  /* ==========================================================
     COORDINATE VALIDATION
  ========================================================== */

  if (
    !Number.isFinite(
      latitude,
    ) ||
    !Number.isFinite(
      longitude,
    )
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

  const bookingRef =
    doc(
      db,
      "bookings",
      cleanOrderId,
    );

  await updateDoc(
    bookingRef,
    {
      liveLocation: {
        latitude,
        longitude,

        accuracy:
          typeof accuracy ===
            "number" &&
          Number.isFinite(
            accuracy,
          )
            ? accuracy
            : null,

        heading:
          typeof heading ===
            "number" &&
          Number.isFinite(
            heading,
          )
            ? heading
            : null,

        speed:
          typeof speed ===
            "number" &&
          Number.isFinite(
            speed,
          )
            ? speed
            : null,

        workerId:
          cleanWorkerId,

        updatedAt:
          serverTimestamp(),
      },

      updatedAt:
        serverTimestamp(),
    },
  );
}

/* ==============================================================
   EXPORT
============================================================== */

export default memo(
  WorkerLiveLocationTracker,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      minHeight: 68,

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ICON
    ======================================================== */

    icon: {
      width: 44,

      height: 44,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    iconStarting: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    iconActive: {
      backgroundColor:
        Colors.successSoft,
    },

    iconWarning: {
      backgroundColor:
        Colors.warningSoft,
    },

    iconError: {
      backgroundColor:
        Colors.errorSoft,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      letterSpacing: 0.3,
    },

    titleStarting: {
      color:
        WorkerColors.primary,
    },

    titleActive: {
      color:
        Colors.success,
    },

    titleWarning: {
      color:
        Colors.warning,
    },

    titleError: {
      color:
        Colors.error,
    },

    text: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },

    /* ========================================================
       LIVE INDICATOR
    ======================================================== */

    liveDot: {
      width: 9,

      height: 9,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },
  });