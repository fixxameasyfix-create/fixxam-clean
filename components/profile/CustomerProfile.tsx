import React, {
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  hasWorkerAccount: boolean;

  onBecomeWorker: () => void;

  onSwitchWorker: () => void;

  onProfile: () => void;

  onRequests: () => void;

  onMarket: () => void;

  onOrders: () => void;

  onPromotions: () => void;


  onActivity: () => void;

  onSaved: () => void;

  onLocation: () => void;

  onMywallet: () => void;

  onNotifications: () => void;

  onReviews: () => void;

  onSupport: () => void;

  onSettings: () => void;

  onLogout: () => void;
};

type MenuItem = {
  label: string;

  icon: AppIconName;

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
onRequests,
onMarket,
onOrders,

onPromotions,
onActivity,

  onSaved,
  onLocation,
  onMywallet,
  onNotifications,
  onReviews,
  onSupport,
  onSettings,

  onLogout,
}: Props) {
  /* ==========================================================
     MENU
  ========================================================== */

  const menuItems =
    useMemo<MenuItem[]>(
      () => [
        {
          label: "Profile",
          icon: "profile",
          onPress:
            onProfile,
        },

        {
          label:
            "My Requests",
          icon: "jobs",
          onPress:
            onRequests,
        },

{
  label: "My Market",
  icon: "cart",
  onPress:
    onMarket,
},

{
  label: "Orders",
  icon: "file",
  onPress:
    onOrders,
},


{
  label: "Promotions",
  icon: "info",
  onPress:
    onPromotions,
},

        {
          label: "Saved",
          icon: "heart",
          onPress:
            onSaved,
        },

        /*
         * No route/callback exists yet.
         * Keep disabled.
         */
  

        {
          label: "Location",
          icon: "location",
          onPress:
            onLocation,
        },

        {
          label:
            "My Wallet",
          icon: "wallet",
          onPress:
            onMywallet,
        },

        {
          label:
            "Notifications",
          icon:
            "notifications",
          onPress:
            onNotifications,
        },

        {
          label: "Reviews",
          icon: "star",
          onPress:
            onReviews,
        },

        {
          label:
            "Fixxam Activity",
          icon: "jobs",
          onPress:
            onActivity,
        },

        {
          label:
            "Help & Support",
          icon: "help",
          onPress:
            onSupport,
        },

        {
          label: "Settings",
          icon: "settings",
          onPress:
            onSettings,
        },
      ],
      [
        onActivity,
        onLocation,
        onNotifications,
        onMywallet,
        onProfile,
        onRequests,
        onReviews,
        onSaved,
        onSettings,
        onSupport,
      ],
    );

  /* ==========================================================
     WORKER CTA
  ========================================================== */

  const workerTitle =
    hasWorkerAccount
      ? "Worker Mode"
      : "Become a Worker";

  const workerDescription =
    hasWorkerAccount
      ? "Manage services and receive jobs."
      : "Start offering services and earn more.";

  const workerAction =
    hasWorkerAccount
      ? "Continue"
      : "Get Started";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* =====================================================
          CUSTOMER → WORKER
      ===================================================== */}

      <Pressable
        onPress={
          hasWorkerAccount
            ? onSwitchWorker
            : onBecomeWorker
        }
        accessibilityRole="button"
        accessibilityLabel={
          hasWorkerAccount
            ? "Continue to worker mode"
            : "Become a worker"
        }
        accessibilityHint={
          hasWorkerAccount
            ? "Switches to your worker account"
            : "Starts worker account registration"
        }
        style={({
          pressed,
        }) => [
          styles.workerCard,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <View
          style={
            styles.workerIcon
          }
        >
          <AppIcon
            name={
              hasWorkerAccount
                ? "jobs"
                : "service"
            }
            role="worker"
            size="md"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.workerContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.workerTitle
            }
          >
            {workerTitle}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.workerText
            }
          >
            {workerDescription}
          </AppText>
        </View>

        <View
          style={
            styles.continueButton
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.continueText
            }
          >
            {workerAction}
          </AppText>

          <AppIcon
            name="next"
            role="worker"
            size="xs"
            color={
              Colors.textInverse
            }
          />
        </View>
      </Pressable>

      {/* =====================================================
          ACCOUNT MENU
      ===================================================== */}

      <View
        style={
          styles.menu
        }
      >
        {menuItems.map(
          (
            item,
            index,
          ) => {
            const isLast =
              index ===
              menuItems.length -
                1;

            const isDisabled =
              !item.onPress;

            return (
              <Pressable
                key={
                  item.label
                }
                onPress={
                  item.onPress
                }
                disabled={
                  isDisabled
                }
                accessibilityRole="button"
                accessibilityLabel={
                  item.label
                }
                accessibilityState={{
                  disabled:
                    isDisabled,
                }}
                style={({
                  pressed,
                }) => [
                  styles.row,

                  !isLast
                    ? styles.rowBorder
                    : null,

                  isDisabled
                    ? styles.rowDisabled
                    : null,

                  pressed &&
                  !isDisabled
                    ? styles.rowPressed
                    : null,
                ]}
              >
                <View
                  style={
                    styles.iconBox
                  }
                >
                  <AppIcon
                    name={
                      item.icon
                    }
                    size="sm"
                    state={
                      isDisabled
                        ? "muted"
                        : "default"
                    }
                    color={
                      isDisabled
                        ? Colors.textMuted
                        : Colors.textSecondary
                    }
                  />
                </View>

                <AppText
                  variant="body"
                  numberOfLines={1}
                  style={[
                    styles.rowText,

                    isDisabled
                      ? styles.disabledText
                      : null,
                  ]}
                >
                  {item.label}
                </AppText>

                {isDisabled ? (
                  <AppIcon
                    name="lock"
                    size="xs"
                    state="muted"
                  />
                ) : (
                  <AppIcon
                    name="next"
                    size="xs"
                    state="muted"
                  />
                )}
              </Pressable>
            );
          },
        )}
      </View>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <Pressable
        onPress={
          onLogout
        }
        accessibilityRole="button"
        accessibilityLabel="Logout"
        style={({
          pressed,
        }) => [
          styles.logout,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="logout"
          size="sm"
          state="error"
          color={
            Colors.error
          }
        />

        <AppText
          variant="bodyMedium"
          weight="bold"
          style={
            styles.logoutText
          }
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

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      width:
        "100%",
    },

    /* ========================================================
       WORKER CARD
    ======================================================== */

    workerCard: {
      minHeight:
        76,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    workerIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    workerContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    workerTitle: {
      color:
        Colors.textPrimary,
    },

    workerText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight:
        16,
    },

    continueButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexShrink:
        0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    continueText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       MENU
    ======================================================== */

    menu: {
      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    row: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    rowBorder: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    rowPressed: {
      backgroundColor:
        Colors.disabledBackground,
    },

    rowDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    iconBox: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    rowText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    disabledText: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       LOGOUT
    ======================================================== */

    logout: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.errorSoft,
    },

    logoutText: {
      color:
        Colors.error,
    },

    /* ========================================================
       PRESS
    ======================================================== */

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