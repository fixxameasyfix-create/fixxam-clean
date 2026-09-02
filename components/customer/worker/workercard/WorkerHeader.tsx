import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import type {
  WorkerCardData,
} from "../types";

type Props = {
  worker: WorkerCardData;
  onProfilePress: () => void;
};

export default function WorkerHeader({
  worker,
  onProfilePress,
}: Props) {
  const workerName =
    worker.fullName?.trim() ||
    `${worker.firstName} ${worker.surname}`
      .replace(/\s+/g, " ")
      .trim() ||
    "Worker";

  const photoUrl =
    worker.workerProfile?.photoUrl?.trim() ||
    "";

  const categoryText = [
    worker.category,
    worker.subcategory,
  ]
    .filter(
      (
        value,
      ): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    )
    .join(" • ");

  return (
    <View style={styles.container}>
      {/* ======================================================
          PHOTO
      ====================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.avatarContainer,
          pressed && styles.avatarPressed,
        ]}
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={`View ${workerName} profile`}
      >
        {photoUrl ? (
          <Image
            source={{
              uri: photoUrl,
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View
            style={styles.avatarPlaceholder}
          >
            <Ionicons
              name="person-outline"
              size={34}
              color="#94A3B8"
            />
          </View>
        )}

        {worker.online && (
          <View
            style={styles.onlineDot}
          />
        )}

        <View
          style={styles.profileBadge}
        >
          <Ionicons
            name="add"
            size={14}
            color="#FFFFFF"
          />
        </View>
      </Pressable>

      {/* ======================================================
          NAME + CATEGORY
      ====================================================== */}

      <View style={styles.content}>
        <AppText
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.name}
        >
          {workerName}
        </AppText>

        <AppText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.category}
        >
          {categoryText ||
            "Service Provider"}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatarContainer: {
    position: "relative",
    width: 72,
    height: 72,
    marginRight: 16,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5E7EB",
  },

  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPressed: {
    opacity: 0.85,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  profileBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  content: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },

  name: {
    fontSize: 18,
    lineHeight: 23,
    color: "#0F172A",
  },

  category: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
});