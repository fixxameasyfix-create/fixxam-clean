import React from "react";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  name: string;
  photoUrl?: string;
  category?: string;
  online?: boolean;
  distance?: number;
};

/* ==============================================================
   COMPONENT
============================================================== */

export default function RequestWorkerCard({
  name,
  photoUrl,
  category = "Service Provider",
  online = false,
  distance,
}: Props) {
  const safeDistance =
    typeof distance === "number" &&
    Number.isFinite(distance)
      ? Math.max(0, distance)
      : undefined;

  return (
    <View style={styles.card}>
      {/* ======================================================
          AVATAR
      ====================================================== */}

      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons
                name="person-outline"
                size={32}
                color="#94A3B8"
              />
            </View>
          )}
        </View>

        {/* ONLINE DOT */}

        <View
          style={[
            styles.statusDot,
            online
              ? styles.statusOnline
              : styles.statusOffline,
          ]}
        />
      </View>

      {/* ======================================================
          WORKER INFO
      ====================================================== */}

      <View style={styles.content}>
        {/* NAME */}

        <AppText
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.name}
        >
          {name}
        </AppText>

        {/* CATEGORY */}

        <AppText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.category}
        >
          {category}
        </AppText>

        {/* ==================================================
            DISTANCE + AVAILABLE
        ================================================== */}

        <View style={styles.metaRow}>
          {/* DISTANCE */}

          {safeDistance !== undefined && (
            <View style={styles.distanceRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#D97706"
              />

              <AppText
                weight="bold"
                style={styles.distanceText}
              >
                {safeDistance.toFixed(1)} km away
              </AppText>
            </View>
          )}

          {/* AVAILABLE — SAME STYLE AS WORKER LIST */}

          <View
            style={[
              styles.availablePill,
              safeDistance !== undefined &&
                styles.availableSpacing,
            ]}
          >
            <View
              style={[
                styles.availableDot,
                online
                  ? styles.availableDotOnline
                  : styles.availableDotOffline,
              ]}
            />

            <AppText
              weight="bold"
              style={[
                styles.availableText,
                online
                  ? styles.availableTextOnline
                  : styles.availableTextOffline,
              ]}
            >
              {online ? "Available" : "Offline"}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  /* ============================================================
     CARD
  ============================================================ */

  card: {
    width: "100%",

    minHeight: 132,

    paddingHorizontal: 14,
    paddingVertical: 13,

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    flexDirection: "row",

    alignItems: "center",

    shadowColor: "#0F172A",
    shadowOpacity: 0.045,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  /* ============================================================
     AVATAR
  ============================================================ */

  avatarWrapper: {
    position: "relative",

    width: 88,
    height: 88,

    marginRight: 13,

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  avatarRing: {
    width: 82,
    height: 82,

    borderRadius: 41,

    padding: 3,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  avatar: {
    width: "100%",
    height: "100%",

    borderRadius: 38,

    backgroundColor: "#E2E8F0",
  },

  avatarPlaceholder: {
    flex: 1,

    borderRadius: 38,

    backgroundColor: "#E2E8F0",

    alignItems: "center",
    justifyContent: "center",
  },

  /* ============================================================
     ONLINE DOT
  ============================================================ */

  statusDot: {
    position: "absolute",

    right: 0,
    bottom: 2,

    width: 20,
    height: 20,

    borderRadius: 10,

    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  statusOnline: {
    backgroundColor: "#22C55E",
  },

  statusOffline: {
    backgroundColor: "#94A3B8",
  },

  /* ============================================================
     CONTENT
  ============================================================ */

  content: {
    flex: 1,
    minWidth: 0,
  },

  /* ============================================================
     NAME
  ============================================================ */

  name: {
    fontSize: 18,
    lineHeight: 23,

    color: "#0F172A",
  },

  /* ============================================================
     CATEGORY
  ============================================================ */

  category: {
    marginTop: 3,

    fontSize: 13,
    lineHeight: 18,

    color: "#64748B",
  },

  /* ============================================================
     META
  ============================================================ */

  metaRow: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",

    marginTop: 8,
  },

  /* ============================================================
     DISTANCE
  ============================================================ */

  distanceRow: {
    flexDirection: "row",

    alignItems: "center",

    flexShrink: 1,
  },

  distanceText: {
    marginLeft: 5,

    fontSize: 12,
    lineHeight: 17,

    color: "#D97706",
  },

  /* ============================================================
     AVAILABLE PILL
     SAME STYLE AS WORKER LIST
  ============================================================ */

  availablePill: {
    minHeight: 30,

    paddingHorizontal: 11,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8F0",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,
  },

  availableSpacing: {
    marginLeft: 9,
  },

  availableDot: {
    width: 9,
    height: 9,

    borderRadius: 4.5,

    marginRight: 7,
  },

  availableDotOnline: {
    backgroundColor: "#22C55E",
  },

  availableDotOffline: {
    backgroundColor: "#94A3B8",
  },

  availableText: {
    fontSize: 12,

    lineHeight: 17,
  },

  availableTextOnline: {
    color: "#334155",
  },

  availableTextOffline: {
    color: "#64748B",
  },
});