import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  selectedServices: number;

  hourlyRate: number;

  onBook: () => void;

  loading?: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function normalizeCount(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

function normalizeRate(
  value: number,
): number | null {
  if (
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

function WorkerBookingBar({
  selectedServices,
  hourlyRate,
  onBook,
  loading = false,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const safeSelectedCount =
    normalizeCount(
      selectedServices,
    );

  const safeHourlyRate =
    normalizeRate(
      hourlyRate,
    );

  const rateLabel =
    useMemo(
      () =>
        safeHourlyRate !== null
          ? `₦${formatAmount(
              safeHourlyRate,
            )}/hr`
          : "Negotiable",
      [
        safeHourlyRate,
      ],
    );

  return (
    <View
      style={[
        styles.container,

        {
          paddingBottom:
            Math.max(
              insets.bottom,
              FixxamTokens
                .spacing.md,
            ),
        },
      ]}
    >
      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <View
        style={
          styles.summary
        }
      >
        <View
          style={
            styles.summaryItem
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Selected Services
          </AppText>

          <View
            style={
              styles.countChip
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.countText
              }
            >
              {safeSelectedCount}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.summaryItem,
            styles.rateItem,
          ]}
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Hourly Rate
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.rate
            }
          >
            {rateLabel}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          BOOK
      ====================================================== */}

      <AppButton
        title="Book This Worker"
        role="customer"
        onPress={
          onBook
        }
        loading={
          loading
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
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      borderTopWidth: 1,

      borderColor:
        Colors.border,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summary: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    summaryItem: {
      flex: 1,

      minWidth: 0,
    },

    rateItem: {
      alignItems:
        "flex-end",

      marginLeft:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       COUNT
    ======================================================== */

    countChip: {
      minWidth: 32,

      minHeight: 28,

      alignSelf:
        "flex-start",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        FixxamTokens.spacing.xxs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    countText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       RATE
    ======================================================== */

    rate: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       BUTTON
    ======================================================== */

    button: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .buttonHeight,
    },
  });

export default memo(
  WorkerBookingBar,
);