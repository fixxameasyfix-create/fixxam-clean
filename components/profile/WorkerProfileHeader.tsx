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
  onEditPhoto: () => void;
};

export default function WorkerProfileHeader({
  name,
  phone,
  email,
  photoUrl,
  onEditPhoto,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        {/* ==================================================
            PHOTO
        ================================================== */}

        <View style={styles.photoWrapper}>
          {photoUrl ? (
            <Image
              source={{
                uri: photoUrl,
              }}
              style={styles.photo}
            />
          ) : (
            <View
              style={styles.placeholder}
            >
              <Ionicons
                name="person"
                size={32}
                color="#94A3B8"
              />
            </View>
          )}

          <Pressable
            style={styles.cameraButton}
            onPress={onEditPhoto}
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

        {/* ==================================================
            INFO
        ================================================== */}

        <View style={styles.info}>
          <AppText
            weight="bold"
            style={styles.name}
            numberOfLines={1}
          >
            {name}
          </AppText>

          {/* WORKER BADGE */}

          <View style={styles.badge}>
            <View style={styles.dot} />

            <AppText
              weight="bold"
              style={styles.badgeText}
            >
              Worker Account
            </AppText>
          </View>

          {/* PHONE */}

          <View style={styles.contactRow}>
            <Ionicons
              name="call-outline"
              size={14}
              color="#64748B"
            />

            <AppText
              style={styles.contact}
              numberOfLines={1}
            >
              {phone}
            </AppText>
          </View>

          {/* EMAIL */}

          <View style={styles.contactRow}>
            <Ionicons
              name="mail-outline"
              size={14}
              color="#64748B"
            />

            <AppText
              style={styles.contact}
              numberOfLines={1}
            >
              {email}
            </AppText>
          </View>
        </View>
      </View>
    </AppCard>
  );
}

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginHorizontal: 0,
      marginTop: 0,
      marginBottom: 0,

      paddingHorizontal: 12,
      paddingVertical: 12,

      borderRadius: 17,
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
      flexDirection: "row",
      alignItems: "center",
    },

    /* ========================================================
       PHOTO
    ======================================================== */

    photoWrapper: {
      width: 70,
      height: 70,
      position: "relative",
    },

    photo: {
      width: 70,
      height: 70,
      borderRadius: 22,
      backgroundColor: "#F1F5F9",
    },

    placeholder: {
      width: 70,
      height: 70,
      borderRadius: 22,
      backgroundColor: "#E2E8F0",

      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       CAMERA
    ======================================================== */

    cameraButton: {
      position: "absolute",

      right: -4,
      bottom: -4,

      width: 25,
      height: 25,
      borderRadius: 9,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E2E8F0",

      alignItems: "center",
      justifyContent: "center",

      elevation: 3,

      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    /* ========================================================
       INFO
    ======================================================== */

    info: {
      flex: 1,
      minWidth: 0,
      marginLeft: 12,
    },

    name: {
      fontSize: 19,
      lineHeight: 23,
      color: "#0F172A",
    },

    /* ========================================================
       BADGE
    ======================================================== */

    badge: {
      alignSelf: "flex-start",

      marginTop: 4,
      marginBottom: 5,

      paddingHorizontal: 7,
      paddingVertical: 3,

      borderRadius: 7,

      backgroundColor: "#DCFCE7",

      flexDirection: "row",
      alignItems: "center",
    },

    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,

      backgroundColor: "#16A34A",

      marginRight: 5,
    },

    badgeText: {
      fontSize: 9,
      lineHeight: 12,
      color: "#15803D",
    },

    /* ========================================================
       CONTACT
    ======================================================== */

    contactRow: {
      marginTop: 2,

      flexDirection: "row",
      alignItems: "center",

      minWidth: 0,
    },

    contact: {
      flex: 1,

      marginLeft: 6,

      fontSize: 10,
      lineHeight: 14,

      color: "#64748B",
    },
  });