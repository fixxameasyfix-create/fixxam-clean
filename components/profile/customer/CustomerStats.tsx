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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orders: number;

  saved: number;

  reviews: number;
};

type StatItem = {
  label: string;

  value: number;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeCount(
  value: number,
): number {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return Math.floor(value);
}

/* ============================================================
   STAT
============================================================ */

const Stat = memo(
  function Stat({
    item,
  }: {
    item: StatItem;
  }) {
    return (
      <View
        style={styles.item}
        accessible
        accessibilityLabel={`${item.value} ${item.label}`}
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={styles.value}
        >
          {item.value.toLocaleString()}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={styles.label}
        >
          {item.label}
        </AppText>
      </View>
    );
  },
);

/* ============================================================
   COMPONENT
============================================================ */

function CustomerStats({
  orders,
  saved,
  reviews,
}: Props) {
  const stats =
    useMemo<StatItem[]>(
      () => [
        {
          label: "Orders",

          value:
            normalizeCount(
              orders,
            ),
        },

        {
          label: "Saved",

          value:
            normalizeCount(
              saved,
            ),
        },

        {
          label: "Reviews",

          value:
            normalizeCount(
              reviews,
            ),
        },
      ],
      [
        orders,
        saved,
        reviews,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {stats.map(
        (
          item,
          index,
        ) => (
          <React.Fragment
            key={
              item.label
            }
          >
            {index > 0 ? (
              <View
                style={
                  styles.divider
                }
              />
            ) : null}

            <Stat
              item={
                item
              }
            />
          </React.Fragment>
        ),
      )}
    </View>
  );
}

export default memo(
  CustomerStats,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      minHeight:
        88,

      paddingVertical:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       STAT
    ======================================================== */

    item: {
      flex:
        1,

      minWidth:
        0,

      paddingHorizontal:
        FixxamTokens.spacing.xxs,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    value: {
      textAlign:
        "center",

      color:
        CustomerColors.primary,
    },

    label: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      width:
        1,

      height:
        38,

      backgroundColor:
        Colors.divider,
    },
  });