import React from "react";
import {
  StyleSheet,
  Switch,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  rating: number;
  reviewCount: number;
  online: boolean;
  onToggleOnline: (value: boolean) => void;
};

export default function WorkerStatusCard({
  rating,
  reviewCount,
  online,
  onToggleOnline,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.ratingIcon}>
          <Ionicons
            name="star"
            size={16}
            color="#F59E0B"
          />
        </View>

        <View>
          <AppText
            weight="bold"
            style={styles.rating}
          >
            {rating.toFixed(1)}
          </AppText>

          <AppText style={styles.reviewText}>
            {reviewCount}{" "}
            {reviewCount === 1
              ? "Review"
              : "Reviews"}
          </AppText>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: online
                  ? "#22C55E"
                  : "#94A3B8",
              },
            ]}
          />

          <AppText
            weight="medium"
            style={styles.statusText}
          >
            {online ? "Online" : "Offline"}
          </AppText>
        </View>

        <Switch
          value={online}
          onValueChange={onToggleOnline}
          trackColor={{
            false: "#CBD5E1",
            true: "#93C5FD",
          }}
          thumbColor={
            online ? "#2563EB" : "#FFFFFF"
          }
          style={{
            transform: [
              { scaleX: 0.75 },
              { scaleY: 0.75 },
            ],
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    height: 74,

    marginBottom: 14,

    paddingHorizontal: 16,
    paddingVertical: 10,

    borderRadius: 18,

    backgroundColor: "#EEF6FF",

    borderWidth: 1,
    borderColor: "#D7E8FF",

    shadowColor: "#2563EB",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  ratingIcon: {
    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor: "#DBEAFE",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,
  },

  rating: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  reviewText: {
    marginTop: 1,
    fontSize: 11,
    color: "#64748B",
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
});