import React, { memo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

import usePendingBookingsCount from "@/hooks/booking/usePendingBookingsCount";

/* ============================================================
   TYPES
============================================================ */

type ActionItem = {
  title: string;
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];
  route?: string;
  badge?: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerQuickActions() {
  const pendingCount =
    usePendingBookingsCount();

  const actions: ActionItem[] = [
    {
      title: "Helping Box",
      icon: "briefcase-outline",
      route: "/(worker)/jobs/helping-box",
    },

    {
      title: "Profile",
      icon: "person-outline",
      route: "/(worker)/jobs/build-profile",
    },

    {
      title: "New Jobs",
      icon: "notifications-outline",
      route: "/(worker)/new-job",
      badge:
        pendingCount > 0
          ? String(pendingCount)
          : undefined,
    },

    {
      title: "Specialise",
      icon: "locate-outline",
      route: "/(worker)/specialise",
    },

    {
      title: "Market",
      icon: "cart-outline",
      route: "/(worker)/(tabs)/my-products",
    },

    {
      title: "More",
      icon: "grid-outline",
    },
  ];

  const handlePress = (
    item: ActionItem,
  ) => {
    if (!item.route) {
      return;
    }

    router.push(
      item.route as never,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {actions.map(
          (item) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={
                item.title
              }
              onPress={() =>
                handlePress(item)
              }
              style={({ pressed }) => [
                styles.item,
                pressed &&
                  styles.pressed,
              ]}
            >
              <View
                style={
                  styles.iconWrapper
                }
              >
                <Ionicons
                  name={
                    item.icon
                  }
                  size={22}
                  color="#FF6B00"
                />

                {item.badge && (
                  <View
                    style={
                      styles.badge
                    }
                  >
                    <AppText
                      weight="bold"
                      style={
                        styles.badgeText
                      }
                    >
                      {item.badge}
                    </AppText>
                  </View>
                )}
              </View>

              <AppText
                weight="medium"
                numberOfLines={1}
                style={
                  styles.title
                }
              >
                {item.title}
              </AppText>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

WorkerQuickActions.displayName =
  "WorkerQuickActions";

export default memo(
  WorkerQuickActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 14,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#F1F5F9",

    paddingVertical: 14,
    paddingHorizontal: 8,

    shadowColor: "#000000",
    shadowOpacity: 0.045,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  item: {
    width: "25%",

    minHeight: 76,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 3,
  },

  iconWrapper: {
    width: 46,
    height: 46,

    borderRadius: 15,

    backgroundColor: "#FFF7ED",

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  title: {
    marginTop: 7,

    fontSize: 10.5,
    lineHeight: 14,

    color: "#475569",

    textAlign: "center",
  },

  badge: {
    position: "absolute",

    top: -5,
    right: -5,

    minWidth: 18,
    height: 18,

    paddingHorizontal: 4,

    borderRadius: 999,

    backgroundColor: "#EF4444",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",

    fontSize: 8,
    lineHeight: 10,
  },

  pressed: {
    opacity: 0.55,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },
});