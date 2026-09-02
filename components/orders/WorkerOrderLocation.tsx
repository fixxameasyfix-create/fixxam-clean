import React, { memo, useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  onViewLocation: () => void;
};

const WorkerOrderLocation = memo(
  function WorkerOrderLocation({
    address,
    latitude,
    longitude,
    onViewLocation,
  }: Props) {
    const hasCoordinates = useMemo(
      () =>
        typeof latitude === "number" &&
        Number.isFinite(latitude) &&
        typeof longitude === "number" &&
        Number.isFinite(longitude),
      [latitude, longitude],
    );

    return (
      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons
            name="location-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <View style={styles.info}>
          <AppText
            weight="bold"
            numberOfLines={3}
            style={styles.title}
          >
            {address?.trim() ||
              "Location unavailable"}
          </AppText>

          <AppText
            style={styles.subtitle}
          >
            {hasCoordinates
              ? "Location coordinates available"
              : "Address only"}
          </AppText>
        </View>

        <Pressable
          onPress={onViewLocation}
          accessibilityRole="button"
          accessibilityLabel="View service location on map"
          style={({ pressed }) => [
            styles.mapButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="map-outline"
            size={17}
            color="#2563EB"
          />

          <AppText
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

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    padding: 11,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  title: {
    fontSize: 11,
    lineHeight: 16,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9.5,
    color: "#64748B",
  },

  mapButton: {
    minWidth: 50,
    height: 37,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },

  mapText: {
    fontSize: 8,
    color: "#2563EB",
  },

  pressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});