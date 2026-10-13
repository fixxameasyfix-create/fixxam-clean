import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workerName: string;

  /*
   * Exact customer-facing service address
   * selected by the provider.
   */
  address?: string;

  state?: string;

  lga?: string;

  latitude?: number | null;

  longitude?: number | null;

  loading?: boolean;

  disabled?: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: string | null | undefined,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COORDINATE VALIDATION
============================================================== */

function isValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
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

function RequestProviderLocation({
  workerName,
  address,
  state,
  lga,
  latitude,
  longitude,
  loading = false,
  disabled = false,
}: Props) {
  /* ============================================================
     NORMALIZED DATA
  ============================================================ */

  const cleanWorkerName =
    cleanString(
      workerName,
    ) || "the provider";

  const cleanAddress =
    cleanString(
      address,
    );

  const cleanState =
    cleanString(
      state,
    );

  const cleanLga =
    cleanString(
      lga,
    );

  const hasCoordinates =
    isValidCoordinates(
      latitude,
      longitude,
    );

  /*
   * A provider location is only considered
   * complete when we have:
   *
   * - exact service address
   * - state
   * - LGA
   * - valid coordinates
   *
   * This prevents legacy State/LGA data from
   * being treated as a real visit destination.
   */
  const hasCompleteLocation =
    Boolean(
      cleanAddress &&
      cleanState &&
      cleanLga &&
      hasCoordinates,
    );

  /* ============================================================
     LOCALITY
  ============================================================ */

  const locality =
    useMemo(
      () =>
        [
          cleanLga,
          cleanState,
        ]
          .filter(
            Boolean,
          )
          .join(
            ", ",
          ),
      [
        cleanLga,
        cleanState,
      ],
    );

  /* ============================================================
     ACCESSIBILITY LABEL
  ============================================================ */

  const accessibilityLocation =
    useMemo(
      () => {
        if (
          !hasCompleteLocation
        ) {
          return "Provider service location unavailable";
        }

        return [
          cleanAddress,
          locality,
        ]
          .filter(
            Boolean,
          )
          .join(
            ", ",
          );
      },
      [
        cleanAddress,
        hasCompleteLocation,
        locality,
      ],
    );

  /* ============================================================
     OPEN MAP
  ============================================================ */

  const handleOpenMap =
    useCallback(
      async () => {
        if (
          disabled ||
          loading
        ) {
          return;
        }

        if (
          !hasCompleteLocation ||
          latitude == null ||
          longitude == null
        ) {
          Alert.alert(
            "Location unavailable",
            "This provider has not added a complete service location yet.",
          );

          return;
        }

        const label =
          encodeURIComponent(
            `${cleanWorkerName} - Fixxam`,
          );

        /*
         * Coordinates remain the authoritative
         * destination.
         *
         * We do not search Maps using the text
         * address because geocoding may point
         * to a different location.
         */
        const url =
          Platform.OS === "ios"
            ? `https://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        try {
          const supported =
            await Linking.canOpenURL(
              url,
            );

          if (
            !supported
          ) {
            Alert.alert(
              "Maps unavailable",
              "We couldn't open a maps app on this device.",
            );

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
              "OPEN_PROVIDER_SERVICE_LOCATION_ERROR:",
              {
                workerName:
                  cleanWorkerName,

                latitude,

                longitude,

                error,
              },
            );
          }

          Alert.alert(
            "Maps unavailable",
            "We couldn't open this provider location. Please try again.",
          );
        }
      },
      [
        cleanWorkerName,
        disabled,
        hasCompleteLocation,
        latitude,
        loading,
        longitude,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <View
        style={
          styles.locationField
        }
        accessibilityRole="progressbar"
        accessibilityLabel="Getting provider service location"
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.content
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
          >
            Getting provider location...
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Please wait a moment.
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     MISSING LOCATION
  ============================================================ */

  if (
    !hasCompleteLocation
  ) {
    return (
      <View
        style={[
          styles.locationField,
          styles.locationFieldUnavailable,

          disabled
            ? styles.disabled
            : null,
        ]}
        accessible
        accessibilityLabel="Provider service location unavailable"
      >
        <View
          style={[
            styles.iconContainer,
            styles.unavailableIconContainer,
          ]}
        >
          <MaterialCommunityIcons
            name="map-marker-alert-outline"
            size={26}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.content
          }
        >
          <AppText
            variant="caption"
            tone="muted"
          >
            Provider service location
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.unavailableTitle
            }
          >
            Location unavailable
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            The provider has not added a complete service location yet.
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     COMPLETE PROVIDER LOCATION
  ============================================================ */

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Provider service location: ${accessibilityLocation}`}
      accessibilityHint="Opens this service location in Maps"
      accessibilityState={{
        disabled,
      }}
      disabled={
        disabled
      }
      onPress={
        handleOpenMap
      }
      style={({
        pressed,
      }) => [
        styles.locationField,
        styles.locationFieldAvailable,

        pressed &&
        !disabled
          ? styles.pressed
          : null,

        disabled
          ? styles.disabled
          : null,
      ]}
    >
      {/* ======================================================
          LOCATION ICON
      ====================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <MaterialCommunityIcons
          name="store-marker-outline"
          size={26}
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ======================================================
          LOCATION DETAILS
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="caption"
          tone="muted"
        >
          Provider service location
        </AppText>

        {/* Exact address */}

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={3}
          ellipsizeMode="tail"
          style={
            styles.address
          }
        >
          {cleanAddress}
        </AppText>

        {/* LGA + State */}

        {locality ? (
          <View
            style={
              styles.localityRow
            }
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={15}
              color={
                Colors.textMuted
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={2}
              style={
                styles.locality
              }
            >
              {locality}
            </AppText>
          </View>
        ) : null}

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.subtitle
          }
        >
          Tap to view this location and get directions.
        </AppText>
      </View>

      {/* ======================================================
          MAP ACTION
      ====================================================== */}

      <View
        style={
          styles.mapAction
        }
      >
        <MaterialCommunityIcons
          name="map-outline"
          size={21}
          color={
            CustomerColors.primary
          }
        />

        <MaterialCommunityIcons
          name="chevron-right"
          size={21}
          color={
            CustomerColors.primary
          }
        />
      </View>
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    locationField: {
      width:
        "100%",

      minHeight:
        96,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    locationFieldAvailable: {
      borderColor:
        Colors.border,
    },

    locationFieldUnavailable: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width:
        48,

      height:
        48,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    unavailableIconContainer: {
      opacity:
        0.85,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    address: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,

      lineHeight:
        21,
    },

    localityRow: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        3,
    },

    locality: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textSecondary,

      lineHeight:
        17,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        18,

      color:
        Colors.textSecondary,
    },

    unavailableTitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       MAP ACTION
    ======================================================== */

    mapAction: {
      minWidth:
        46,

      height:
        40,

      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });

export default memo(
  RequestProviderLocation,
);