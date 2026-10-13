import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  receiverName?: string | null;

  receiverPhone?: string | null;

  address?: string | null;

  latitude?: number | null;

  longitude?: number | null;
};

/* ============================================================
   HELPERS
============================================================ */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const normalized =
    value.trim();

  return (
    normalized ||
    fallback
  );
}

function isValidLatitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= -180 &&
    value <= 180
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketDelivery({
  receiverName,
  address,
  latitude,
  longitude,
}: Props) {
  const normalizedReceiverName =
    useMemo(
      () =>
        safeString(
          receiverName,
          "Customer",
        ),
      [
        receiverName,
      ],
    );

  const normalizedAddress =
    useMemo(
      () =>
        safeString(
          address,
          "Delivery address unavailable",
        ),
      [
        address,
      ],
    );

  const hasCoordinates =
    useMemo(
      () =>
        isValidLatitude(
          latitude,
        ) &&
        isValidLongitude(
          longitude,
        ),
      [
        latitude,
        longitude,
      ],
    );

  const hasAddress =
    normalizedAddress !==
    "Delivery address unavailable";

  const canOpenDirections =
    hasCoordinates ||
    hasAddress;

  /* ==========================================================
     OPEN DIRECTIONS
  ========================================================== */

  const handleDirections =
    useCallback(async () => {
      if (
        !canOpenDirections
      ) {
        Toast.show({
          type:
            "info",

          text1:
            "Location unavailable",

          text2:
            "Delivery location is not available for this order.",
        });

        return;
      }

      try {
        const destination =
          hasCoordinates
            ? `${latitude},${longitude}`
            : normalizedAddress;

        const url =
          `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            destination,
          )}`;

        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (
          !supported
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Maps unavailable",

            text2:
              "Unable to open directions on this device.",
          });

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (
        error
      ) {
        if (
          __DEV__
        ) {
          console.warn(
            "WORKER_MARKET_OPEN_DIRECTIONS_ERROR",
            error,
          );
        }

        Toast.show({
          type:
            "error",

          text1:
            "Unable to open directions",

          text2:
            "Please try again.",
        });
      }
    }, [
      canOpenDirections,
      hasCoordinates,
      latitude,
      longitude,
      normalizedAddress,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="bodyLarge"
        weight="bold"
        style={
          styles.title
        }
      >
        Delivery
      </AppText>

      {/* ======================================================
          ADDRESS
      ====================================================== */}

      <View
        style={
          styles.addressRow
        }
      >
        <View
          style={
            styles.locationIcon
          }
        >
          <AppIcon
            name="location"
            size="sm"
            color={
              Colors.info
            }
          />
        </View>

        <View
          style={
            styles.addressContent
          }
        >
          <AppText
            variant="caption"
            style={
              styles.label
            }
          >
            Delivery address
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="medium"
            numberOfLines={3}
            style={
              styles.address
            }
          >
            {normalizedAddress}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          META
      ====================================================== */}

      <View
        style={
          styles.metaRow
        }
      >
        <View
          style={
            styles.receiver
          }
        >
          <AppIcon
            name="profile"
            size="xs"
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="caption"
            numberOfLines={1}
            style={
              styles.receiverName
            }
          >
            {normalizedReceiverName}
          </AppText>
        </View>

        <View
          style={
            styles.locationStatus
          }
        >
          <View
            style={[
              styles.locationDot,

              hasCoordinates
                ? styles.locationDotActive
                : null,
            ]}
          />

          <AppText
            variant="caption"
            numberOfLines={1}
            style={
              styles.locationStatusText
            }
          >
            {hasCoordinates
              ? "GPS available"
              : hasAddress
                ? "Address only"
                : "Location unavailable"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          DIRECTIONS
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Get directions"
        accessibilityHint="Open the customer's delivery location in maps"
        accessibilityState={{
          disabled:
            !canOpenDirections,
        }}
        disabled={
          !canOpenDirections
        }
        onPress={
          handleDirections
        }
        style={({
          pressed,
        }) => [
          styles.directionsButton,

          !canOpenDirections
            ? styles.disabled
            : null,

          pressed &&
          canOpenDirections
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="navigation"
          size="xs"
          color={
            WorkerColors.primary
          }
        />

        <AppText
          variant="bodyMedium"
          weight="medium"
          numberOfLines={1}
          style={
            styles.directionsText
          }
        >
          Get directions
        </AppText>

        <AppIcon
          name="next"
          size="xs"
          color={
            WorkerColors.primary
          }
        />
      </Pressable>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketDelivery.displayName =
  "WorkerMarketDelivery";

export default memo(
  WorkerMarketDelivery,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       ADDRESS
    ======================================================== */

    addressRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    locationIcon: {
      width:
        36,

      height:
        36,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.infoSoft,
    },

    addressContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    label: {
      color:
        Colors.textMuted,
    },

    address: {
      marginTop:
        2,

      lineHeight:
        19,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       META
    ======================================================== */

    metaRow: {
      minHeight:
        32,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    receiver: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    receiverName: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textSecondary,
    },

    locationStatus: {
      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    locationDot: {
      width:
        5,

      height:
        5,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.textMuted,
    },

    locationDotActive: {
      backgroundColor:
        Colors.success,
    },

    locationStatusText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DIRECTIONS
    ======================================================== */

    directionsButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    directionsText: {
      flex:
        1,

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

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