import React from "react";

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

export default function WorkerProfileHeader({
  name,
  phone,
  email,
  photoUrl,
  verified = false,
  onEditPhoto,
  onNotifications,
  onSettings,
}: Props) {
  return (
    <AppCard style={styles.card}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.headerRow}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Profile
        </AppText>

        <View style={styles.headerActions}>
          <Pressable
            onPress={onNotifications}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#0F172A"
            />
          </Pressable>

          <Pressable
            onPress={onSettings}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color="#0F172A"
            />
          </Pressable>
        </View>
      </View>

      {/* =====================================================
          PROFILE
      ===================================================== */}

      <View style={styles.profileRow}>

        {/* PHOTO */}

        <View style={styles.photoWrapper}>
          {photoUrl ? (
            <Image
              source={{
                uri: photoUrl,
              }}
              style={styles.photo}
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="person"
                size={30}
                color="#94A3B8"
              />
            </View>
          )}

          <Pressable
            onPress={onEditPhoto}
            style={styles.cameraButton}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            <Ionicons
              name="camera"
              size={13}
              color="#2563EB"
            />
          </Pressable>
        </View>

        {/* INFO */}

        <View style={styles.info}>

          <AppText
            weight="bold"
            style={styles.name}
            numberOfLines={1}
          >
            {name || "Worker"}
          </AppText>

          {/* VERIFICATION */}

          <View
            style={[
              styles.badge,
              verified
                ? styles.verifiedBadge
                : styles.pendingBadge,
            ]}
          >
            <Ionicons
              name={
                verified
                  ? "checkmark-circle"
                  : "information-circle"
              }
              size={12}
              color={
                verified
                  ? "#15803D"
                  : "#2563EB"
              }
            />

            <AppText
              style={[
                styles.badgeText,
                verified
                  ? styles.verifiedText
                  : styles.pendingText,
              ]}
              numberOfLines={1}
            >
              {verified
                ? "Verified"
                : "Verification Pending"}
            </AppText>
          </View>

          {/* PHONE */}

          {!!phone && (
            <View style={styles.contactRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color="#64748B"
              />

              <AppText
                style={styles.contactText}
                numberOfLines={1}
              >
                {phone}
              </AppText>
            </View>
          )}

          {/* EMAIL */}

          {!!email && (
            <View style={styles.contactRow}>
              <Ionicons
                name="mail-outline"
                size={14}
                color="#64748B"
              />

              <AppText
                style={styles.contactText}
                numberOfLines={1}
              >
                {email}
              </AppText>
            </View>
          )}

        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  /* ==========================================================
     CARD
  ========================================================== */

  card: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 7,

    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 10,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    lineHeight: 22,
    color: "#0F172A",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  headerButton: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    alignItems: "center",
    justifyContent: "center",
  },

  /* ==========================================================
     PROFILE ROW
  ========================================================== */

  profileRow: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 68,
  },

  /* ==========================================================
     PHOTO
  ========================================================== */

  photoWrapper: {
    width: 64,
    height: 64,

    position: "relative",
  },

  photo: {
    width: 64,
    height: 64,

    borderRadius: 20,

    backgroundColor: "#E2E8F0",
  },

  placeholder: {
    width: 64,
    height: 64,

    borderRadius: 20,

    backgroundColor: "#E2E8F0",

    alignItems: "center",
    justifyContent: "center",
  },

  cameraButton: {
    position: "absolute",

    right: -3,
    bottom: -3,

    width: 24,
    height: 24,

    borderRadius: 9,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    alignItems: "center",
    justifyContent: "center",

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  /* ==========================================================
     INFO
  ========================================================== */

  info: {
    flex: 1,
    minWidth: 0,

    marginLeft: 10,
  },

  name: {
    fontSize: 19,
    lineHeight: 22,

    color: "#0F172A",

    maxWidth: "100%",
  },

  /* ==========================================================
     VERIFICATION
  ========================================================== */

  badge: {
    alignSelf: "flex-start",

    marginTop: 3,

    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 999,

    flexDirection: "row",
    alignItems: "center",

    gap: 3,
  },

  verifiedBadge: {
    backgroundColor: "#DCFCE7",
  },

  pendingBadge: {
    backgroundColor: "#DBEAFE",
  },

  badgeText: {
    fontSize: 9.5,
    lineHeight: 12,

    fontWeight: "700",
  },

  verifiedText: {
    color: "#15803D",
  },

  pendingText: {
    color: "#2563EB",
  },

  /* ==========================================================
     CONTACT
  ========================================================== */

  contactRow: {
    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,

    marginTop: 2,
  },

  contactText: {
    flex: 1,
    minWidth: 0,

    marginLeft: 5,

    fontSize: 10.5,
    lineHeight: 14,

    color: "#64748B",
  },
});