import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  AppDivider,
} from "@/components/common";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type MarketPaymentMethod =
  | "cash"
  | "card"
  | "transfer";

type Props = {
  paymentMethod:
    MarketPaymentMethod;

  paymentStatus: string;

  itemCount: number;

  subtotal: number;

  deliveryFee: number;

  total: number;

  note?: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function formatMoney(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value)
      ? Math.max(
          0,
          value,
        )
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
  )}`;
}

function formatPaymentMethod(
  method: MarketPaymentMethod,
): string {
  switch (method) {
    case "card":
      return "Card Payment";

    case "transfer":
      return "Bank Transfer";

    case "cash":
    default:
      return "Pay on Delivery";
  }
}

function formatPaymentStatus(
  value: string,
): string {
  const cleanValue =
    value
      .trim()
      .toLowerCase();

  if (!cleanValue) {
    return "Pending";
  }

  return cleanValue
    .split(
      /[\s_-]+/,
    )
    .filter(Boolean)
    .map(
      item =>
        item
          .charAt(0)
          .toUpperCase() +
        item.slice(1),
    )
    .join(" ");
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketPaymentSummarySection({
  paymentMethod,
  paymentStatus,
  itemCount,
  subtotal,
  deliveryFee,
  total,
  note,
}: Props) {
  const cleanNote =
    note?.trim() ??
    "";

  return (
    <>
      {/* ========================================================
          PAYMENT
      ======================================================== */}

      <AppCard
        role="worker"
        variant="outlined"
        style={
          styles.card
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          Payment
        </AppText>

        <View
          style={
            styles.paymentRow
          }
        >
          <View
            style={
              styles.workerAccentIcon
            }
          >
            <AppIcon
              name={
                paymentMethod ===
                "cash"
                  ? "wallet"
                  : "payment"
              }
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.paymentInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="medium"
              numberOfLines={1}
              style={
                styles.paymentMethod
              }
            >
              {formatPaymentMethod(
                paymentMethod,
              )}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.paymentStatus
              }
            >
              Payment:{" "}
              {formatPaymentStatus(
                paymentStatus,
              )}
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* ========================================================
          ORDER SUMMARY
      ======================================================== */}

      <AppCard
        role="worker"
        variant="outlined"
        style={
          styles.card
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          Order Summary
        </AppText>

        <SummaryRow
          label="Items"
          value={`${itemCount} ${
            itemCount === 1
              ? "item"
              : "items"
          }`}
        />

        <SummaryRow
          label="Subtotal"
          value={
            formatMoney(
              subtotal,
            )
          }
        />

        <SummaryRow
          label="Delivery fee"
          value={
            formatMoney(
              deliveryFee,
            )
          }
        />

        <AppDivider
          style={
            styles.summaryDivider
          }
        />

        <View
          style={
            styles.totalRow
          }
        >
          <AppText
            variant="bodyLarge"
            weight="medium"
            style={
              styles.totalLabel
            }
          >
            Total
          </AppText>

          <AppText
            variant="heading2"
            weight="bold"
            numberOfLines={1}
            style={
              styles.totalValue
            }
          >
            {formatMoney(
              total,
            )}
          </AppText>
        </View>
      </AppCard>

      {/* ========================================================
          CUSTOMER NOTE
      ======================================================== */}

      {cleanNote ? (
        <AppCard
          role="worker"
          variant="accent"
          style={
            styles.noteCard
          }
        >
          <View
            style={
              styles.noteIcon
            }
          >
            <AppIcon
              name="messages"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.noteContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="medium"
              style={
                styles.noteTitle
              }
            >
              Customer Note
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.noteText
              }
            >
              {cleanNote}
            </AppText>
          </View>
        </AppCard>
      ) : null}
    </>
  );
}

export default memo(
  WorkerMarketPaymentSummarySection,
);

/* ==============================================================
   SUMMARY ROW
============================================================== */

const SummaryRow =
  memo(
    function SummaryRow({
      label,
      value,
    }: {
      label: string;

      value: string;
    }) {
      return (
        <View
          style={
            styles.summaryRow
          }
        >
          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.summaryLabel
            }
          >
            {label}
          </AppText>

          <AppText
            variant="body"
            weight="medium"
            numberOfLines={1}
            style={
              styles.summaryValue
            }
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

SummaryRow.displayName =
  "WorkerMarketSummaryRow";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,
    },

    sectionTitle: {
      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       PAYMENT
    ========================================================== */

    paymentRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    workerAccentIcon: {
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

      backgroundColor:
        WorkerColors.primarySoft,
    },

    paymentInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    paymentMethod: {
      color:
        Colors.textPrimary,
    },

    paymentStatus: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       SUMMARY
    ========================================================== */

    summaryRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.lg,
    },

    summaryLabel: {
      flexShrink: 0,

      color:
        Colors.textSecondary,
    },

    summaryValue: {
      flex: 1,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    summaryDivider: {
      marginVertical:
        FixxamTokens.spacing.lg,
    },

    totalRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.lg,
    },

    totalLabel: {
      color:
        Colors.textPrimary,
    },

    totalValue: {
      flexShrink: 1,

      textAlign:
        "right",

      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       NOTE
    ========================================================== */

    noteCard: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",
    },

    noteIcon: {
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

      backgroundColor:
        WorkerColors.primarySoft,
    },

    noteContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    noteTitle: {
      color:
        WorkerColors.primary,
    },

    noteText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });