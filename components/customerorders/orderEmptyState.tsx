import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import type {
  FilterType,
} from "./orders.types";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

export interface OrderEmptyStateProps {
  filter: FilterType;

  error?: string | null;

  onLogin?: () => void;
}

function OrderEmptyState({
  filter,
  error,
  onLogin,
}: OrderEmptyStateProps) {
  const isGuest =
    Boolean(onLogin);

  const content = useMemo(() => {
    if (error) {
      return {
        icon: "error" as AppIconName,
        title:
          "Unable to load orders",
        message: error,
        error: true,
      };
    }

    if (isGuest) {
      return {
        icon: "lock" as AppIconName,
        title:
          "Sign in to view your orders",
        message:
          "Login to track service and market orders from one place.",
        error: false,
      };
    }

    switch (filter) {
      case "completed":
        return {
          icon:
            "success" as AppIconName,

          title:
            "No completed orders",

          message:
            "Completed orders will appear here.",

          error: false,
        };

      case "cancelled":
        return {
          icon:
            "error" as AppIconName,

          title:
            "No cancelled orders",

          message:
            "You don't have any cancelled or expired orders.",

          error: false,
        };

      case "active":
        return {
          icon:
            "professional" as AppIconName,

          title:
            "No active orders",

          message:
            "Accepted and in-progress orders will appear here.",

          error: false,
        };

      case "pending":
        return {
          icon:
            "clock" as AppIconName,

          title:
            "No pending orders",

          message:
            "Orders waiting for a response will appear here.",

          error: false,
        };

      case "all":
      default:
        return {
          icon:
            "package" as AppIconName,

          title:
            "No orders yet",

          message:
            "Your service and market orders will appear here once you place one.",

          error: false,
        };
    }
  }, [
    error,
    filter,
    isGuest,
  ]);

  return (
    <View
      accessibilityRole={
        error
          ? "alert"
          : undefined
      }
      style={styles.container}
    >
      <View
        style={[
          styles.iconContainer,

          {
            backgroundColor:
              content.error
                ? Colors.errorSoft
                : CustomerColors
                    .primarySoft,
          },
        ]}
      >
        <AppIcon
          name={content.icon}
          role="customer"
          size="lg"
          state={
            content.error
              ? "error"
              : "active"
          }
        />
      </View>

      <AppText
        variant="heading3"
        center
        style={styles.title}
      >
        {content.title}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={styles.message}
      >
        {content.message}
      </AppText>

      {onLogin ? (
        <AppButton
          title="Login"
          role="customer"
          leftIconName="profile"
          onPress={onLogin}
          style={styles.loginButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    minHeight: 250,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal:
      FixxamTokens.spacing.xxl,

    paddingVertical:
      FixxamTokens.spacing.xxxl,
  },

  iconContainer: {
    width:
      FixxamTokens.size.fabLarge,

    height:
      FixxamTokens.size.fabLarge,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.lg,
  },

  title: {
    marginTop:
      FixxamTokens.spacing.lg,
  },

  message: {
    maxWidth: 320,

    marginTop:
      FixxamTokens.spacing.sm,
  },

  loginButton: {
    minWidth: 140,

    marginTop:
      FixxamTokens.spacing.xl,
  },
});

export default memo(
  OrderEmptyState,
);