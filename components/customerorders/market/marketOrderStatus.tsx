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
   TIMELINE STEPS
============================================================ */

const STEPS: TimelineStep[] = [
  {
    key: "pending",
    label: "Order placed",
  },
  {
    key: "accepted",
    label: "Seller accepted",
  },
  {
    key: "in-progress",
    label: "On the way",
  },
  {
    key: "completed",
    label: "Completed",
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
    getMarketStatusIndex(
      status,
    );

  const isTerminal =
    status === "cancelled" ||
    status === "expired";

  const placedDate =
    formatMarketDate(
      createdAt,
    );

  return (
    <View
      style={
        styles.card
      }
      accessibilityLabel={`Order status ${config.label}. ${config.message}`}
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="body"
        weight="bold"
        style={
          styles.title
        }
      >
        Order Status
      </AppText>

      {/* ======================================================
          TIMELINE / TERMINAL
      ====================================================== */}

      {isTerminal ? (
        <TerminalStatus
          config={
            config
          }
        />
      ) : (
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

          {/* PROGRESS LINE */}

          {currentIndex > 0 ? (
            <View
              style={[
                styles.timelineProgress,

                {
                  width:
                    `${Math.min(
                      currentIndex,
                      3,
                    ) * 25}%`,
                },
              ]}
            />
          ) : null}

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
                const completed =
                  index <
                  currentIndex;

                const active =
                  index ===
                  currentIndex;

                const activeColor =
                  status ===
                  "completed"
                    ? Colors.success
                    : status ===
                        "pending"
                      ? Colors.warning
                      : CustomerColors.primary;

                return (
                  <View
                    key={
                      step.key
                    }
                    style={
                      styles.step
                    }
                  >
                    {/* ========================================
                        CIRCLE
                    ======================================== */}

                    <View
                      style={[
                        styles.circle,

                        completed
                          ? styles.circleCompleted
                          : null,

                        active
                          ? {
                              borderColor:
                                activeColor,

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
                                activeColor,
                            },
                          ]}
                        />
                      ) : null}
                    </View>

                    {/* ========================================
                        LABEL
                    ======================================== */}

                    <AppText
                      variant="caption"
                      weight={
                        active
                          ? "bold"
                          : undefined
                      }
                      numberOfLines={2}
                      style={[
                        styles.stepLabel,

                        active
                          ? styles.stepLabelActive
                          : null,
                      ]}
                    >
                      {step.label}
                    </AppText>

                    {/* ========================================
                        CREATED DATE
                    ======================================== */}

                    {index === 0 ? (
                      <AppText
                        variant="caption"
                        numberOfLines={2}
                        style={
                          styles.date
                        }
                      >
                        {placedDate}
                      </AppText>
                    ) : null}
                  </View>
                );
              },
            )}
          </View>
        </View>
      )}

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
            size="sm"
            color={
              config.color
            }
          />
        </View>

        <AppText
          variant="caption"
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
   TERMINAL STATUS
============================================================ */

function TerminalStatus({
  config,
}: {
  config: ReturnType<
    typeof getMarketStatusConfig
  >;
}) {
  return (
    <View
      style={
        styles.terminal
      }
    >
      <View
        style={[
          styles.terminalIcon,

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
          size="md"
          color={
            config.color
          }
        />
      </View>

      <AppText
        variant="caption"
        weight="bold"
        style={[
          styles.terminalTitle,

          {
            color:
              config.color,
          },
        ]}
      >
        {config.label}
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.sm,

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

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       TIMELINE
    ======================================================== */

    timeline: {
      minHeight: 92,

      marginTop:
        FixxamTokens.spacing.lg,

      position:
        "relative",
    },

    timelineLine: {
      position:
        "absolute",

      top: 13,

      left: "12.5%",

      right: "12.5%",

      height: 2,

      backgroundColor:
        Colors.divider,
    },

    timelineProgress: {
      position:
        "absolute",

      top: 13,

      left: "12.5%",

      height: 2,

      maxWidth: "75%",

      backgroundColor:
        CustomerColors.primary,
    },

    steps: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",
    },

    step: {
      width: "25%",

      alignItems:
        "center",
    },

    circle: {
      width: 28,

      height: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    circleCompleted: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    activeDot: {
      width: 10,

      height: 10,

      borderRadius:
        FixxamTokens.radius.full,
    },

    stepLabel: {
      minHeight: 30,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.xxs,

      textAlign:
        "center",

      lineHeight: 14,

      color:
        Colors.textSecondary,
    },

    stepLabelActive: {
      color:
        Colors.textPrimary,
    },

    date: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign:
        "center",

      color:
        Colors.textMuted,
    },

    /* ========================================================
       STATUS MESSAGE
    ======================================================== */

    message: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,
    },

    messageIcon: {
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
    },

    messageText: {
      flex: 1,

      lineHeight: 16,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       TERMINAL
    ======================================================== */

    terminal: {
      minHeight: 92,

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    terminalIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    terminalTitle: {
      marginTop:
        FixxamTokens.spacing.sm,
    },
  });