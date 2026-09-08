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

  const menuItems =
    useMemo<MenuItem[]>(
      () => [
        {
          label: "Profile",
          icon: "profile",
          onPress:
            onProfile,
        },

        /*
         * No route/callback exists yet.
         * Keep disabled.
         */
        {
          label: "Orders",
          icon: "jobs",
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
          label: "Promotions",
          icon: "info",
        },

        {
          label: "Addresses",
          icon: "location",
          onPress:
            onAddresses,
        },

        {
          label:
            "Payment Methods",
          icon: "payment",
          onPress:
            onPayments,
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
        onAddresses,
        onNotifications,
        onPayments,
        onProfile,
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
        {/* WORKER ICON */}

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

        {/* WORKER CONTENT */}

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

        {/* CONTINUE */}

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
        style={styles.menu}
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
                {/* ICON */}

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

                {/* LABEL */}

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

                {/* STATUS / ARROW */}

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
      width: "100%",
    },

    /* ========================================================
       WORKER CARD
    ======================================================== */

    workerCard: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,

      ...FixxamTokens.shadow.card,
    },

    workerIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

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
      flex: 1,

      minWidth: 0,

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

      lineHeight: 16,
    },

    continueButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexShrink: 0,

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

      marginHorizontal:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    row: {
      minHeight: 56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    rowBorder: {
      borderBottomWidth: 1,

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
      width: 38,

      height: 38,

      flexShrink: 0,

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
      flex: 1,

      minWidth: 0,

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

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.lg,

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

      borderWidth: 1,

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