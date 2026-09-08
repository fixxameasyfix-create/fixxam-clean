import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  hourlyRate?: number;

  onBook: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function normalizeRate(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function formatAmount(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-NG",
    {
      maximumFractionDigits: 0,
    },
  ).format(value);
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerFooter({
  hourlyRate,
  onBook,
}: Props) {
  const safeRate =
    normalizeRate(
      hourlyRate,
    );

  const priceLabel =
    useMemo(
      () =>
        safeRate !== null
          ? `₦${formatAmount(
              safeRate,
            )}/hr`
          : "Negotiable",
      [safeRate],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          PRICE
      ====================================================== */}

      <View
        style={
          styles.priceContent
        }
      >
        <AppText
          variant="caption"
          tone="secondary"
        >
          Starting From
        </AppText>

        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={
            styles.price
          }
        >
          {priceLabel}
        </AppText>
      </View>

      {/* ======================================================
          REQUEST
      ====================================================== */}

      <AppButton
        title="Request Now"
        role="customer"
        onPress={
          onBook
        }
        style={
          styles.button
        }
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    priceContent: {
      flex: 1,

      minWidth: 0,
    },

    price: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    button: {
      minWidth: 130,

      flexShrink: 0,
    },
  });

export default memo(
  WorkerFooter,
);