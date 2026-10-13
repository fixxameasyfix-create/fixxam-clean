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

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  amount: number;

  message?:
    | string
    | null;
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
    value <= 0
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

  const formattedAmount =
    useMemo(
      () =>
        `₦${safeAmount.toLocaleString(
          "en-NG",
        )}`,
      [safeAmount],
    );

  const safeMessage =
    useMemo(() => {
      const value =
        cleanText(
          message,
        );

      if (value) {
        return value;
      }

      return `I can pay ${formattedAmount}.`;
    }, [
      formattedAmount,
      message,
    ]);

  return (
    <View
      accessible
      accessibilityLabel={`Customer counter offer ${formattedAmount}. ${safeMessage}`}
      style={
        styles.container
      }
    >
      {/* ======================================================
          TOP ROW
      ====================================================== */}

      <View
        style={
          styles.topRow
        }
      >
        <View
          style={
            styles.icon
          }
        >
          <AppIcon
            name="swap"
            role="worker"
            size="xs"
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
            variant="caption"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.label
            }
          >
            CUSTOMER OFFER
          </AppText>

          <AppText
            variant="heading3"
            weight="bold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={
              0.8
            }
            style={
              styles.amount
            }
          >
            {formattedAmount}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          MESSAGE
      ====================================================== */}

      <View
        style={
          styles.messageRow
        }
      >
        <AppIcon
          name="messages"
          size="xs"
          color={
            Colors.textMuted
          }
        />

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.message
          }
        >
          “{safeMessage}”
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerCounterOfferCard.displayName =
  "WorkerCounterOfferCard";

export default memo(
  WorkerCounterOfferCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

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
       TOP ROW
    ======================================================== */

    topRow: {
      width:
        "100%",

      minHeight:
        40,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    icon: {
      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    label: {
      fontSize:
        10,

      letterSpacing:
        0.35,

      color:
        WorkerColors.primary,
    },

    amount: {
      marginTop:
        1,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    messageRow: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      paddingTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    message: {
      flex:
        1,

      minWidth:
        0,

      lineHeight:
        17,

      color:
        Colors.textSecondary,
    },
  });