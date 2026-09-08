import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import {
  calculateArrivalTime,
} from "@/utils/location/calculateArrivalTime";

import {
  resolvePlaceName,
} from "@/services/location/resolvePlaceName";

import type {
  WorkerCardData,
} from "./types";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  worker: WorkerCardData;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   VALID COORDINATES
============================================================== */

function getValidCoordinates(
  latitude: unknown,
  longitude: unknown,
): Coordinates | null {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function getFallbackLocation(
  worker: WorkerCardData,
): string {
  const profile =
    worker.workerProfile;

  const location = [
    cleanString(
      profile.lga,
    ),
    cleanString(
      profile.state,
    ),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    location ||
    cleanString(
      profile.address,
    ) ||
    "Location unavailable"
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerLocation({
  worker,
}: Props) {
  /* ============================================================
     COORDINATES
  ============================================================ */

  const coordinates =
    useMemo(
      () =>
        getValidCoordinates(
          worker.workerProfile
            .latitude,
          worker.workerProfile
            .longitude,
        ),
      [
        worker.workerProfile
          .latitude,
        worker.workerProfile
          .longitude,
      ],
    );

  /* ============================================================
     STATE
  ============================================================ */

  const [
    placeName,
    setPlaceName,
  ] =
    useState<string | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  /* ============================================================
     RESOLVE PLACE NAME
  ============================================================ */

  useEffect(() => {
    let cancelled =
      false;

    if (
      !coordinates
    ) {
      setPlaceName(
        null,
      );

      setLoading(
        false,
      );

      return () => {
        cancelled =
          true;
      };
    }

    const {
      latitude,
      longitude,
    } = coordinates;

    async function loadPlaceName() {
      try {
        setLoading(
          true,
        );

        const resolved =
          await resolvePlaceName({
            latitude,
            longitude,
          });

        if (
          cancelled
        ) {
          return;
        }

        setPlaceName(
          cleanString(
            resolved,
          ) ||
            null,
        );
      } catch (
        error
      ) {
        console.error(
          "RESOLVE_WORKER_LOCATION_ERROR:",
          error,
        );

        if (
          !cancelled
        ) {
          setPlaceName(
            null,
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void loadPlaceName();

    return () => {
      cancelled =
        true;
    };
  }, [
    coordinates,
  ]);

  /* ============================================================
     LOCATION
  ============================================================ */

  const location =
    useMemo(
      () =>
        cleanString(
          placeName,
        ) ||
        getFallbackLocation(
          worker,
        ),
      [
        placeName,
        worker,
      ],
    );

  /* ============================================================
     DISTANCE / ARRIVAL
  ============================================================ */

  const safeDistance =
    typeof worker.distance ===
      "number" &&
    Number.isFinite(
      worker.distance,
    ) &&
    worker.distance >= 0
      ? worker.distance
      : null;

  const arrival =
    useMemo(
      () =>
        safeDistance !== null
          ? calculateArrivalTime(
              safeDistance,
            )
          : null,
      [
        safeDistance,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          LOCATION
      ====================================================== */}

      <View
        style={
          styles.row
        }
      >
        <AppIcon
          name="location"
          role="customer"
          size="sm"
          state="muted"
        />

        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              Colors.textMuted
            }
            style={
              styles.loader
            }
          />
        ) : (
          <AppText
            variant="body"
            tone="secondary"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={
              styles.text
            }
          >
            {location}
          </AppText>
        )}
      </View>

      {/* ======================================================
          ARRIVAL
      ====================================================== */}

      {arrival ? (
        <View
          style={
            styles.row
          }
        >
          <AppIcon
            name="clock"
            role="customer"
            size="sm"
            color={
              Colors.info
            }
          />

          <AppText
            variant="body"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.arrival
            }
          >
            {arrival}

            {safeDistance !==
            null
              ? ` • ${safeDistance.toFixed(
                  1,
                )} km`
              : ""}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    row: {
      minHeight: 20,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    loader: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    text: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    arrival: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.info,
    },
  });

export default memo(
  WorkerLocation,
);