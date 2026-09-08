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

import WorkerOfferHeader from "./WorkerOfferHeader";
import WorkerOfferAmount from "./WorkerOfferAmount";
import WorkerOfferMessage from "./WorkerOfferMessage";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  amount: number;

  message?: string | null;
};

/* ==============================================================
   HELPERS
============================================================== */

function normalizeAmount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return Math.round(value);
}

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerCounterOfferCard({
  amount,
  message,
}: Props) {
  const safeAmount =
    useMemo(
      () =>
        normalizeAmount(
          amount,
        ),
      [amount],
    );

  const safeMessage =
    useMemo(() => {
      const value =
        cleanText(message);

      if (value) {
        return value;
      }

      return `I can pay ₦${safeAmount.toLocaleString(
        "en-NG",
      )}.`;
    }, [
      message,
      safeAmount,
    ]);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Customer counter offer received. ₦${safeAmount.toLocaleString(
        "en-NG",
      )}.`}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <WorkerOfferHeader
        title="COUNTER OFFER RECEIVED"
        subtitle="Customer has responded to your offer."
        icon="swap-horizontal-outline"
      />

      {/* ======================================================
          AMOUNT
      ====================================================== */}

      <WorkerOfferAmount
        label="CUSTOMER COUNTER OFFER"
        amount={safeAmount}
      />

      {/* ======================================================
          MESSAGE
      ====================================================== */}

      <WorkerOfferMessage
        message={safeMessage}
      />

      {/* ======================================================
          INFO
      ====================================================== */}

      <View
        style={styles.info}
      >
        <View
          style={
            styles.infoIcon
          }
        >
          <AppIcon
            name="info"
            size="xs"
            color={
              Colors.textSecondary
            }
          />
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.infoText}
        >
          You can accept the customer's price, send another counter offer, or decline.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  WorkerCounterOfferCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,

      ...FixxamTokens.shadow.card,
    },

    info: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    infoIcon: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 16,
    },
  });