import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
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
      [
        safeRate,
      ],
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
          Hourly Rate
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
          BOOK
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Book this worker"
        onPress={
          onBook
        }
        style={({
          pressed,
        }) => [
          styles.button,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          style={
            styles.buttonText
          }
        >
          Book Now
        </AppText>

        <AppIcon
          name="next"
          role="customer"
          size="sm"
          color={
            Colors.textInverse
          }
        />
      </Pressable>
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
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    priceContent: {
      flex: 1,

      minWidth: 0,
    },

    price: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       BUTTON
    ======================================================== */

    button: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexShrink: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,

      ...FixxamTokens.shadow.card,
    },

    buttonText: {
      color:
        Colors.textInverse,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });

export default memo(
  WorkerFooter,
);