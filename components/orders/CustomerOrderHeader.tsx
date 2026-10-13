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
   STATUS
============================================================== */

function getStatusConfig(
  status: BookingStatus,
): StatusConfig {
  switch (status) {
    case "accepted":
      return {
        label: "Accepted",
        backgroundColor: Colors.infoSoft,
        color: Colors.info,
      };

    case "in-progress":
      return {
        label: "In progress",
        backgroundColor: Colors.infoSoft,
        color: Colors.info,
      };

    case "completed":
      return {
        label: "Completed",
        backgroundColor: Colors.successSoft,
        color: Colors.success,
      };

    case "cancelled":
      return {
        label: "Cancelled",
        backgroundColor: Colors.errorSoft,
        color: Colors.error,
      };

    case "expired":
      return {
        label: "Expired",
        backgroundColor: Colors.disabledBackground,
        color: Colors.textSecondary,
      };

    case "pending":
    default:
      return {
        label: "Pending",
        backgroundColor: Colors.warningSoft,
        color: Colors.warning,
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
  const config = useMemo(
    () => getStatusConfig(status),
    [status],
  );

  const safeOrderId = useMemo(() => {
    if (
      typeof orderId !== "string"
    ) {
      return "—";
    }

    const value = orderId.trim();

    return value || "—";
  }, [orderId]);

  return (
    <View style={styles.container}>
      {/* ======================================================
          BACK
      ====================================================== */}

      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.backButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppIcon
          name="back"
          size="sm"
          color={Colors.textPrimary}
        />
      </Pressable>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <View style={styles.content}>
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
          ellipsizeMode="middle"
          style={styles.orderId}
        >
          #{safeOrderId}
        </AppText>
      </View>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        accessible
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
          weight="semibold"
          numberOfLines={1}
          style={[
            styles.statusText,
            {
              color: config.color,
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
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 52,
    paddingHorizontal:
      FixxamTokens.spacing.md,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
    backgroundColor: Colors.background,
  },

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

    borderWidth:
      StyleSheet.hairlineWidth,

    borderColor: Colors.border,

    borderRadius:
      FixxamTokens.radius.md,

    backgroundColor: Colors.surface,
  },

  pressed: {
    opacity:
      FixxamTokens.motion.pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion.scalePressed,
      },
    ],
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: Colors.textPrimary,
  },

  orderId: {
    maxWidth: "100%",
    marginTop: 1,
    fontSize: 10,
    color: Colors.textMuted,
  },

  statusBadge: {
    minHeight: 22,
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius:
      FixxamTokens.radius.full,
  },

  statusDot: {
    width: 5,
    height: 5,
    flexShrink: 0,
    borderRadius:
      FixxamTokens.radius.full,
  },

  statusText: {
    flexShrink: 0,
    fontSize: 10,
  },
});

/* ==============================================================
   EXPORT
============================================================== */

CustomerOrderHeader.displayName =
  "CustomerOrderHeader";

export default memo(
  CustomerOrderHeader,
);