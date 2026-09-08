import React, {
  memo,
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

import {
  AppLoader,
} from "@/components/common";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  orderId: string;

  createdDate: string;

  refreshing: boolean;

  statusLabel: string;

  statusIcon: AppIconName;

  statusColor: string;

  statusBackgroundColor: string;

  onBack: () => void;

  onRefresh: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function getDisplayOrderId(
  value: string,
): string {
  const cleanValue =
    value.trim();

  if (!cleanValue) {
    return "—";
  }

  return cleanValue
    .slice(0, 9)
    .toUpperCase();
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketOrderHeaderSection({
  orderId,
  createdDate,
  refreshing,
  statusLabel,
  statusIcon,
  statusColor,
  statusBackgroundColor,
  onBack,
  onRefresh,
}: Props) {
  const displayOrderId =
    getDisplayOrderId(
      orderId,
    );

  return (
    <>
      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={
            onBack
          }
          style={({
            pressed,
          }) => [
            styles.headerButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            size="md"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.headerCenter
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            center
            numberOfLines={1}
            style={
              styles.headerTitle
            }
          >
            Order Details
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            numberOfLines={1}
            style={
              styles.headerSubtitle
            }
          >
            Market order
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            refreshing
              ? "Refreshing order"
              : "Refresh order"
          }
          accessibilityState={{
            disabled:
              refreshing,

            busy:
              refreshing,
          }}
          disabled={
            refreshing
          }
          hitSlop={8}
          onPress={
            onRefresh
          }
          style={({
            pressed,
          }) => [
            styles.headerButton,

            refreshing
              ? styles.disabled
              : null,

            pressed &&
            !refreshing
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="refresh"
            role="worker"
            size="sm"
            color={
              refreshing
                ? Colors.textMuted
                : WorkerColors.primary
            }
          />
        </Pressable>
      </View>

      <AppCard
        role="worker"
        variant="outlined"
        style={
          styles.card
        }
      >
        <View
          style={
            styles.orderHeaderTop
          }
        >
          <View
            style={[
              styles.statusBadge,

              {
                backgroundColor:
                  statusBackgroundColor,
              },
            ]}
          >
            <AppIcon
              name={
                statusIcon
              }
              size="xs"
              color={
                statusColor
              }
            />

            <AppText
              variant="caption"
              weight="medium"
              numberOfLines={1}
              style={{
                color:
                  statusColor,
              }}
            >
              {statusLabel}
            </AppText>
          </View>

          <AppText
            variant="caption"
            tone="muted"
            numberOfLines={1}
            style={
              styles.orderId
            }
          >
            #{displayOrderId}
          </AppText>
        </View>

        <AppText
          variant="heading2"
          weight="bold"
          numberOfLines={1}
          style={
            styles.orderTitle
          }
        >
          Market Order
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.orderDate
          }
        >
          Requested on{" "}
          {createdDate}
        </AppText>

        {refreshing ? (
          <View
            accessibilityLiveRegion="polite"
            style={
              styles.refreshingRow
            }
          >
            <AppLoader
              role="worker"
              size="sm"
            />

            <AppText
              variant="caption"
              weight="medium"
              style={
                styles.refreshingText
              }
            >
              Updating...
            </AppText>
          </View>
        ) : null}
      </AppCard>
    </>
  );
}

export default memo(
  WorkerMarketOrderHeaderSection,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerButton: {
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

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerCenter: {
      flex: 1,

      minWidth: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,
    },

    orderHeaderTop: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    statusBadge: {
      maxWidth: "65%",

      minHeight: 30,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    orderId: {
      flexShrink: 1,

      maxWidth: "45%",

      color:
        Colors.textMuted,
    },

    orderTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    orderDate: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    refreshingRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    refreshingText: {
      color:
        WorkerColors.primary,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
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