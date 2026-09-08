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
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

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

  icon: AppIconName;

  onPress?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

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
  /* ==========================================================
     MENU
  ========================================================== */

  const menuItems =
    useMemo<MenuItem[]>(
      () => [
        {
          label: "My Jobs",
          icon: "jobs",
          onPress:
            onJobs,
        },

        {
          label: "My Products",
          icon: "package",
          onPress:
            onProducts,
        },

        {
          label: "Orders",
          icon: "file",
          onPress:
            onOrders,
        },

        /*
         * No real callback exists yet.
         */
        {
          label: "Promotions",
          icon: "info",
        },

        {
          label: "Earnings",
          icon: "wallet",
          onPress:
            onEarnings,
        },

        /*
         * No real callback exists yet.
         */
        {
          label: "Saved",
          icon: "heart",
        },

        {
          label: "Reviews",
          icon: "star",
          onPress:
            onReviews,
        },

        {
          label:
            "Online / Offline",
          icon: "wifi-off",
          onPress:
            onOnlineStatus,
        },

        {
          label:
            "Business Address",
          icon: "location",
          onPress:
            onBusinessAddress,
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
        onBusinessAddress,
        onEarnings,
        onJobs,
        onNotifications,
        onOnlineStatus,
        onOrders,
        onProducts,
        onReviews,
        onSettings,
        onSupport,
      ],
    );

  /* ==========================================================
     CUSTOMER ACTION
  ========================================================== */

  const handleCustomerAction =
    () => {
      if (
        hasCustomerAccount
      ) {
        onSwitchCustomer();

        return;
      }

      onCreateCustomer();
    };

  const customerTitle =
    hasCustomerAccount
      ? "Customer Mode"
      : "Unlock Customer";

  const customerDescription =
    hasCustomerAccount
      ? "Book services & shop instantly."
      : "Create a customer profile in seconds.";

  const customerActionLabel =
    hasCustomerAccount
      ? "Continue"
      : "Start";

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
          WORKER → CUSTOMER
      ===================================================== */}

      <Pressable
        onPress={
          handleCustomerAction
        }
        accessibilityRole="button"
        accessibilityLabel={
          hasCustomerAccount
            ? "Switch to customer mode"
            : "Create customer account"
        }
        accessibilityHint={
          hasCustomerAccount
            ? "Switches to your customer account"
            : "Starts customer account setup"
        }
        style={({
          pressed,
        }) => [
          styles.customerCard,

          pressed
            ? styles.customerCardPressed
            : null,
        ]}
      >
        {/* CUSTOMER ICON */}

        <View
          style={
            styles.customerIcon
          }
        >
          <AppIcon
            name={
              hasCustomerAccount
                ? "refresh"
                : "profile"
            }
            role="customer"
            size="md"
            color={
              CustomerColors.primary
            }
          />
        </View>

        {/* CONTENT */}

        <View
          style={
            styles.customerContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.customerTitle
            }
          >
            {customerTitle}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.customerText
            }
          >
            {customerDescription}
          </AppText>
        </View>

        {/* ACTION */}

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
              styles.buttonText
            }
          >
            {customerActionLabel}
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            color={
              Colors.textInverse
            }
          />
        </View>
      </Pressable>

      {/* =====================================================
          WORKER MENU
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
                {/* LEFT */}

                <View
                  style={
                    styles.rowLeft
                  }
                >
                  <View
                    style={
                      styles.rowIcon
                    }
                  >
                    <AppIcon
                      name={
                        item.icon
                      }
                      role="worker"
                      size="sm"
                      color={
                        isDisabled
                          ? Colors.textMuted
                          : WorkerColors.primary
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
                </View>

                {/* RIGHT */}

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
            ? styles.logoutPressed
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
    container: {
      width: "100%",
    },

    /* ========================================================
       CUSTOMER MODE
    ======================================================== */

    customerCard: {
      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,

      ...FixxamTokens.shadow.card,
    },

    customerCardPressed: {
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

    customerIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    customerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    customerTitle: {
      color:
        Colors.textPrimary,
    },

    customerText: {
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

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    buttonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       WORKER MENU
    ======================================================== */

    menu: {
      overflow: "hidden",

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

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    rowBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    rowPressed: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    rowLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",
    },

    rowIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowText: {
      flex: 1,

      minWidth: 0,

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

      flexDirection: "row",

      alignItems: "center",

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

    logoutPressed: {
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

    logoutText: {
      color:
        Colors.error,
    },
  });