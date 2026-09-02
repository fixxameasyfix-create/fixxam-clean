import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import ProfileAvatar from "@/components/profile/shared/ProfileAvatar";

import ProfileBadge from "@/components/profile/shared/ProfileBadge";

type Props = {
  name: string;
  phone: string;
  email: string;
  photoUrl?: string;
  verified?: boolean;
  onEditPhoto?: () => void;
  onNotifications?: () => void;
  onSettings?: () => void;
};

export default function CustomerProfileHeader({
  name,
  phone,
  email,
  photoUrl,
  verified = true,
  onEditPhoto,
  onNotifications,
  onSettings,
}: Props) {
  return (
    <View style={styles.container}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.topRow}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Profile
        </AppText>

        <View style={styles.actions}>
          <Pressable
            onPress={onNotifications}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={19}
              color="#0F172A"
            />
          </Pressable>

          <Pressable
            onPress={onSettings}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={19}
              color="#0F172A"
            />
          </Pressable>
        </View>
      </View>

      {/* =====================================================
          PROFILE
      ===================================================== */}

      <View style={styles.profileRow}>
        <ProfileAvatar
          photoUrl={photoUrl}
          size={68}
          editable
          onPress={onEditPhoto}
        />

        <View style={styles.info}>
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.name}
          >
            {name}
          </AppText>

          <View style={styles.badge}>
            <ProfileBadge
              role="customer"
              verified={verified}
            />
          </View>

          {/* PHONE */}

          <View style={styles.detailRow}>
            <Ionicons
              name="call-outline"
              size={14}
              color="#64748B"
            />

            <AppText
              numberOfLines={1}
              style={styles.detail}
            >
              {phone}
            </AppText>
          </View>

          {/* EMAIL */}

          <View style={styles.detailRow}>
            <Ionicons
              name="mail-outline"
              size={14}
              color="#64748B"
            />

            <AppText
              numberOfLines={1}
              style={styles.detail}
            >
              {email}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* ==========================================================
     CONTAINER
  ========================================================== */

  container: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  topRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  title: {
    fontSize: 17,
    lineHeight: 21,
    color: "#0F172A",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  /* ==========================================================
     PROFILE ROW
  ========================================================== */

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* ==========================================================
     PROFILE INFO
  ========================================================== */

  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  name: {
    fontSize: 18,
    lineHeight: 22,
    color: "#0F172A",
  },

  /* ==========================================================
     BADGE
  ========================================================== */

  badge: {
    alignSelf: "flex-start",
    marginTop: 3,
    marginBottom: 3,
  },

  /* ==========================================================
     CONTACT ROW
  ========================================================== */

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginTop: 2,
  },

  detail: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
    fontSize: 9.5,
    lineHeight: 13,
    color: "#64748B",
  },
});