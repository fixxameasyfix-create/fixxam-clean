import React, {
  memo,
  useMemo,
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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type MarketOrderStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

type Props = {
  status?: string | null;
};

type Step = {
  key: MarketOrderStatus;

  label: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const STEPS: Step[] = [
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
   HELPERS
============================================================ */

function safeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizeStatus(
  value: unknown,
): MarketOrderStatus {
  const status =
    safeString(
      value,
    )
      .toLowerCase()
      .replace(
        /[_\s]+/g,
        "-",
      );

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

function getStepIndex(
  status: MarketOrderStatus,
): number {
  switch (status) {
    case "accepted":
      return 1;

    case "in-progress":
      return 2;

    case "completed":
      return 3;

    case "pending":
    default:
      return 0;
  }
}

function getStatusConfig(
  status: MarketOrderStatus,
) {
  switch (status) {
    case "accepted":
      return {
        label:
          "Accepted",

        color:
          WorkerColors.primary,

        backgroundColor:
          WorkerColors.primarySoft,

        icon:
          "check" as const,

        message:
          "Ready to start delivery.",
      };

    case "in-progress":
      return {
        label:
          "On the way",

        color:
          WorkerColors.primary,

        backgroundColor:
          WorkerColors.primarySoft,

        icon:
          "navigation" as const,

        message:
          "Delivery is in progress.",
      };

    case "completed":
      return {
        label:
          "Delivered",

        color:
          Colors.success,

        backgroundColor:
          Colors.successSoft,

        icon:
          "success" as const,

        message:
          "Order delivered successfully.",
      };

    case "cancelled":
      return {
        label:
          "Cancelled",

        color:
          Colors.error,

        backgroundColor:
          Colors.errorSoft,

        icon:
          "error" as const,

        message:
          "This order has been cancelled.",
      };

    case "expired":
      return {
        label:
          "Expired",

        color:
          Colors.textSecondary,

        backgroundColor:
          Colors.disabledBackground,

        icon:
          "clock" as const,

        message:
          "This order has expired.",
      };

    case "pending":
    default:
      return {
        label:
          "Pending",

        color:
          Colors.warning,

        backgroundColor:
          Colors.warningSoft,

        icon:
          "clock" as const,

        message:
          "Waiting for you to accept this order.",
      };
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketOrderStatus({
  status,
}: Props) {
  const normalizedStatus =
    useMemo(
      () =>
        normalizeStatus(
          status,
        ),
      [
        status,
      ],
    );

  const activeStepIndex =
    useMemo(
      () =>
        getStepIndex(
          normalizedStatus,
        ),
      [
        normalizedStatus,
      ],
    );

  const statusConfig =
    useMemo(
      () =>
        getStatusConfig(
          normalizedStatus,
        ),
      [
        normalizedStatus,
      ],
    );

  const isClosed =
    normalizedStatus ===
      "cancelled" ||
    normalizedStatus ===
      "expired";

  return (
    <View
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
          variant="bodyLarge"
          weight="bold"
          style={
            styles.title
          }
        >
          Order status
        </AppText>

        <View
          style={[
            styles.badge,

            {
              backgroundColor:
                statusConfig.backgroundColor,
            },
          ]}
        >
          <View
            style={[
              styles.badgeDot,

              {
                backgroundColor:
                  statusConfig.color,
              },
            ]}
          />

          <AppText
            variant="caption"
            weight="medium"
            numberOfLines={1}
            style={{
              color:
                statusConfig.color,
            }}
          >
            {statusConfig.label}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <View
        style={
          styles.progressContainer
        }
      >
        {STEPS.map(
          (
            step,
            index,
          ) => {
            const reached =
              !isClosed &&
              index <=
                activeStepIndex;

            const connectorReached =
              !isClosed &&
              index <
                activeStepIndex;

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
                  style={
                    styles.stepTrackRow
                  }
                >
                  <View
                    style={[
                      styles.connector,

                      index === 0
                        ? styles.connectorHidden
                        : null,

                      reached
                        ? styles.connectorActive
                        : null,
                    ]}
                  />

                  <View
                    style={[
                      styles.node,

                      reached
                        ? styles.nodeActive
                        : null,
                    ]}
                  >
                    {reached ? (
                      <View
                        style={
                          styles.nodeInner
                        }
                      />
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.connector,

                      index ===
                      STEPS.length -
                        1
                        ? styles.connectorHidden
                        : null,

                      connectorReached
                        ? styles.connectorActive
                        : null,
                    ]}
                  />
                </View>

                <AppText
                  variant="caption"
                  numberOfLines={2}
                  center
                  style={[
                    styles.stepLabel,

                    reached
                      ? styles.stepLabelActive
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

      {/* ======================================================
          STATUS NOTE
      ====================================================== */}

      <View
        style={[
          styles.messageBox,

          {
            backgroundColor:
              statusConfig.backgroundColor,
          },
        ]}
      >
        <AppIcon
          name={
            statusConfig.icon
          }
          size="xs"
          color={
            statusConfig.color
          }
        />

        <AppText
          variant="caption"
          numberOfLines={2}
          style={
            styles.messageText
          }
        >
          {statusConfig.message}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketOrderStatus.displayName =
  "WorkerMarketOrderStatus";

export default memo(
  WorkerMarketOrderStatus,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal: 8,

      paddingVertical: 7,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    header: {
      minHeight: 24,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 6,
    },

    title: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    badge: {
      minHeight: 21,

      flexShrink: 0,

      paddingHorizontal: 6,

      paddingVertical: 1,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 4,

      borderRadius:
        FixxamTokens.radius.full,
    },

    badgeDot: {
      width: 5,

      height: 5,

      borderRadius:
        FixxamTokens.radius.full,
    },

    /* ========================================================
       PROGRESS
    ======================================================== */

    progressContainer: {
      width: "100%",

      marginTop: 7,

      flexDirection:
        "row",
    },

    step: {
      flex: 1,

      minWidth: 0,

      alignItems:
        "center",
    },

    stepTrackRow: {
      width: "100%",

      height: 16,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    connector: {
      flex: 1,

      height: 1,

      backgroundColor:
        Colors.divider,
    },

    connectorHidden: {
      backgroundColor:
        "transparent",
    },

    connectorActive: {
      backgroundColor:
        WorkerColors.primary,
    },

    node: {
      width: 15,

      height: 15,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1.5,

      borderColor:
        Colors.divider,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    nodeActive: {
      borderColor:
        WorkerColors.primary,
    },

    nodeInner: {
      width: 5,

      height: 5,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    stepLabel: {
      minHeight: 18,

      marginTop: 2,

      paddingHorizontal: 1,

      lineHeight: 12,

      color:
        Colors.textMuted,
    },

    stepLabelActive: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       STATUS NOTE
    ======================================================== */

    messageBox: {
      minHeight: 30,

      marginTop: 6,

      paddingHorizontal: 7,

      paddingVertical: 4,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    messageText: {
      flex: 1,

      minWidth: 0,

      lineHeight: 13,

      color:
        Colors.textPrimary,
    },
  });