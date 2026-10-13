import React, {
  memo,
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
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          MAIN HEADER
      ======================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to market orders"
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
            size="xs"
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
            variant="bodyLarge"
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
          accessibilityHint="Reload the latest order information"
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
          {refreshing ? (
            <AppLoader
              role="worker"
              size="sm"
            />
          ) : (
            <AppIcon
              name="refresh"
              role="worker"
              size="xs"
              color={
                WorkerColors.primary
              }
            />
          )}
        </Pressable>
      </View>

      {/* ========================================================
          META
      ======================================================== */}

      <View
        style={
          styles.metaSection
        }
      >
        <View
          style={
            styles.metaTop
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
            numberOfLines={1}
            style={
              styles.orderId
            }
          >
            #{displayOrderId}
          </AppText>
        </View>

        <View
          style={
            styles.dateRow
          }
        >
          <AppIcon
            name="clock"
            size="xs"
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="caption"
            numberOfLines={1}
            style={
              styles.dateText
            }
          >
            Requested {createdDate}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerMarketOrderHeaderSection.displayName =
  "WorkerMarketOrderHeaderSection";

export default memo(
  WorkerMarketOrderHeaderSection,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      width:
        "100%",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.sm,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.background,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      width:
        "100%",

      minHeight:
        60,

      paddingVertical:
        FixxamTokens.spacing.xs,

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

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    headerCenter: {
      flex:
        1,

      minWidth:
        0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        1,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       META
    ========================================================== */

    metaSection: {
      width:
        "100%",

      paddingTop:
        FixxamTokens.spacing.xs,
    },

    metaTop: {
      width:
        "100%",

      minHeight:
        26,

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
      minHeight:
        26,

      maxWidth:
        "60%",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        3,

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
      flexShrink:
        1,

      color:
        Colors.textMuted,
    },

    dateRow: {
      minHeight:
        22,

      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    dateText: {
      flex:
        1,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       STATES
    ========================================================== */

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