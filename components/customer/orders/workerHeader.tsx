import React, { useMemo } from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import type {
  WorkerCardData,
} from "@/components/customer/worker/workercard";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  worker: WorkerCardData;
  onProfilePress?: () => void;
  onCall?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerHeader({
  worker,
  onProfilePress,
  onCall,
}: Props) {
  /* ==========================================================
     PROFILE
  ========================================================== */

  const profile = worker.workerProfile;

  /* ==========================================================
     WORKER NAME
  ========================================================== */


/* ============================================================
   WORKER NAME
============================================================ */

const workerName = useMemo(() => {
  const firstName =
    typeof worker.firstName === "string"
      ? worker.firstName.trim()
      : "";

  const surname =
    typeof worker.surname === "string"
      ? worker.surname.trim()
      : "";

  const name = [firstName, surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Worker";
}, [
  worker.firstName,
  worker.surname,
]);

  /* ==========================================================
     PHOTO
  ========================================================== */

  const workerPhoto =
    typeof profile?.photoUrl === "string"
      ? profile.photoUrl.trim()
      : "";

  const imageSource = workerPhoto
    ? {
        uri: workerPhoto,
      }
    : require("@/assets/images/default-avatar.png");

  /* ==========================================================
     RATING
  ========================================================== */

  const parsedRating = Number(worker.rating);

  const rating = Number.isFinite(parsedRating)
    ? Math.max(0, Math.min(5, parsedRating))
    : 0;

  /* ==========================================================
     STATUS
  ========================================================== */

  const online = worker.online === true;

  const verified = worker.verified === true;

  /* ==========================================================
     PROFILE PRESS
  ========================================================== */

  const handleProfilePress = () => {
    if (!onProfilePress) {
      return;
    }

    onProfilePress();
  };

  /* ==========================================================
     CALL PRESS
  ========================================================== */

  const handleCall = () => {
    if (!onCall) {
      return;
    }

    onCall();
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppCard style={styles.card}>
      {/* ======================================================
          PROFILE BUTTON
      ====================================================== */}

      <Pressable
        onPress={handleProfilePress}
        disabled={!onProfilePress}
        style={({ pressed }) => [
          styles.profileButton,
          pressed && onProfilePress
            ? styles.profilePressed
            : undefined,
        ]}
        accessibilityRole={
          onProfilePress ? "button" : undefined
        }
        accessibilityLabel={
          onProfilePress
            ? `Open ${workerName}'s profile`
            : undefined
        }
      >
        {/* ====================================================
            AVATAR
        ==================================================== */}

        <View style={styles.avatarContainer}>
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`${workerName}'s profile photo`}
          />

          <View
            style={[
              styles.onlineDot,
              {
                backgroundColor: online
                  ? "#22C55E"
                  : "#EF4444",
              },
            ]}
          />
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View style={styles.content}>
          {/* NAME */}

          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.name}
          >
            {workerName}
          </AppText>

          {/* META */}

          <View style={styles.metaRow}>
            {/* RATING */}

            <View style={styles.metaItem}>
              <Ionicons
                name="star"
                size={13}
                color="#F59E0B"
              />

              <AppText style={styles.metaText}>
                {rating.toFixed(1)}
              </AppText>
            </View>

            {/* VERIFIED */}

            {verified ? (
              <View style={styles.metaItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#16A34A"
                />

                <AppText style={styles.metaText}>
                  Verified
                </AppText>
              </View>
            ) : null}

            {/* ONLINE */}

            <View style={styles.metaItem}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: online
                      ? "#22C55E"
                      : "#EF4444",
                  },
                ]}
              />

              <AppText
                style={[
                  styles.metaText,
                  {
                    color: online
                      ? "#15803D"
                      : "#DC2626",
                  },
                ]}
              >
                {online ? "Online" : "Offline"}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>

      {/* ======================================================
          CALL BUTTON
      ====================================================== */}

      {onCall ? (
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            styles.callButton,
            pressed && styles.callButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Call ${workerName}`}
          hitSlop={8}
        >
          <Ionicons
            name="call"
            size={19}
            color="#2563EB"
          />
        </Pressable>
      ) : null}
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",

    padding: 12,

    borderRadius: 18,

    marginBottom: 12,
  },

  profileButton: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    minWidth: 0,
  },

  profilePressed: {
    opacity: 0.75,
  },

  avatarContainer: {
    position: "relative",

    marginRight: 12,
  },

  image: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#F1F5F9",
  },

  onlineDot: {
    position: "absolute",

    right: 0,
    bottom: 0,

    width: 15,
    height: 15,

    borderRadius: 8,

    borderWidth: 2,

    borderColor: "#FFFFFF",
  },

  content: {
    flex: 1,

    minWidth: 0,
  },

  name: {
    fontSize: 16,

    lineHeight: 21,

    color: "#0F172A",

    marginBottom: 5,
  },

  metaRow: {
    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",

    gap: 8,
  },

  metaItem: {
    flexDirection: "row",

    alignItems: "center",
  },

  metaText: {
    marginLeft: 3,

    fontSize: 11,

    color: "#64748B",
  },

  statusDot: {
    width: 7,
    height: 7,

    borderRadius: 4,
  },

  callButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,

    borderColor: "#DBEAFE",

    justifyContent: "center",

    alignItems: "center",

    marginLeft: 8,
  },

  callButtonPressed: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },
});