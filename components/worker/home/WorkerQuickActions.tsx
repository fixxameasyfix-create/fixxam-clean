import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  type Href,
} from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import useWorkerOrders from "@/hooks/orders/useWorkerOrders";

/* ============================================================
   TYPES
============================================================ */

type ActionItem = {
  title: string;

  icon: AppIconName;

  route?: Href;

  badge?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function getBadgeValue(
  value: unknown,
): string | undefined {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return undefined;
  }

  const count =
    Math.floor(value);

  return count > 99
    ? "99+"
    : String(count);
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerQuickActions() {
  /* ==========================================================
     SINGLE SOURCE OF TRUTH
  ========================================================== */

  const {
    counts,
  } = useWorkerOrders();

  const pendingBadge =
    getBadgeValue(
      counts.pending,
    );

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const actions =
    useMemo<ActionItem[]>(
      () => [
        {
          title:
            "Helping Box",

          icon:
            "jobs",

          route:
            "/(worker)/jobs/helping-box",
        },

        {
          title:
            "Profile",

          icon:
            "profile",

          route:
            "/(worker)/jobs/build-profile",
        },

        {
          title:
            "New Jobs",

          icon:
            "notifications",

          route:
            "/(worker)/new-job",

          badge:
            pendingBadge,
        },

        {
          title:
            "Specialise",

          icon:
            "locate",

          route:
            "/(worker)/specialise",
        },

        {
          title:
            "My Shop",

          icon:
            "shop",

          route:
            "/(worker)/my-shop",
        },

        {
          title:
            "Add Products",

          icon:
            "cart",

          route:
            "/(worker)/products/add",
        },

        {
          title:
            "My Contacts",

          icon:
            "phone",

          route:
            "/(worker)/contacts/my-contacts",
        },
      ],
      [
        pendingBadge,
      ],
    );

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handlePress =
    useCallback(
      (
        item: ActionItem,
      ) => {
        if (
          !item.route
        ) {
          return;
        }

        router.push(
          item.route,
        );
      },
      [],
    );

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.grid
        }
      >
        {actions.map(
          item => {
            const accessibilityLabel =
              item.badge
                ? `${item.title}, ${item.badge} pending`
                : item.title;

            return (
              <Pressable
                key={
                  item.title
                }
                onPress={() => {
                  handlePress(
                    item,
                  );
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  accessibilityLabel
                }
                style={({
                  pressed,
                }) => [
                  styles.item,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <View
                  style={
                    styles.iconWrapper
                  }
                >
                  <AppIcon
                    name={
                      item.icon
                    }
                    role="worker"
                    size="md"
                    color={
                      WorkerColors.primary
                    }
                  />

                  {item.badge ? (
                    <View
                      style={
                        styles.badge
                      }
                    >
                      <AppText
                        weight="bold"
                        numberOfLines={1}
                        style={
                          styles.badgeText
                        }
                      >
                        {item.badge}
                      </AppText>
                    </View>
                  ) : null}
                </View>

                <AppText
                  variant="caption"
                  weight="medium"
                  numberOfLines={1}
                  center
                  style={
                    styles.title
                  }
                >
                  {item.title}
                </AppText>
              </Pressable>
            );
          },
        )}
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerQuickActions.displayName =
  "WorkerQuickActions";

export default memo(
  WorkerQuickActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    grid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",
    },

    item: {
      width:
        "33.333%",

      minHeight: 90,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    iconWrapper: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      position:
        "relative",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    title: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    badge: {
      position:
        "absolute",

      top: -6,

      right: -6,

      minWidth: 20,

      height: 20,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,
    },

    badgeText: {
      fontSize: 9,

      lineHeight: 11,

      color:
        Colors.textInverse,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });