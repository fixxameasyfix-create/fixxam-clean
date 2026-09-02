import React, { memo } from "react";

import {
  Image,
  Pressable,
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
  photoURL?: string | null;
  onProfile: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerCustomerCard = memo(
  function WorkerCustomerCard({
    name,
    photoURL,
    onProfile,
  }: Props) {
    const hasPhoto =
      typeof photoURL === "string" &&
      photoURL.trim().length > 0;

    return (
      <View style={styles.customerCard}>
        {/* ====================================================
            CUSTOMER INFO
        ==================================================== */}

        <View style={styles.customerTop}>
          <View style={styles.customerAvatar}>
            {hasPhoto ? (
              <Image
                source={{
                  uri: photoURL,
                }}
                style={styles.avatarImage}
                resizeMode="cover"
                accessibilityLabel={`${name} profile photo`}
              />
            ) : (
              <Ionicons
                name="person"
                size={27}
                color="#94A3B8"
              />
            )}
          </View>

          <View style={styles.customerInfo}>
            <AppText
              weight="bold"
              numberOfLines={1}
              style={styles.customerName}
            >
              {name.trim() || "Customer"}
            </AppText>

            <AppText
              style={styles.customerCategory}
            >
              Customer
            </AppText>

            <View
              style={
                styles.customerStatusRow
              }
            >
              <View
                style={styles.customerDot}
              />

              <AppText
                style={
                  styles.customerStatus
                }
              >
                Requesting service
              </AppText>
            </View>
          </View>
        </View>

        {/* ====================================================
            PROFILE BUTTON
        ==================================================== */}

        <Pressable
          onPress={onProfile}
          accessibilityRole="button"
          accessibilityLabel={`View ${name} profile`}
          hitSlop={6}
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <AppText
            weight="bold"
            style={styles.profileText}
          >
            VIEW PROFILE
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={15}
            color="#2563EB"
          />
        </Pressable>
      </View>
    );
  },
);

WorkerCustomerCard.displayName =
  "WorkerCustomerCard";

export default WorkerCustomerCard;

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  /* ==========================================================
     CARD
  ========================================================== */

  customerCard: {
    padding: 12,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  /* ==========================================================
     CUSTOMER TOP
  ========================================================== */

  customerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  customerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  customerName: {
    fontSize: 14,
    color: "#0F172A",
  },

  customerCategory: {
    marginTop: 2,
    fontSize: 10,
    color: "#64748B",
  },

  customerStatusRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  customerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },

  customerStatus: {
    fontSize: 9.5,
    color: "#16A34A",
  },

  /* ==========================================================
     PROFILE BUTTON
  ========================================================== */

  profileButton: {
    height: 38,
    marginTop: 10,
    borderRadius: 11,
    backgroundColor: "#F8FAFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  profileText: {
    fontSize: 9.5,
    color: "#2563EB",
  },

  /* ==========================================================
     PRESS
  ========================================================== */

  buttonPressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});