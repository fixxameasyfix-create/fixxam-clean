import React, { memo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  loading: boolean;
  permissionGranted: boolean;
  address: string;
  onRefresh: () => void;
};

function BookingCurrentLocation({
  loading,
  permissionGranted,
  address,
  onRefresh,
}: Props) {
  const cleanAddress = address.trim();
  const unavailable = !permissionGranted;

  const buttonDisabled = loading || unavailable;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* LOCATION ICON */}
        <View style={styles.iconBox}>
          <Ionicons
            name="location"
            size={19}
            color="#2563EB"
          />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText
              weight="bold"
              style={styles.title}
            >
              Current location
            </AppText>

            {loading && (
              <ActivityIndicator
                size="small"
                color="#2563EB"
                style={styles.loader}
              />
            )}
          </View>

          <AppText
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.address}
          >
            {cleanAddress ||
              "Getting your current location..."}
          </AppText>
        </View>

        {/* REFRESH BUTTON */}
        <Pressable
          onPress={onRefresh}
          disabled={buttonDisabled}
          accessibilityRole="button"
          accessibilityLabel="Refresh current location"
          accessibilityState={{
            disabled: buttonDisabled,
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.refreshButton,
            buttonDisabled && styles.refreshDisabled,
            pressed &&
              !buttonDisabled &&
              styles.refreshPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#2563EB"
            />
          )}
        </Pressable>
      </View>

      {/* PERMISSION MESSAGE */}
      {unavailable && (
        <View style={styles.permissionRow}>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color="#D97706"
          />

          <AppText style={styles.permissionText}>
            Location permission is required to use your
            current location.
          </AppText>
        </View>
      )}
    </View>
  );
}

export default memo(BookingCurrentLocation);

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  card: {
    minHeight: 74,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 11,
    paddingVertical: 10,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    borderRadius: 16,

    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  iconBox: {
    width: 42,
    height: 42,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",

    marginRight: 10,
  },

  content: {
    flex: 1,
    minWidth: 0,

    justifyContent: "center",

    paddingRight: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 19,
  },

  title: {
    fontSize: 13.5,
    lineHeight: 19,

    color: "#0F172A",
  },

  loader: {
    marginLeft: 7,
  },

  address: {
    marginTop: 2,

    fontSize: 11.5,
    lineHeight: 16,

    color: "#64748B",
  },

  refreshButton: {
    width: 36,
    height: 36,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  refreshDisabled: {
    opacity: 0.4,
  },

  refreshPressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  permissionRow: {
    flexDirection: "row",
    alignItems: "flex-start",

    marginTop: 6,
    paddingHorizontal: 3,
  },

  permissionText: {
    flex: 1,

    marginLeft: 5,

    fontSize: 10.5,
    lineHeight: 15,

    color: "#92400E",
  },
});