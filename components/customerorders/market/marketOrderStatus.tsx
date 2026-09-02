import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import {
  formatMarketDate,
  getMarketStatusConfig,
  getMarketStatusIndex,
  type MarketStatus,
} from "./marketOrder.utils";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  status: MarketStatus;
  createdAt: unknown;
};

/* ==============================================================
   TIMELINE STEPS
============================================================== */

const STEPS: {
  key: MarketStatus;
  label: string;
}[] = [
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

/* ==============================================================
   COMPONENT
============================================================== */

export default function MarketOrderStatus({
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
    status ===
      "cancelled" ||
    status ===
      "expired";

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ========================================================
          TITLE
      ======================================================== */}

      <AppText
        weight="bold"
        style={
          styles.title
        }
      >
        Order Status
      </AppText>

      {/* ========================================================
          TIMELINE
      ======================================================== */}

      {isTerminal ? (
        <TerminalStatus
          status={
            status
          }
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
          <View
            style={
              styles.timelineLine
            }
          />

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

                return (
                  <View
                    key={
                      step.key
                    }
                    style={
                      styles.step
                    }
                  >
                    {/* CIRCLE */}

                    <View
                      style={[
                        styles.circle,
                        completed &&
                          styles.circleCompleted,
                        active &&
                          styles.circleActive,
                      ]}
                    >
                      {completed ? (
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color="#FFFFFF"
                        />
                      ) : active ? (
                        <View
                          style={
                            styles.activeDot
                          }
                        />
                      ) : null}
                    </View>

                    {/* LABEL */}

                    <AppText
                      weight={
                        active
                          ? "bold"
                          : undefined
                      }
                      numberOfLines={
                        2
                      }
                      style={[
                        styles.stepLabel,
                        active &&
                          styles.stepLabelActive,
                      ]}
                    >
                      {
                        step.label
                      }
                    </AppText>

                    {/* DATE */}

                    {index ===
                    0 ? (
                      <AppText
                        style={
                          styles.date
                        }
                      >
                        {formatMarketDate(
                          createdAt,
                        )}
                      </AppText>
                    ) : null}
                  </View>
                );
              },
            )}
          </View>
        </View>
      )}

      {/* ========================================================
          STATUS MESSAGE
      ======================================================== */}

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
          <Ionicons
            name={
              config.icon
            }
            size={20}
            color={
              config.color
            }
          />
        </View>

        <AppText
          style={
            styles.messageText
          }
        >
          {
            config.message
          }
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   TERMINAL STATUS
============================================================== */

function TerminalStatus({
  status,
  config,
}: {
  status: MarketStatus;
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
        <Ionicons
          name={
            status ===
            "cancelled"
              ? "close-outline"
              : "time-outline"
          }
          size={25}
          color={
            config.color
          }
        />
      </View>

      <AppText
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

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      marginTop: 10,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    title: {
      fontSize: 14,
      color: "#0F172A",
    },

    /* ========================================================
       TIMELINE
    ======================================================== */

    timeline: {
      marginTop: 19,
      minHeight: 84,
      position: "relative",
    },

    timelineLine: {
      position: "absolute",
      top: 12,
      left: "12.5%",
      right: "12.5%",
      height: 2,
      backgroundColor:
        "#E2E8F0",
    },

    steps: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    step: {
      width: "25%",
      alignItems: "center",
    },

    circle: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 2,
      borderColor:
        "#CBD5E1",
      alignItems: "center",
      justifyContent:
        "center",
    },

    circleCompleted: {
      backgroundColor:
        "#16A34A",
      borderColor:
        "#16A34A",
    },

    circleActive: {
      backgroundColor:
        "#FFFFFF",
      borderColor:
        "#2563EB",
    },

    activeDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor:
        "#2563EB",
    },

    stepLabel: {
      marginTop: 6,
      fontSize: 7.5,
      lineHeight: 10,
      textAlign: "center",
      color: "#64748B",
    },

    stepLabelActive: {
      color: "#0F172A",
    },

    date: {
      marginTop: 2,
      fontSize: 6.8,
      color: "#94A3B8",
      textAlign: "center",
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    message: {
      marginTop: 14,
      padding: 10,
      borderRadius: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    messageIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent:
        "center",
    },

    messageText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#334155",
    },

    /* ========================================================
       TERMINAL
    ======================================================== */

    terminal: {
      marginTop: 17,
      minHeight: 65,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
    },

    terminalIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
    },

    terminalTitle: {
      marginTop: 6,
      fontSize: 10,
    },
  });