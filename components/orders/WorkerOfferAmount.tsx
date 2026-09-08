import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
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

type Props = {
  label: string;

  amount: number;
};

/* ============================================================
   HELPERS
============================================================ */

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

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferAmount({
  label,
  amount,
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
        safeAmount.toLocaleString(
          "en-NG",
        ),
      [safeAmount],
    );

  return (
    <View
      accessible
      accessibilityLabel={`${label}. ₦${formattedAmount}`}
      style={styles.container}
    >
      <AppText
        variant="caption"
        weight="bold"
        numberOfLines={1}
        style={styles.label}
      >
        {label}
      </AppText>

      <AppText
        variant="heading2"
        weight="bold"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.amount}
      >
        ₦{formattedAmount}
      </AppText>
    </View>
  );
}

export default memo(
  WorkerOfferAmount,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    label: {
      letterSpacing: 0.8,

      color:
        Colors.textSecondary,
    },

    amount: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        WorkerColors.primary,
    },
  });