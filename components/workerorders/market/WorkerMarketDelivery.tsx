import React, { memo, useCallback } from "react";

import {
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import Toast from "react-native-toast-message";

import {
  AppText,
} from "@/components/ui";

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
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidCoordinate(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
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
  const name =
    normalizeString(
      receiverName,
    ) || "Customer";

  const phone =
    normalizeString(
      receiverPhone,
    );

  const deliveryAddress =
    normalizeString(
      address,
    ) || "Delivery address unavailable";

  const hasCoordinates =
    isValidCoordinate(latitude) &&
    isValidCoordinate(longitude);

  /* ==========================================================
     OPEN MAP
  ========================================================== */

  const handleOpenMap =
    useCallback(
      async () => {
        if (!hasCoordinates) {
          Toast.show({
            type: "info",
            text1: "GPS unavailable",
            text2:
              "This order does not have GPS coordinates.",
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
              text1: "Unable to open Maps",
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
            text1: "Unable to open Maps",
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

  return (
    <View
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >
        <AppText
          weight="bold"
          style={styles.title}
        >
          Delivery
        </AppText>

        {hasCoordinates && (
          <Pressable
            onPress={
              handleOpenMap
            }
            accessibilityRole="button"
            accessibilityLabel="Open delivery location in Maps"
            style={({ pressed }) => [
              styles.gpsButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="location"
              size={14}
              color="#16A34A"
            />

            <AppText
              weight="bold"
              style={styles.gpsText}
            >
              GPS
            </AppText>
          </Pressable>
        )}
      </View>

      {/* ======================================================
          RECEIVER
      ====================================================== */}

      <View
        style={styles.receiverRow}
      >
        <View
          style={styles.receiverIcon}
        >
          <Ionicons
            name="person-outline"
            size={19}
            color="#2563EB"
          />
        </View>

        <View
          style={styles.receiverContent}
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.receiverName}
          >
            {name}
          </AppText>

          <AppText
            style={styles.receiverLabel}
          >
            Delivery recipient
          </AppText>
        </View>

        {phone ? (
          <Pressable
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Customer phone",
                text2: phone,
              });
            }}
            accessibilityRole="button"
            accessibilityLabel="View customer phone"
            style={({ pressed }) => [
              styles.callButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="call-outline"
              size={17}
              color="#2563EB"
            />
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          ADDRESS
      ====================================================== */}

      <View
        style={styles.addressRow}
      >
        <View
          style={styles.addressIcon}
        >
          <Ionicons
            name="location-outline"
            size={21}
            color="#2563EB"
          />
        </View>

        <AppText
          style={styles.addressText}
        >
          {deliveryAddress}
        </AppText>
      </View>

      {/* ======================================================
          OPEN MAP
      ====================================================== */}

      {hasCoordinates && (
        <Pressable
          onPress={
            handleOpenMap
          }
          accessibilityRole="button"
          accessibilityLabel="Open delivery location"
          style={({ pressed }) => [
            styles.mapButton,
            pressed &&
              styles.mapButtonPressed,
          ]}
        >
          <Ionicons
            name="navigate-outline"
            size={17}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={styles.mapButtonText}
          >
            OPEN LOCATION
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={16}
            color="#2563EB"
          />
        </Pressable>
      )}
    </View>
  );
}

export default memo(
  WorkerMarketDelivery,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    title: {
      fontSize: 16,
      color: "#0F172A",
    },

    gpsButton: {
      minHeight: 30,
      paddingHorizontal: 9,
      borderRadius: 9,
      backgroundColor: "#ECFDF5",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    gpsText: {
      fontSize: 8,
      color: "#15803D",
    },

    receiverRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },

    receiverIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    receiverContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    receiverName: {
      fontSize: 13,
      color: "#0F172A",
    },

    receiverLabel: {
      marginTop: 3,
      fontSize: 9.5,
      color: "#64748B",
    },

    callButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    addressRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    addressIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    addressText: {
      flex: 1,
      marginLeft: 10,
      paddingTop: 2,
      fontSize: 13,
      lineHeight: 20,
      color: "#475569",
    },

    mapButton: {
      height: 42,
      marginTop: 14,
      borderRadius: 12,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    mapButtonPressed: {
      opacity: 0.75,
    },

    mapButtonText: {
      fontSize: 9,
      color: "#2563EB",
    },

    pressed: {
      opacity: 0.7,
    },
  });