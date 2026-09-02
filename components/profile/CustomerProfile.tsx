import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  hasWorkerAccount: boolean;

  onBecomeWorker: () => void;
  onSwitchWorker: () => void;

  onProfile: () => void;
  onActivity: () => void;

  onSaved: () => void;
  onAddresses: () => void;
  onPayments: () => void;
  onNotifications: () => void;
  onReviews: () => void;
  onSupport: () => void;
  onSettings: () => void;

  onLogout: () => void;
};

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function CustomerProfile({
  hasWorkerAccount,

  onBecomeWorker,
  onSwitchWorker,

  onProfile,
  onActivity,

  onSaved,
  onAddresses,
  onPayments,
  onNotifications,
  onReviews,
  onSupport,
  onSettings,

  onLogout,
}: Props) {
  /* ==========================================================
     MENU
  ========================================================== */

  const menuItems: MenuItem[] = [
    /* ========================================================
       PROFILE
    ======================================================== */

    {
      label: "Profile",
      icon: "person-outline",
      onPress: onProfile,
    },

    /* ========================================================
       ORDERS
    ======================================================== */

    {
      label: "Orders",
      icon: "receipt-outline",
    },

    /* ========================================================
       SAVED
    ======================================================== */

    {
      label: "Saved",
      icon: "bookmark-outline",
      onPress: onSaved,
    },

    /* ========================================================
       PROMOTIONS
    ======================================================== */

    {
      label: "Promotions",
      icon: "pricetag-outline",
    },

    /* ========================================================
       ADDRESSES
    ======================================================== */

    {
      label: "Addresses",
      icon: "location-outline",
      onPress: onAddresses,
    },

    /* ========================================================
       PAYMENT METHODS
    ======================================================== */

    {
      label: "Payment Methods",
      icon: "card-outline",
      onPress: onPayments,
    },

    /* ========================================================
       NOTIFICATIONS
    ======================================================== */

    {
      label: "Notifications",
      icon: "notifications-outline",
      onPress: onNotifications,
    },

    /* ========================================================
       REVIEWS
    ======================================================== */

    {
      label: "Reviews",
      icon: "star-outline",
      onPress: onReviews,
    },

    /* ========================================================
       ACTIVITY
    ======================================================== */

    {
      label: "Fixxam Activity",
      icon: "pulse-outline",
      onPress: onActivity,
    },

    /* ========================================================
       SUPPORT
    ======================================================== */

    {
      label: "Help & Support",
      icon: "help-circle-outline",
      onPress: onSupport,
    },

    /* ========================================================
       SETTINGS
    ======================================================== */

    {
      label: "Settings",
      icon: "settings-outline",
      onPress: onSettings,
    },
  ];

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View style={styles.container}>
      {/* =====================================================
          CUSTOMER → WORKER
      ===================================================== */}

      <Pressable
        onPress={
          hasWorkerAccount
            ? onSwitchWorker
            : onBecomeWorker
        }
        style={({ pressed }) => [
          styles.workerCard,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          hasWorkerAccount
            ? "Continue to worker mode"
            : "Become a worker"
        }
      >
        {/* WORKER ICON */}

        <View style={styles.workerIcon}>
          <Ionicons
            name={
              hasWorkerAccount
                ? "briefcase"
                : "construct-outline"
            }
            size={22}
            color="#2563EB"
          />
        </View>

        {/* WORKER CONTENT */}

        <View style={styles.workerContent}>
          <AppText
            weight="bold"
            style={styles.workerTitle}
            numberOfLines={1}
          >
            {hasWorkerAccount
              ? "Worker Mode"
              : "Become a Worker"}
          </AppText>

          <AppText
            numberOfLines={1}
            style={styles.workerText}
          >
            {hasWorkerAccount
              ? "Manage services and receive jobs."
              : "Start offering services and earn more."}
          </AppText>
        </View>

        {/* CONTINUE */}

        <View style={styles.continueButton}>
          <AppText
            weight="bold"
            style={styles.continueText}
          >
            {hasWorkerAccount
              ? "Continue"
              : "Get Started"}
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={15}
            color="#FFFFFF"
          />
        </View>
      </Pressable>

      {/* =====================================================
          ACCOUNT MENU
      ===================================================== */}

      <View style={styles.menu}>
        {menuItems.map(
          (item, index) => {
            const isLast =
              index ===
              menuItems.length - 1;

            const isDisabled =
              !item.onPress;

            return (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                disabled={isDisabled}
                style={({
                  pressed,
                }) => [
                  styles.row,

                  !isLast &&
                    styles.rowBorder,

                  pressed &&
                    !isDisabled &&
                    styles.rowPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  item.label
                }
                accessibilityState={{
                  disabled:
                    isDisabled,
                }}
              >
                {/* ICON */}

                <View
                  style={
                    styles.iconBox
                  }
                >
                  <Ionicons
                    name={
                      item.icon
                    }
                    size={21}
                    color="#64748B"
                  />
                </View>

                {/* LABEL */}

                <AppText
                  style={[
                    styles.rowText,
                    isDisabled &&
                      styles.disabledText,
                  ]}
                >
                  {item.label}
                </AppText>

                {/* CHEVRON */}

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#94A3B8"
                />
              </Pressable>
            );
          },
        )}
      </View>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [
          styles.logout,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#DC2626"
        />

        <AppText
          weight="bold"
          style={styles.logoutText}
        >
          Logout
        </AppText>
      </Pressable>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  /* ==========================================================
     WORKER CARD
  ========================================================== */

  workerCard: {
    marginHorizontal: 16,
    marginBottom: 10,

    padding: 13,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  workerIcon: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",
  },

  workerContent: {
    flex: 1,
    minWidth: 0,

    marginLeft: 11,
    marginRight: 8,
  },

  workerTitle: {
    fontSize: 15,
    color: "#111827",
  },

  workerText: {
    marginTop: 2,

    fontSize: 10.5,
    lineHeight: 16,

    color: "#64748B",
  },

  continueButton: {
    minHeight: 34,

    paddingHorizontal: 11,

    borderRadius: 11,

    backgroundColor: "#2563EB",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,
  },

  continueText: {
    fontSize: 10.5,
    color: "#FFFFFF",
  },

  /* ==========================================================
     MENU
  ========================================================== */

  menu: {
    marginHorizontal: 16,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  row: {
    minHeight: 54,

    paddingHorizontal: 13,

    flexDirection: "row",
    alignItems: "center",
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  rowPressed: {
    backgroundColor: "#F8FAFC",
  },

  iconBox: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: "#F8FAFC",

    alignItems: "center",
    justifyContent: "center",
  },

  rowText: {
    flex: 1,

    marginLeft: 11,

    fontSize: 13.5,

    color: "#111827",
  },

  disabledText: {
    color: "#475569",
  },

  /* ==========================================================
     LOGOUT
  ========================================================== */

  logout: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,

    height: 48,

    borderRadius: 14,

    backgroundColor: "#FEE2E2",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  logoutText: {
    fontSize: 13.5,
    color: "#DC2626",
  },

  /* ==========================================================
     PRESS
  ========================================================== */

  pressed: {
    opacity: 0.78,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },
});