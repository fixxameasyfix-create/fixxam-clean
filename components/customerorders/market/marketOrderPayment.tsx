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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  formatMarketPaymentMethod,
  getMarketPaymentIcon,
  normalizeMarketPaymentStatus,
  type MarketPaymentStatus,
} from "./marketOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  paymentMethod: string;

  paymentStatus: string;
};

type PaymentStatusConfig = {
  label: string;

  color: string;

  background: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderPayment({
  paymentMethod,
  paymentStatus,
}: Props) {
  const methodLabel =
    useMemo(
      () =>
        formatMarketPaymentMethod(
          paymentMethod,
        ),
      [
        paymentMethod,
      ],
    );

  const methodIcon =
    useMemo(
      () =>
        getMarketPaymentIcon(
          paymentMethod,
        ),
      [
        paymentMethod,
      ],
    );

  const normalizedStatus =
    useMemo(
      () =>
        normalizeMarketPaymentStatus(
          paymentStatus,
        ),
      [
        paymentStatus,
      ],
    );

  const statusConfig =
    getPaymentStatusConfig(
      normalizedStatus,
    );

  const accessibilityLabel =
    useMemo(
      () =>
        `Payment method ${methodLabel}. Payment status ${statusConfig.label}.`,
      [
        methodLabel,
        statusConfig.label,
      ],
    );

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
          TITLE
      ====================================================== */}

      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.title
        }
      >
        Payment
      </AppText>

      {/* ======================================================
          PAYMENT ROW
      ====================================================== */}

      <View
        style={
          styles.row
        }
      >
        <View
          style={
            styles.methodIconBox
          }
        >
          <AppIcon
            name={
              methodIcon
            }
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        <View
          style={
            styles.methodContent
          }
        >
          <AppText
            variant="caption"
            tone="muted"
          >
            Payment method
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={
              styles.methodValue
            }
          >
            {methodLabel}
          </AppText>
        </View>

        <View
          style={[
            styles.statusBadge,

            {
              backgroundColor:
                statusConfig.background,
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
            weight="semibold"
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

const MemoizedMarketOrderPayment =
  memo(
    MarketOrderPayment,
  );

MemoizedMarketOrderPayment.displayName =
  "MarketOrderPayment";

export default MemoizedMarketOrderPayment;

/* ============================================================
   STATUS CONFIG
============================================================ */

function getPaymentStatusConfig(
  status: MarketPaymentStatus,
): PaymentStatusConfig {
  switch (status) {
    case "paid":
      return {
        label:
          "Paid",

        color:
          Colors.success,

        background:
          Colors.successSoft,
      };

    case "failed":
      return {
        label:
          "Failed",

        color:
          Colors.error,

        background:
          Colors.errorSoft,
      };

    case "refunded":
      return {
        label:
          "Refunded",

        color:
          Colors.info,

        background:
          Colors.infoSoft,
      };

    case "pending":
      return {
        label:
          "Pending",

        color:
          Colors.warning,

        background:
          Colors.warningSoft,
      };
  }
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
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       PAYMENT ROW
    ======================================================== */

    row: {
      minHeight:
        56,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    methodIconBox: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    methodContent: {
      flex:
        1,

      minWidth:
        0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    methodValue: {
      marginTop:
        2,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      minHeight:
        28,

      flexShrink:
        0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

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
      width:
        6,

      height:
        6,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },
  });