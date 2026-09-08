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
  AppCard,
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
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type OrderCounts = {
  pending: number;

  active: number;

  completed: number;

  cancelled: number;
};

type Props = {
  counts: OrderCounts;

  authenticated: boolean;

  onManage: () => void;
};

type StatTone =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type StatProps = {
  label: string;

  value: number;

  icon: AppIconName;

  tone: StatTone;
};

/* ==============================================================
   HELPERS
============================================================== */

function safeCount(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function OrderSummary({
  counts,
  authenticated,
  onManage,
}: Props) {
  const safeCounts =
    useMemo(
      () => ({
        pending:
          safeCount(
            counts.pending,
          ),

        active:
          safeCount(
            counts.active,
          ),

        completed:
          safeCount(
            counts.completed,
          ),

        cancelled:
          safeCount(
            counts.cancelled,
          ),
      }),
      [
        counts.active,
        counts.cancelled,
        counts.completed,
        counts.pending,
      ],
    );

  const total =
    useMemo(
      () =>
        safeCounts.pending +
        safeCounts.active +
        safeCounts.completed +
        safeCounts.cancelled,
      [
        safeCounts,
      ],
    );

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.heading
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.title
            }
          >
            Order Overview
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            {total}{" "}
            {total === 1
              ? "order"
              : "orders"}{" "}
            in total
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage orders"
          accessibilityHint="Opens your order management screen"
          accessibilityState={{
            disabled:
              !authenticated,
          }}
          disabled={
            !authenticated
          }
          hitSlop={8}
          onPress={
            onManage
          }
          style={({
            pressed,
          }) => [
            styles.manageButton,

            !authenticated
              ? styles.manageDisabled
              : null,

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

      {/* ========================================================
          STATS
      ======================================================== */}

      <View
        style={
          styles.stats
        }
      >
        <Stat
          label="Pending"
          value={
            safeCounts.pending
          }
          icon="clock"
          tone="pending"
        />

        <Stat
          label="Active"
          value={
            safeCounts.active
          }
          icon="professional"
          tone="active"
        />

        <Stat
          label="Completed"
          value={
            safeCounts.completed
          }
          icon="success"
          tone="completed"
        />

        <Stat
          label="Cancelled"
          value={
            safeCounts.cancelled
          }
          icon="error"
          tone="cancelled"
        />
      </View>
    </AppCard>
  );
}

export default memo(
  OrderSummary,
);

/* ==============================================================
   STAT
============================================================== */

const Stat =
  memo(
    function Stat({
      label,
      value,
      icon,
      tone,
    }: StatProps) {
      const appearance =
        getStatAppearance(
          tone,
        );

      return (
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${label}: ${value}`}
          style={[
            styles.stat,

            {
              backgroundColor:
                appearance.backgroundColor,

              borderColor:
                appearance.borderColor,
            },
          ]}
        >
          <View
            style={[
              styles.statIcon,

              {
                backgroundColor:
                  appearance.iconBackgroundColor,
              },
            ]}
          >
            <AppIcon
              name={
                icon
              }
              role="customer"
              size="sm"
              state={
                appearance.iconState
              }
            />
          </View>

          <View
            style={
              styles.statContent
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              numberOfLines={1}
              style={{
                color:
                  appearance.valueColor,
              }}
            >
              {value}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
            >
              {label}
            </AppText>
          </View>
        </View>
      );
    },
  );

Stat.displayName =
  "OrderSummaryStat";

/* ==============================================================
   APPEARANCE
============================================================== */

function getStatAppearance(
  tone: StatTone,
) {
  switch (tone) {
    case "pending":
      return {
        backgroundColor:
          Colors.warningSoft,

        iconBackgroundColor:
          Colors.warningSoft,

        borderColor:
          Colors.warning,

        valueColor:
          Colors.warning,

        iconState:
          "warning" as const,
      };

    case "active":
      return {
        backgroundColor:
          CustomerColors.primarySoft,

        iconBackgroundColor:
          CustomerColors.primarySoft,

        borderColor:
          CustomerColors.primary,

        valueColor:
          CustomerColors.primary,

        iconState:
          "active" as const,
      };

    case "completed":
      return {
        backgroundColor:
          Colors.successSoft,

        iconBackgroundColor:
          Colors.successSoft,

        borderColor:
          Colors.success,

        valueColor:
          Colors.success,

        iconState:
          "success" as const,
      };

    case "cancelled":
    default:
      return {
        backgroundColor:
          Colors.errorSoft,

        iconBackgroundColor:
          Colors.errorSoft,

        borderColor:
          Colors.error,

        valueColor:
          Colors.error,

        iconState:
          "error" as const,
      };
  }
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.lg,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    heading: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    manageButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    manageDisabled: {
      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion.disabledOpacity,
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

    /* ==========================================================
       STATS
    ========================================================== */

    stats: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.sm,
    },

    stat: {
      flexGrow: 1,

      flexBasis: "47%",

      minWidth: 0,

      minHeight:
        FixxamTokens.size.cardMinHeight,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.md,
    },

    statIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    statContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },
  });