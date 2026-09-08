import React, {
  memo,
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

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import type {
  BookingStatus,
} from "@/types/booking";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  orderId: string;

  status: BookingStatus;

  onBack: () => void;
};

type StatusConfig = {
  label: string;

  backgroundColor: string;

  color: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function getStatusConfig(
  status: BookingStatus,
): StatusConfig {
  switch (status) {
    case "pending":
      return {
        label: "PENDING",
        backgroundColor:
          Colors.warningSoft,
        color:
          Colors.warning,
      };

    case "accepted":
      return {
        label: "ACCEPTED",
        backgroundColor:
          Colors.infoSoft,
        color:
          Colors.info,
      };

    case "in-progress":
      return {
        label: "IN PROGRESS",
        backgroundColor:
          Colors.infoSoft,
        color:
          Colors.info,
      };

    case "completed":
      return {
        label: "COMPLETED",
        backgroundColor:
          Colors.successSoft,
        color:
          Colors.success,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        backgroundColor:
          Colors.errorSoft,
        color:
          Colors.error,
      };

    case "expired":
      return {
        label: "EXPIRED",
        backgroundColor:
          Colors.disabledBackground,
        color:
          Colors.textSecondary,
      };

    default:
      return {
        label: "PENDING",
        backgroundColor:
          Colors.warningSoft,
        color:
          Colors.warning,
      };
  }
}

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerOrderHeader({
  orderId,
  status,
  onBack,
}: Props) {
  const config =
    getStatusConfig(status);

  const safeOrderId =
    useMemo(() => {
      const value =
        typeof orderId === "string"
          ? orderId.trim()
          : "";

      return value || "—";
    }, [orderId]);

  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          BACK
      ====================================================== */}

      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={({ pressed }) => [
          styles.backButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="back"
          size="sm"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={styles.title}
        >
          Order Details
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.subtitle
          }
        >
          #{safeOrderId}
        </AppText>
      </View>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        accessibilityRole="text"
        accessibilityLabel={`Order status: ${config.label}`}
        style={[
          styles.statusBadge,

          {
            backgroundColor:
              config.backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,

            {
              backgroundColor:
                config.color,
            },
          ]}
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.statusText,

            {
              color:
                config.color,
            },
          ]}
        >
          {config.label}
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   EXPORT
============================================================== */

export default memo(
  CustomerOrderHeader,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection: "row",

      alignItems: "center",
    },

    /* ========================================================
       BACK
    ======================================================== */

    backButton: {
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
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
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

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      flexShrink: 0,

      minHeight: 28,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,
    },

    statusDot: {
      width: 7,

      height: 7,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusText: {
      flexShrink: 0,
    },
  });