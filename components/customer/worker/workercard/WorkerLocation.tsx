import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import { calculateArrivalTime } from "@/utils/location/calculateArrivalTime";

import { resolvePlaceName } from "@/services/location/resolvePlaceName";

import type { WorkerCardData } from "./types";

type Props = {
  worker: WorkerCardData;
};

function getFallbackLocation(
  worker: WorkerCardData,
): string {
  const profile =
    worker.workerProfile;

  const fallback = [
    profile.lga,
    profile.state,
  ]
    .map((value) =>
      typeof value === "string"
        ? value.trim()
        : "",
    )
    .filter(Boolean)
    .join(", ");

  return (
    fallback ||
    profile.address?.trim() ||
    "Location unavailable"
  );
}

export default function WorkerLocation({
  worker,
}: Props) {
  const latitude =
    worker.workerProfile.latitude;

  const longitude =
    worker.workerProfile.longitude;

  const [
    placeName,
    setPlaceName,
  ] = useState<string | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaceName() {
      setLoading(true);

      const resolved =
        await resolvePlaceName({
          latitude,
          longitude,
        });

      if (cancelled) {
        return;
      }

      setPlaceName(resolved);

      setLoading(false);
    }

    void loadPlaceName();

    return () => {
      cancelled = true;
    };
  }, [
    latitude,
    longitude,
  ]);

  const location =
    placeName ||
    getFallbackLocation(worker);

  const arrival =
    worker.distance != null
      ? calculateArrivalTime(
          worker.distance,
        )
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons
          name="location-outline"
          size={18}
          color="#64748B"
        />

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#64748B"
            style={styles.loader}
          />
        ) : (
          <AppText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.text}
          >
            {location}
          </AppText>
        )}
      </View>

      {arrival && (
        <View style={styles.row}>
          <Ionicons
            name="time-outline"
            size={18}
            color="#F97316"
          />

          <AppText
            style={styles.arrival}
          >
            {arrival}
            {worker.distance != null &&
              ` • ${worker.distance.toFixed(
                1,
              )} km`}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 20,
  },

  loader: {
    marginLeft: 8,
  },

  text: {
    flex: 1,
    marginLeft: 8,
    color: "#475569",
    fontSize: 14,
  },

  arrival: {
    marginLeft: 8,
    color: "#F97316",
    fontWeight: "600",
    fontSize: 14,
  },
});