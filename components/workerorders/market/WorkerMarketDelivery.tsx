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
  AppButton,
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

function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizePhoneForCall(
  value: string,
): string {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  const hasLeadingPlus =
    trimmed.startsWith(
      "+",
    );

  const digits =
    trimmed.replace(
      /\D/g,
      "",
    );

  if (!digits) {
    return "";
  }

  return hasLeadingPlus
    ? `+${digits}`
    : digits;
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
  receiverPhone,
  address,
  latitude,
  longitude,
}: Props) {
  /* ==========================================================
     DISPLAY VALUES
  ========================================================== */

  const name =
    useMemo(
      () =>
        normalizeString(
          receiverName,
        ) ||
        "Customer",
      [
        receiverName,
      ],
    );

  const displayPhone =
    useMemo(
      () =>
        normalizeString(
          receiverPhone,
        ),
      [
        receiverPhone,
      ],
    );

  const callablePhone =
    useMemo(
      () =>
        normalizePhoneForCall(
          displayPhone,
        ),
      [
        displayPhone,
      ],
    );

  const deliveryAddress =
    useMemo(
      () =>
        normalizeString(
          address,
        ) ||
        "Delivery address unavailable",
      [
        address,
      ],
    );

  const hasCoordinates =
    isValidLatitude(
      latitude,
    ) &&
    isValidLongitude(
      longitude,
    );

  /* ==========================================================
     OPEN MAP
  ========================================================== */

  const handleOpenMap =
    useCallback(
      async () => {
        if (
          !hasCoordinates
        ) {
          Toast.show({
            type: "info",

            text1:
              "GPS unavailable",

            text2:
              "This order does not have valid GPS coordinates.",
          });

          return;
        }

        const url =
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        try {
          const supported =
            await Linking.canOpenURL(
              url,
            );

          if (!supported) {
            Toast.show({
              type: "error",

              text1:
                "Unable to open Maps",

              text2:
                "Please check your Maps application.",
            });

            return;
          }

          await Linking.openURL(
            url,
          );
        } catch (error) {
          console.error(
            "WORKER_MARKET_OPEN_MAP_ERROR:",
            error,
          );

          Toast.show({
            type: "error",

            text1:
              "Unable to open Maps",

            text2:
              "Please try again.",
          });
        }
      },
      [
        hasCoordinates,
        latitude,
        longitude,
      ],
    );

  /* ==========================================================
     CALL RECEIVER
  ========================================================== */

  const handleCall =
    useCallback(
      async () => {
        if (
          !callablePhone
        ) {
          Toast.show({
            type: "info",

            text1:
              "Phone unavailable",

            text2:
              "The delivery recipient does not have a valid phone number.",
          });

          return;
        }

        const phoneUrl =
          `tel:${callablePhone}`;

        try {
          const supported =
            await Linking.canOpenURL(
              phoneUrl,
            );

          if (!supported) {
            Toast.show({
              type: "error",

              text1:
                "Calling unavailable",

              text2:
                "Your device cannot make phone calls.",
            });

            return;
          }

          await Linking.openURL(
            phoneUrl,
          );
        } catch (error) {
          console.error(
            "WORKER_MARKET_DELIVERY_CALL_ERROR:",
            error,
          );

          Toast.show({
            type: "error",

            text1:
              "Unable to call recipient",

            text2:
              "Please try again.",
          });
        }
      },
      [
        callablePhone,
      ],
    );

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

      <View
        style={
          styles.header
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.title
          }
        >
          Delivery
        </AppText>

        {hasCoordinates ? (
          <Pressable
            onPress={
              handleOpenMap
            }
            accessibilityRole="button"
            accessibilityLabel="Open delivery location in Maps"
            style={({
              pressed,
            }) => [
              styles.gpsButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="location"
              size="xs"
              color={
                Colors.success
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.gpsText
              }
            >
              GPS
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          RECEIVER
      ====================================================== */}

      <View
        style={
          styles.receiverRow
        }
      >
        <View
          style={
            styles.receiverIcon
          }
        >
          <AppIcon
            name="profile"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.receiverContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.receiverName
            }
          >
            {name}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.receiverLabel
            }
          >
            Delivery recipient
          </AppText>

          {displayPhone ? (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.receiverPhone
              }
            >
              {displayPhone}
            </AppText>
          ) : null}
        </View>

        {callablePhone ? (
          <Pressable
            onPress={
              handleCall
            }
            accessibilityRole="button"
            accessibilityLabel={`Call ${name}`}
            style={({
              pressed,
            }) => [
              styles.callButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="phone"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </Pressable>
        ) : null}
      </View>

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
            styles.addressIcon
          }
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

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.addressText
          }
        >
          {deliveryAddress}
        </AppText>
      </View>

      {/* ======================================================
          OPEN MAP
      ====================================================== */}

      {hasCoordinates ? (
        <View
          style={
            styles.mapAction
          }
        >
          <AppButton
            title="OPEN LOCATION"
            role="worker"
            variant="outline"
            leftIconName="navigation"
            onPress={
              handleOpenMap
            }
            style={
              styles.mapButton
            }
          />
        </View>
      ) : null}
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
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,

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
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    gpsButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

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

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    gpsText: {
      color:
        Colors.success,
    },

    /* ========================================================
       RECEIVER
    ======================================================== */

    receiverRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    receiverIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    receiverContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    receiverName: {
      color:
        Colors.textPrimary,
    },

    receiverLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    receiverPhone: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    callButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       ADDRESS
    ======================================================== */

    addressRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    addressIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    addressText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MAP
    ======================================================== */

    mapAction: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    mapButton: {
      width: "100%",
    },

    /* ========================================================
       STATE
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