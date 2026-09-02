import React, { memo } from "react";

import {
  View,
  Image,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import BookingCard from "./BookingCard";

type Props = {
  workerName: string;
  workerPhoto?: string;
  serviceName: string;
  rating?: number;
  reviews?: number;
  verified?: boolean;
  online?: boolean;
  distance?: string;
  eta?: string;
  location?: string;
};

function BookingHeader({
  workerName,
  workerPhoto,
  serviceName,
  rating = 5,
  reviews = 0,
  verified = true,
  online = true,
  distance = "2.4 km",
  eta = "18 mins",
  location = "Current Area",
}: Props) {
  return (
    <BookingCard>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          {workerPhoto ? (
            <Image
              source={{ uri: workerPhoto }}
              resizeMode="cover"
              accessible
              accessibilityLabel={workerName}
              style={[
                styles.photo,
                online
                  ? styles.onlineRing
                  : styles.offlineRing,
              ]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                online
                  ? styles.onlineRing
                  : styles.offlineRing,
              ]}
            >
              <Ionicons
                name="person"
                size={38}
                color="#64748B"
              />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <AppText
              weight="bold"
              style={styles.name}
            >
              {workerName}
            </AppText>

            {verified && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#2563EB"
                style={styles.verified}
              />
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Ionicons
                name="star"
                size={13}
                color="#F59E0B"
              />

              <AppText style={styles.badgeText}>
                {rating.toFixed(1)} ({reviews})
              </AppText>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.serviceChip}>
              <Ionicons
                name="construct"
                size={13}
                color="#EA580C"
              />

              <AppText style={styles.serviceText}>
                {serviceName}
              </AppText>
            </View>

            <View style={styles.etaChip}>
              <Ionicons
                name="time-outline"
                size={13}
                color="#2563EB"
              />

              <AppText style={styles.etaText}>
                {eta}
              </AppText>
            </View>
          </View>

          <AppText style={styles.location}>
            📍 {location} • {distance}
          </AppText>
        </View>
      </View>
    </BookingCard>
  );
}

export default memo(BookingHeader);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    position: "relative",
  },

  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  onlineRing: {
    borderWidth: 3,
    borderColor: "#22C55E",
  },

  offlineRing: {
    borderWidth: 3,
    borderColor: "#EF4444",
  },

  info: {
    flex: 1,
    marginLeft: 16,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    color: "#111827",
  },

  verified: {
    marginLeft: 6,
  },

  metaRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
  },

  badgeText: {
    marginLeft: 4,
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  serviceText: {
    marginLeft: 6,
    color: "#EA580C",
    fontWeight: "700",
    fontSize: 13,
  },

  etaChip: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 28,
  },

  etaText: {
    marginLeft: 5,
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },

  location: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});