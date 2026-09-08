import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
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
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  address: string;

  latitude?: number | null;

  longitude?: number | null;

  onViewLocation: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function hasValidCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): boolean {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerOrderLocation = memo(
  function WorkerOrderLocation({
    address,
    latitude,
    longitude,
    onViewLocation,
  }: Props) {
    const safeAddress =
      useMemo(
        () =>
          typeof address === "string"
            ? address.trim()
            : "",
        [address],
      );

    const coordinatesAvailable =
      useMemo(
        () =>
          hasValidCoordinates(
            latitude,
            longitude,
          ),
        [
          latitude,
          longitude,
        ],
      );

    return (
      <View
        style={styles.card}
        accessible
        accessibilityLabel={`Service location. ${
          safeAddress ||
          "Location unavailable"
        }`}
      >
        {/* ====================================================
            LOCATION ICON
        ==================================================== */}

        <View
          style={styles.icon}
        >
          <AppIcon
            name="location"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        {/* ====================================================
            LOCATION INFO
        ==================================================== */}

        <View
          style={styles.info}
        >
          <AppText
            variant="body"
            weight="bold"
            numberOfLines={3}
            style={styles.title}
          >
            {safeAddress ||
              "Location unavailable"}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            {coordinatesAvailable
              ? "Location coordinates available"
              : "Address only"}
          </AppText>
        </View>

        {/* ====================================================
            MAP
        ==================================================== */}

        <Pressable
          onPress={onViewLocation}
          accessibilityRole="button"
          accessibilityLabel={
            coordinatesAvailable
              ? "View service location on map"
              : "View service address"
          }
          hitSlop={6}
          style={({ pressed }) => [
            styles.mapButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="navigation"
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={styles.mapText}
          >
            MAP
          </AppText>
        </Pressable>
      </View>
    );
  },
);

WorkerOrderLocation.displayName =
  "WorkerOrderLocation";

export default WorkerOrderLocation;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      padding:
        FixxamTokens.spacing.sm,

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

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       INFO
    ======================================================== */

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      lineHeight: 18,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       MAP BUTTON
    ======================================================== */

    mapButton: {
      minWidth:
        FixxamTokens.size
          .minimumTouchTarget,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    mapText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });