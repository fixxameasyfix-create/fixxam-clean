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
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  paymentMethod?: string | null;

  paymentStatus?: string | null;
};

type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "unknown";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

/* ============================================================
   HELPERS
============================================================ */

function safeString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizePaymentMethod(
  value: unknown,
): PaymentMethod {
  const method =
    safeString(
      value,
    )
      .toLowerCase()
      .replace(
        /[_\s-]+/g,
        "",
      );

  switch (
    method
  ) {
    case "cash":
    case "cod":
    case "cashondelivery":
    case "payondelivery":
      return "cash";

    case "card":
    case "debitcard":
    case "creditcard":
      return "card";

    case "transfer":
    case "banktransfer":
      return "transfer";

    default:
      return "unknown";
  }
}

function normalizePaymentStatus(
  value: unknown,
): PaymentStatus {
  const status =
    safeString(
      value,
    )
      .toLowerCase()
      .replace(
        /[_\s-]+/g,
        "",
      );

  switch (
    status
  ) {
    case "paid":
    case "success":
    case "successful":
    case "completed":
      return "paid";

    case "failed":
    case "declined":
      return "failed";

    case "refunded":
    case "refund":
      return "refunded";

    case "pending":
    case "unpaid":
    default:
      return "pending";
  }
}

function getPaymentMethodConfig(
  method: PaymentMethod,
) {
  switch (
    method
  ) {
    case "cash":
      return {
        title:
          "Pay on delivery",

        description:
          "Customer pays when the order arrives.",

        icon:
          "card" as const,
      };

    case "card":
      return {
        title:
          "Card payment",

        description:
          "Payment made using a bank card.",

        icon:
          "card" as const,
      };

    case "transfer":
      return {
        title:
          "Bank transfer",

        description:
          "Payment made by bank transfer.",

        icon:
          "card" as const,
      };

    case "unknown":
    default:
      return {
        title:
          "Payment method",

        description:
          "Payment information unavailable.",

        icon:
          "card" as const,
      };
  }
}

function getPaymentStatusConfig(
  status: PaymentStatus,
) {
  switch (
    status
  ) {
    case "paid":
      return {
        label:
          "Paid",

        color:
          Colors.success,

        backgroundColor:
          Colors.successSoft,
      };

    case "failed":
      return {
        label:
          "Failed",

        color:
          Colors.error,

        backgroundColor:
          Colors.errorSoft,
      };

    case "refunded":
      return {
        label:
          "Refunded",

        color:
          Colors.info,

        backgroundColor:
          Colors.infoSoft,
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
      };
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketPayment({
  paymentMethod,
  paymentStatus,
}: Props) {
  const normalizedMethod =
    useMemo(
      () =>
        normalizePaymentMethod(
          paymentMethod,
        ),
      [
        paymentMethod,
      ],
    );

  const normalizedStatus =
    useMemo(
      () =>
        normalizePaymentStatus(
          paymentStatus,
        ),
      [
        paymentStatus,
      ],
    );

  const methodConfig =
    useMemo(
      () =>
        getPaymentMethodConfig(
          normalizedMethod,
        ),
      [
        normalizedMethod,
      ],
    );

  const statusConfig =
    useMemo(
      () =>
        getPaymentStatusConfig(
          normalizedStatus,
        ),
      [
        normalizedStatus,
      ],
    );

  return (
    <View
      accessible
      accessibilityLabel={`${methodConfig.title}. ${statusConfig.label}. ${methodConfig.description}`}
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="bodyLarge"
        weight="bold"
        style={
          styles.title
        }
      >
        Payment
      </AppText>

      {/* ======================================================
          PAYMENT
      ====================================================== */}

      <View
        style={
          styles.paymentRow
        }
      >
        <View
          style={
            styles.iconBox
          }
        >
          <AppIcon
            name={
              methodConfig.icon
            }
            size="sm"
            color={
              Colors.info
            }
          />
        </View>

        <View
          style={
            styles.paymentContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.paymentTitle
            }
          >
            {methodConfig.title}
          </AppText>

          <AppText
            variant="caption"
            numberOfLines={2}
            style={
              styles.paymentDescription
            }
          >
            {methodConfig.description}
          </AppText>
        </View>

        <View
          style={[
            styles.statusBadge,

            {
              backgroundColor:
                statusConfig.backgroundColor,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,

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
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       PAYMENT ROW
    ======================================================== */

    paymentRow: {
      minHeight:
        44,

      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconBox: {
      width:
        36,

      height:
        36,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.infoSoft,
    },

    paymentContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.xs,
    },

    paymentTitle: {
      color:
        Colors.textPrimary,
    },

    paymentDescription: {
      marginTop:
        2,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      minHeight:
        24,

      flexShrink:
        0,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical:
        2,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusDot: {
      width:
        5,

      height:
        5,

      borderRadius:
        FixxamTokens.radius.full,
    },
  });