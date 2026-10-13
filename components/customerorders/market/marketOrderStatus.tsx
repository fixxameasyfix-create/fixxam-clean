import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  formatMarketDate,
  getMarketStatusConfig,
  getMarketStatusIndex,
  type MarketStatus,
} from "./marketOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  status: MarketStatus;

  createdAt: unknown;
};

type TimelineStep = {
  key: Exclude<
    MarketStatus,
    "cancelled" | "expired"
  >;

  label: string;
};

/* ============================================================
   STEPS
============================================================ */

const STEPS: TimelineStep[] = [
  {
    key: "pending",
    label: "Placed",
  },
  {
    key: "accepted",
    label: "Accepted",
  },
  {
    key: "in-progress",
    label: "On the way",
  },
  {
    key: "completed",
    label: "Delivered",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderStatus({
  status,
  createdAt,
}: Props) {
  const config =
    getMarketStatusConfig(
      status,
    );

  const currentIndex =
    Math.max(
      0,
      Math.min(
        getMarketStatusIndex(
          status,
        ),
        STEPS.length - 1,
      ),
    );

  const isTerminal =
    status === "cancelled" ||
    status === "expired";

  const placedDate =
    formatMarketDate(
      createdAt,
    );

  const progressColor =
    status === "completed"
      ? Colors.success
      : status === "pending"
        ? Colors.warning
        : CustomerColors.primary;

  const accessibilityLabel =
    [
      `Order status ${config.label}.`,
      config.message,
      placedDate
        ? `Order placed ${placedDate}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <View
      accessible
      accessibilityLabel={
        accessibilityLabel
      }
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <AppText
          variant="bodyMedium"
          weight="semibold"
          style={
            styles.title
          }
        >
          Order status
        </AppText>

        <View
          style={[
            styles.statusBadge,

            {
              backgroundColor:
                config.background,
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
            style={{
              color:
                config.color,
            }}
          >
            {config.label}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      {!isTerminal ? (
        <View
          style={
            styles.timeline
          }
        >
          {/* BASE LINE */}

          <View
            style={
              styles.timelineLine
            }
          />

          {/* ACTIVE LINE */}

          {currentIndex >
          0 ? (
            <View
              style={[
                styles.timelineProgress,

                {
                  width:
                    `${currentIndex * 25}%`,

                  backgroundColor:
                    progressColor,
                },
              ]}
            />
          ) : null}

          {/* STEPS */}

          <View
            style={
              styles.steps
            }
          >
            {STEPS.map(
              (
                step,
                index,
              ) => {
                const reached =
                  index <=
                  currentIndex;

                const completed =
                  index <
                    currentIndex ||
                  (status ===
                    "completed" &&
                    index ===
                      currentIndex);

                const active =
                  index ===
                    currentIndex &&
                  !completed;

                return (
                  <View
                    key={
                      step.key
                    }
                    style={
                      styles.step
                    }
                  >
                    <View
                      style={[
                        styles.circle,

                        completed
                          ? {
                              borderColor:
                                progressColor,

                              backgroundColor:
                                progressColor,
                            }
                          : null,

                        active
                          ? {
                              borderColor:
                                progressColor,

                              backgroundColor:
                                Colors.surface,
                            }
                          : null,
                      ]}
                    >
                      {completed ? (
                        <AppIcon
                          name="check"
                          size="xs"
                          color={
                            Colors.textInverse
                          }
                        />
                      ) : active ? (
                        <View
                          style={[
                            styles.activeDot,

                            {
                              backgroundColor:
                                progressColor,
                            },
                          ]}
                        />
                      ) : null}
                    </View>

                    <AppText
                      variant="caption"
                      weight={
                        active ||
                        completed
                          ? "semibold"
                          : undefined
                      }
                      numberOfLines={2}
                      style={[
                        styles.stepLabel,

                        reached
                          ? styles.stepLabelReached
                          : null,
                      ]}
                    >
                      {step.label}
                    </AppText>
                  </View>
                );
              },
            )}
          </View>
        </View>
      ) : null}

      {/* ======================================================
          STATUS MESSAGE
      ====================================================== */}

      <View
        style={[
          styles.message,

          {
            backgroundColor:
              config.messageBackground,
          },
        ]}
      >
        <View
          style={[
            styles.messageIcon,

            {
              backgroundColor:
                config.background,
            },
          ]}
        >
          <AppIcon
            name={
              config.icon
            }
            role="customer"
            size="xs"
            color={
              config.color
            }
          />
        </View>

        <AppText
          variant="caption"
          numberOfLines={3}
          style={
            styles.messageText
          }
        >
          {config.message}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderStatus =
  memo(
    MarketOrderStatus,
  );

MemoizedMarketOrderStatus.displayName =
  "MarketOrderStatus";

export default MemoizedMarketOrderStatus;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      padding:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    header: {
      minHeight: 28,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.xs,
    },

    title: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    statusBadge: {
      minHeight: 22,

      flexShrink: 0,

      paddingHorizontal: 7,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.chip,
    },

    statusDot: {
      width: 5,

      height: 5,

      marginRight: 4,

      borderRadius:
        FixxamTokens.radius.full,
    },

    timeline: {
      height: 52,

      marginTop:
        FixxamTokens.spacing.sm,

      position:
        "relative",
    },

    timelineLine: {
      position:
        "absolute",

      top: 8,

      left: "12.5%",

      right: "12.5%",

      height: 1,

      backgroundColor:
        Colors.divider,
    },

    timelineProgress: {
      position:
        "absolute",

      top: 8,

      left: "12.5%",

      height: 1,

      maxWidth: "75%",

      borderRadius:
        FixxamTokens.radius.full,
    },

    steps: {
      flexDirection:
        "row",
    },

    step: {
      width: "25%",

      alignItems:
        "center",
    },

    circle: {
      width: 17,

      height: 17,

      zIndex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1.5,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    activeDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,
    },

    stepLabel: {
      minHeight: 20,

      marginTop: 3,

      paddingHorizontal: 1,

      textAlign:
        "center",

      lineHeight: 12,

      color:
        Colors.textMuted,
    },

    stepLabelReached: {
      color:
        Colors.textPrimary,
    },

    message: {
      minHeight: 34,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical: 5,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,
    },

    messageIcon: {
      width: 24,

      height: 24,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    messageText: {
      flex: 1,

      minWidth: 0,

      marginLeft: 6,

      lineHeight: 14,

      color:
        Colors.textPrimary,
    },
  });