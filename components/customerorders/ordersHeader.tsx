import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

export interface OrdersHeaderProps {
  authenticated: boolean;

  onManage: () => void;
}

function OrdersHeader({
  authenticated,
  onManage,
}: OrdersHeaderProps) {
  const handleBack =
    useCallback(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, []);

  const handleManage =
    useCallback(() => {
      if (!authenticated) {
        return;
      }

      onManage();
    }, [
      authenticated,
      onManage,
    ]);

  return (
    <View style={styles.header}>
      
      <View style={styles.textContainer}>
        <AppText
          variant="heading3"
          numberOfLines={1}
        >
          My Orders
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={styles.subtitle}
        >
          Track and manage your service requests
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Manage orders"
        accessibilityState={{
          disabled:
            !authenticated,
        }}
        disabled={!authenticated}
        hitSlop={8}
        onPress={handleManage}
        style={({ pressed }) => [
          styles.iconButton,

          authenticated
            ? null
            : styles.disabledButton,

          pressed &&
          authenticated
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="settings"
          role="customer"
          size="sm"
          state={
            authenticated
              ? "active"
              : "muted"
          }
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight:
      FixxamTokens.size.headerHeight,

    width: "100%",

    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    width:
      FixxamTokens.size
        .minimumTouchTarget,

    height:
      FixxamTokens.size
        .minimumTouchTarget,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.iconButton,

    backgroundColor:
      Colors.surface,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,

    marginHorizontal:
      FixxamTokens.spacing.md,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },

  disabledButton: {
    borderColor:
      Colors.border,

    backgroundColor:
      Colors.disabledBackground,

    opacity:
      FixxamTokens.motion
        .disabledOpacity,
  },

  pressed: {
    opacity:
      FixxamTokens.motion
        .pressedOpacity,

    backgroundColor:
      CustomerColors.primarySoft,

    transform: [
      {
        scale:
          FixxamTokens.motion
            .scalePressed,
      },
    ],
  },
});

export default memo(
  OrdersHeader,
);