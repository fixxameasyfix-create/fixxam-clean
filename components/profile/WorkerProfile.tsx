import React, { useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  hasCustomerAccount: boolean;

  onSwitchCustomer: () => void;
  onCreateCustomer: () => void;

  onJobs: () => void;
  onProducts: () => void;
  onOrders: () => void;
  onEarnings: () => void;
  onOnlineStatus: () => void;
  onBusinessAddress: () => void;
  onNotifications: () => void;
  onReviews: () => void;
  onSupport: () => void;
  onSettings: () => void;

  onLogout: () => void;
};

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function WorkerProfile({
  hasCustomerAccount,
  onSwitchCustomer,
  onCreateCustomer,

  onJobs,
  onProducts,
  onOrders,
  onEarnings,
  onOnlineStatus,
  onBusinessAddress,
  onNotifications,
  onReviews,
  onSupport,
  onSettings,

  onLogout,
}: Props) {
  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        label: "My Jobs",
        icon: "briefcase-outline",
        onPress: onJobs,
      },
      {
        label: "My Products",
        icon: "cube-outline",
        onPress: onProducts,
      },
      {
        label: "Orders",
        icon: "receipt-outline",
        onPress: onOrders,
      },
      {
        label: "Promotions",
        icon: "pricetag-outline",
        onPress: () => {},
      },
      {
        label: "Earnings",
        icon: "wallet-outline",
        onPress: onEarnings,
      },
      {
        label: "Saved",
        icon: "bookmark-outline",
        onPress: () => {},
      },
      {
        label: "Reviews",
        icon: "star-outline",
        onPress: onReviews,
      },
      {
        label: "Online / Offline",
        icon: "radio-outline",
        onPress: onOnlineStatus,
      },
      {
        label: "Business Address",
        icon: "location-outline",
        onPress: onBusinessAddress,
      },
      {
        label: "Notifications",
        icon: "notifications-outline",
        onPress: onNotifications,
      },
      {
        label: "Help & Support",
        icon: "help-circle-outline",
        onPress: onSupport,
      },
      {
        label: "Settings",
        icon: "settings-outline",
        onPress: onSettings,
      },
    ],
    [
      onJobs,
      onProducts,
      onOrders,
      onEarnings,
      onOnlineStatus,
      onBusinessAddress,
      onNotifications,
      onReviews,
      onSupport,
      onSettings,
    ],
  );

  const handleCustomerAction = () => {
    if (hasCustomerAccount) {
      onSwitchCustomer();
      return;
    }

    onCreateCustomer();
  };

  return (
    <View>
      {/* =====================================================
          CUSTOMER MODE
      ===================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.customerCard,
          pressed &&
            styles.customerCardPressed,
        ]}
        onPress={handleCustomerAction}
        accessibilityRole="button"
        accessibilityLabel={
          hasCustomerAccount
            ? "Switch to customer mode"
            : "Create customer account"
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Ionicons
              name={
                hasCustomerAccount
                  ? "swap-horizontal"
                  : "person-add"
              }
              size={19}
              color="#2563EB"
            />
          </View>

          <View
            style={styles.customerContent}
          >
            <AppText
              weight="bold"
              style={styles.customerTitle}
              numberOfLines={1}
            >
              {hasCustomerAccount
                ? "Customer Mode"
                : "Unlock Customer"}
            </AppText>

            <AppText
              style={styles.customerText}
              numberOfLines={1}
            >
              {hasCustomerAccount
                ? "Book services & shop instantly."
                : "Create a customer profile in seconds."}
            </AppText>
          </View>

          {/* Small inline arrow instead of large button */}
          <View style={styles.continueButton}>
            <AppText
              weight="bold"
              style={styles.buttonText}
            >
              {hasCustomerAccount
                ? "Continue"
                : "Start"}
            </AppText>

            <Ionicons
              name="arrow-forward"
              size={14}
              color="#FFFFFF"
            />
          </View>
        </View>
      </Pressable>

      {/* =====================================================
          WORKER MENU
      ===================================================== */}

      <View style={styles.menu}>
        {menuItems.map(
          (item, index) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.row,
                index ===
                  menuItems.length - 1 &&
                  styles.lastRow,
                pressed &&
                  styles.rowPressed,
              ]}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={
                item.label
              }
            >
              <View
                style={styles.rowLeft}
              >
                <View
                  style={styles.rowIcon}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color="#64748B"
                  />
                </View>

                <AppText
                  style={styles.rowText}
                  numberOfLines={1}
                >
                  {item.label}
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={17}
                color="#94A3B8"
              />
            </Pressable>
          ),
        )}
      </View>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.logout,
          pressed &&
            styles.logoutPressed,
        ]}
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Ionicons
          name="log-out-outline"
          size={18}
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

const styles =
  StyleSheet.create({
    /* ========================================================
       CUSTOMER MODE
    ======================================================== */

    customerCard: {
      marginBottom: 8,

      padding: 10,

      borderRadius: 17,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E2E8F0",

      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },

    customerCardPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    cardTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    iconBox: {
      width: 42,
      height: 42,

      borderRadius: 13,

      backgroundColor: "#EFF6FF",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 10,
    },

    customerContent: {
      flex: 1,
      minWidth: 0,

      marginRight: 8,
    },

    customerTitle: {
      fontSize: 14,
      lineHeight: 18,
      color: "#111827",
    },

    customerText: {
      marginTop: 2,

      fontSize: 10.5,
      lineHeight: 14,

      color: "#F97316",
    },

    continueButton: {
      height: 38,

      paddingHorizontal: 12,

      borderRadius: 12,

      backgroundColor: "#F97316",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 5,

      shadowColor: "#F97316",
      shadowOpacity: 0.18,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 11.5,
    },

    /* ========================================================
       MENU
    ======================================================== */

    menu: {
      backgroundColor: "#FFFFFF",

      borderRadius: 17,

      borderWidth: 1,
      borderColor: "#E2E8F0",

      overflow: "hidden",
    },

    row: {
      minHeight: 52,

      paddingHorizontal: 10,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    rowPressed: {
      backgroundColor: "#F8FAFC",
    },

    rowLeft: {
      flex: 1,
      minWidth: 0,

      flexDirection: "row",
      alignItems: "center",
    },

    rowIcon: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: "#F8FAFC",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 10,
    },

    rowText: {
      flex: 1,

      fontSize: 13,
      lineHeight: 18,

      color: "#0F172A",
    },

    /* ========================================================
       LOGOUT
    ======================================================== */

    logout: {
      marginTop: 8,

      height: 46,

      borderRadius: 14,

      backgroundColor: "#FEE2E2",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 7,
    },

    logoutPressed: {
      opacity: 0.75,
    },

    logoutText: {
      fontSize: 13,
      color: "#DC2626",
    },
  });