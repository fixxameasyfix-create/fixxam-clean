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

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

export type WorkerMarketPaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | string;

type Props = {
  paymentMethod?: WorkerMarketPaymentMethod;

  paymentStatus?: string;
};

type PaymentConfig = {
  label: string;

  icon: AppIconName;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeValue(
  value: unknown,
  fallback: string,
): string {
  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

function normalizeStatus(
  value: unknown,
): string {
  return normalizeValue(
    value,
    "pending",
  )
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    );
}

function getPaymentConfig(
  method: string,
): PaymentConfig {
  switch (
    method
      .trim()
      .toLowerCase()
  ) {
    case "cash":
      return {
        label:
          "Pay on Delivery",

        icon:
          "wallet",
      };

    case "card":
      return {
        label:
          "Card Payment",

        icon:
          "payment",
      };

    case "transfer":
      return {
        label:
          "Bank Transfer",

        icon:
          "payment",
      };

    default:
      return {
        label:
          "Payment Method",

        icon:
          "wallet",
      };
  }
}

function formatStatusLabel(
  status: string,
): string {
  if (
    status === "paid" ||
    status === "completed" ||
    status === "success" ||
    status === "successful"
  ) {
    return "Paid";
  }

  return status
    .replace(
      /-/g,
      " ",
    )
    .replace(
      /\b\w/g,
      character =>
        character.toUpperCase(),
    );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketPayment({
  paymentMethod,
  paymentStatus,
}: Props) {
  const method =
    normalizeValue(
      paymentMethod,
      "cash",
    );

  const normalizedStatus =
    normalizeStatus(
      paymentStatus,
    );

  const config =
    getPaymentConfig(
      method,
    );

  const isPaid =
    normalizedStatus ===
      "paid" ||
    normalizedStatus ===
      "completed" ||
    normalizedStatus ===
      "success" ||
    normalizedStatus ===
      "successful";

  const statusLabel =
    formatStatusLabel(
      normalizedStatus,
    );

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Payment
      </AppText>

      {/* ======================================================
          PAYMENT METHOD
      ====================================================== */}

      <View
        style={
          styles.row
        }
      >
        <View
          style={
            styles.iconBox
          }
        >
          <AppIcon
            name={
              config.icon
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
            styles.content
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.method
            }
          >
            {config.label}
          </AppText>

          {/* ==================================================
              STATUS
          ================================================== */}

          <View
            style={
              styles.statusRow
            }
          >
            <View
              style={[
                styles.statusDot,

                isPaid
                  ? styles.statusDotPaid
                  : styles.statusDotPending,
              ]}
            />

            <AppText
              variant="caption"
              weight="bold"
              style={[
                styles.statusText,

                isPaid
                  ? styles.statusPaid
                  : styles.statusPending,
              ]}
            >
              Payment: {statusLabel}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketPayment.displayName =
  "WorkerMarketPayment";

export default memo(
  WorkerMarketPayment,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    title: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       METHOD
    ======================================================== */

    row: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconBox: {
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
        WorkerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    method: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    statusDot: {
      width: 7,

      height: 7,

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusDotPaid: {
      backgroundColor:
        Colors.success,
    },

    statusDotPending: {
      backgroundColor:
        Colors.warning,
    },

    statusText: {
      flexShrink: 1,
    },

    statusPaid: {
      color:
        Colors.success,
    },

    statusPending: {
      color:
        Colors.warning,
    },
  });