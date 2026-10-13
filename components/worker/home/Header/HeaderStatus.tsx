import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  available?: boolean;

  rating?: number;

  location?: string;
};

type StatusChipProps = {
  icon: AppIconName;

  iconColor: string;

  iconBackground: string;

  label: string;

  labelColor?: string;
};

/* ============================================================
   STATUS CHIP
============================================================ */

const StatusChip =
  memo(
    function StatusChip({
      icon,
      iconColor,
      iconBackground,
      label,
      labelColor = Colors.textPrimary,
    }: StatusChipProps) {
      return (
        <View
          style={
            styles.chip
          }
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  iconBackground,
              },
            ]}
          >
            <AppIcon
              name={
                icon
              }
              size="xs"
              color={
                iconColor
              }
            />
          </View>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.label,
              {
                color:
                  labelColor,
              },
            ]}
          >
            {label}
          </AppText>
        </View>
      );
    },
  );

StatusChip.displayName =
  "HeaderStatusChip";

/* ============================================================
   COMPONENT
============================================================ */

function HeaderStatus({
  available = false,
  rating = 0,
  location = "",
}: Props) {
  /* ==========================================================
     RATING
  ========================================================== */

  const safeRating =
    useMemo(() => {
      if (
        typeof rating !==
          "number" ||
        !Number.isFinite(
          rating,
        )
      ) {
        return 0;
      }

      return Math.min(
        5,
        Math.max(
          0,
          rating,
        ),
      );
    }, [
      rating,
    ]);

  /* ==========================================================
     LOCATION
  ========================================================== */

  const safeLocation =
    useMemo(() => {
      if (
        typeof location !==
        "string"
      ) {
        return "Location unavailable";
      }

      return (
        location.trim() ||
        "Location unavailable"
      );
    }, [
      location,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          AVAILABILITY

          ONLINE:
          - Available
          - Green icon
          - Green text
          - Green soft background

          OFFLINE:
          - Offline
          - Grey icon
          - Grey text
          - Grey background
      ====================================================== */}

      <StatusChip
        icon={
          available
            ? "success"
            : "wifi-off"
        }
        iconColor={
          available
            ? Colors.success
            : Colors.textMuted
        }
        iconBackground={
          available
            ? Colors.successSoft
            : Colors.disabledBackground
        }
        label={
          available
            ? "Available"
            : "Offline"
        }
        labelColor={
          available
            ? Colors.success
            : Colors.textMuted
        }
      />

      {/* ======================================================
          RATING
      ====================================================== */}

      <StatusChip
        icon="star"
        iconColor={
          Colors.warning
        }
        iconBackground={
          Colors.warningSoft
        }
        label={
          safeRating.toFixed(
            1,
          )
        }
      />

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <StatusChip
        icon="location"
        iconColor={
          WorkerColors.primary
        }
        iconBackground={
          WorkerColors.primarySoft
        }
        label={
          safeLocation
        }
      />
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

HeaderStatus.displayName =
  "HeaderStatus";

export default memo(
  HeaderStatus,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       CHIP
    ======================================================== */

    chip: {
      minWidth: 0,

      minHeight: 36,

      paddingLeft:
        FixxamTokens.spacing.xs,

      paddingRight:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    iconContainer: {
      width: 24,

      height: 24,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    label: {
      flexShrink: 1,

      marginLeft:
        FixxamTokens.spacing.xs,
    },
  });