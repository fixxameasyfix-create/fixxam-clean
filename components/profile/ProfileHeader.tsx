import React from "react";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Props = {
  name: string;
  photoUrl: string;
  email: string;
  phone: string;
  role: "customer" | "worker";
};

export default function ProfileHeader({
  name,
  photoUrl,
  email,
  phone,
  role,
}: Props) {
  return (
    <View style={styles.container}>
      {/* =====================================================
          AVATAR
      ===================================================== */}

      <Image
        source={{
          uri: photoUrl,
        }}
        style={styles.avatar}
      />

      {/* =====================================================
          INFO
      ===================================================== */}

      <View style={styles.info}>
        <AppText
          weight="bold"
          numberOfLines={1}
          style={styles.name}
        >
          {name}
        </AppText>

        {/* ===================================================
            ACCOUNT BADGE
        =================================================== */}

        <View
          style={[
            styles.badge,
            role === "worker"
              ? styles.worker
              : styles.customer,
          ]}
        >
          <AppText
            weight="bold"
            style={styles.badgeText}
          >
            {role === "worker"
              ? "Worker Account"
              : "Customer Account"}
          </AppText>
        </View>

        {/* ===================================================
            PHONE
        =================================================== */}

        <AppText
          numberOfLines={1}
          style={styles.contact}
        >
          📞 {phone}
        </AppText>

        {/* ===================================================
            EMAIL
        =================================================== */}

        <AppText
          numberOfLines={1}
          style={styles.contact}
        >
          ✉ {email}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ========================================================
     CONTAINER
  ======================================================== */

  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  /* ========================================================
     AVATAR
  ======================================================== */

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
  },

  /* ========================================================
     INFO
  ======================================================== */

  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  /* ========================================================
     NAME
  ======================================================== */

  name: {
    fontSize: 16,
    lineHeight: 20,
    color: "#0F172A",
  },

  /* ========================================================
     BADGE
  ======================================================== */

  badge: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },

  customer: {
    backgroundColor: "#DBEAFE",
  },

  worker: {
    backgroundColor: "#DCFCE7",
  },

  badgeText: {
    fontSize: 8.5,
    lineHeight: 11,
  },

  /* ========================================================
     CONTACT
  ======================================================== */

  contact: {
    marginTop: 1,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#64748B",
  },
});