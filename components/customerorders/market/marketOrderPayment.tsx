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

  return (
    <View
      style={
        styles.card
      }
      accessibilityLabel={`Payment method ${methodLabel}. Payment status ${statusConfig.label}.`}
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
        Payment Information
      </AppText>

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <View
        style={
          styles.row
        }
      >
        {/* ====================================================
            PAYMENT METHOD
        ==================================================== */}

        <View
          style={
            styles.column
          }
        >
          <AppText
            variant="caption"
            style={
              styles.label
            }
          >
            Payment Method
          </AppText>

          <View
            style={
              styles.valueRow
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
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={2}
              style={
                styles.value
              }
            >
              {methodLabel}
            </AppText>
          </View>
        </View>

        {/* ====================================================
            DIVIDER
        ==================================================== */}

        <View
          style={
            styles.divider
          }
        />

        {/* ====================================================
            PAYMENT STATUS
        ==================================================== */}

        <View
          style={
            styles.column
          }
        >
          <AppText
            variant="caption"
            style={
              styles.label
            }
          >
            Payment Status
          </AppText>

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
              weight="bold"
              style={[
                styles.statusText,

                {
                  color:
                    statusConfig.color,
                },
              ]}
            >
              {statusConfig.label}
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
          "PAID",

        color:
          Colors.success,

        background:
          Colors.successSoft,
      };

    case "failed":
      return {
        label:
          "FAILED",

        color:
          Colors.error,

        background:
          Colors.errorSoft,
      };

    case "refunded":
      return {
        label:
          "REFUNDED",

        color:
          Colors.info,

        background:
          Colors.infoSoft,
      };

    case "pending":
    default:
      return {
        label:
          "PENDING",

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

    /* ========================================================
       TITLE
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    row: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    column: {
      flex: 1,

      minWidth: 0,
    },

    divider: {
      width: 1,

      height: 48,

      marginHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    label: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       PAYMENT METHOD
    ======================================================== */

    valueRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    methodIconBox: {
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
        CustomerColors.primarySoft,
    },

    value: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      alignSelf:
        "flex-start",

      minHeight: 28,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,
    },

    statusDot: {
      width: 6,

      height: 6,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusText: {
      letterSpacing:
        0.2,
    },
  });