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

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  WorkerOrderCounts,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  counts: WorkerOrderCounts;

  onManage: () => void;
};

type StatTone =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type OverviewStatProps = {
  label: string;

  count: number;

  icon: AppIconName;

  tone: StatTone;
};

type StatConfig = {
  color: string;

  backgroundColor: string;
};

/* ==============================================================
   STAT CONFIG
============================================================== */

function getStatConfig(
  tone: StatTone,
): StatConfig {
  switch (tone) {
    case "pending":
      return {
        color:
          Colors.warning,

        backgroundColor:
          Colors.warningSoft,
      };

    case "active":
      return {
        color:
          Colors.info,

        backgroundColor:
          Colors.infoSoft,
      };

    case "completed":
      return {
        color:
          Colors.success,

        backgroundColor:
          Colors.successSoft,
      };

    case "cancelled":
    default:
      return {
        color:
          Colors.error,

        backgroundColor:
          Colors.errorSoft,
      };
  }
}

/* ==============================================================
   OVERVIEW STAT
============================================================== */

const OverviewStat =
  memo(
    function OverviewStat({
      label,
      count,
      icon,
      tone,
    }: OverviewStatProps) {
      const config =
        useMemo(
          () =>
            getStatConfig(
              tone,
            ),
          [
            tone,
          ],
        );

      return (
        <View
          style={
            styles.stat
          }
          accessibilityLabel={`${label}: ${count}`}
        >
          <View
            style={[
              styles.statIcon,

              {
                backgroundColor:
                  config.backgroundColor,
              },
            ]}
          >
            <AppIcon
              name={
                icon
              }
              size="sm"
              color={
                config.color
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
              style={
                styles.statValue
              }
            >
              {count}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.statLabel
              }
            >
              {label}
            </AppText>
          </View>
        </View>
      );
    },
  );

OverviewStat.displayName =
  "WorkerOrdersOverviewStat";

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrdersOverview({
  counts,
  onManage,
}: Props) {
  return (
    <View
      style={
        styles.container
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
            styles.headerContent
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.title
            }
          >
            Job overview
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Your service activity
          </AppText>
        </View>

        <Pressable
          onPress={
            onManage
          }
          accessibilityRole="button"
          accessibilityLabel="Manage jobs"
          style={({
            pressed,
          }) => [
            styles.manageButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="settings"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.manageText
            }
          >
            MANAGE
          </AppText>
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
        <OverviewStat
          label="Requests"
          count={
            counts.pending
          }
          icon="clock"
          tone="pending"
        />

        <OverviewStat
          label="Active"
          count={
            counts.active
          }
          icon="jobs"
          tone="active"
        />

        <OverviewStat
          label="Done"
          count={
            counts.completed
          }
          icon="success"
          tone="completed"
        />

        <OverviewStat
          label="Cancelled"
          count={
            counts.cancelled
          }
          icon="error"
          tone="cancelled"
        />
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerOrdersOverview.displayName =
  "WorkerOrdersOverview";

export default memo(
  WorkerOrdersOverview,
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
      width: "100%",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
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

    headerContent: {
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

      color:
        Colors.textMuted,
    },

    manageButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

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

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    manageText: {
      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       STATS
    ========================================================== */

    stats: {
      marginTop:
        FixxamTokens.spacing.md,

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

      minHeight: 72,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
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
    },

    statValue: {
      color:
        Colors.textPrimary,
    },

    statLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    /* ==========================================================
       STATES
    ========================================================== */

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