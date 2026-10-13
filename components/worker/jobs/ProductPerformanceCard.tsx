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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  productsSold: number;
  totalViews: number;
  featuredProducts: number;
};

type PerformanceItem = {
  key:
    | "total"
    | "active"
    | "outOfStock"
    | "sold"
    | "views"
    | "featured";

  label: string;

  value: string;

  icon:
    | "shop"
    | "check"
    | "star";
};

/* ============================================================
   HELPERS
============================================================ */

function safeCount(
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

function formatCount(
  value: number,
): string {
  return safeCount(
    value,
  ).toLocaleString();
}

/* ============================================================
   COMPONENT
============================================================ */

function ProductPerformanceCard({
  totalProducts,
  activeProducts,
  outOfStockProducts,
  productsSold,
  totalViews,
  featuredProducts,
}: Props) {
  const items =
    useMemo<PerformanceItem[]>(
      () => [
        {
          key: "total",

          label:
            "Total Products",

          value:
            formatCount(
              totalProducts,
            ),

          icon: "shop",
        },

        {
          key: "active",

          label:
            "Active Products",

          value:
            formatCount(
              activeProducts,
            ),

          icon: "check",
        },

        {
          key: "outOfStock",

          label:
            "Out of Stock",

          value:
            formatCount(
              outOfStockProducts,
            ),

          icon: "shop",
        },

        {
          key: "sold",

          label:
            "Products Sold",

          value:
            formatCount(
              productsSold,
            ),

          icon: "check",
        },

        {
          key: "views",

          label:
            "Total Views",

          value:
            formatCount(
              totalViews,
            ),

          icon: "shop",
        },

        {
          key: "featured",

          label:
            "Featured Products",

          value:
            formatCount(
              featuredProducts,
            ),

          icon: "star",
        },
      ],
      [
        activeProducts,
        featuredProducts,
        outOfStockProducts,
        productsSold,
        totalProducts,
        totalViews,
      ],
    );

  return (
    <View>
      {/* =====================================================
          SECTION TITLE
      ===================================================== */}

      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.sectionTitle
        }
      >
        Product Performance
      </AppText>

      {/* =====================================================
          CARD
      ===================================================== */}

      <View
        style={
          styles.card
        }
      >
        {items.map(
          (
            item,
            index,
          ) => {
            const isLast =
              index ===
              items.length - 1;

            return (
              <View
                key={
                  item.key
                }
                style={[
                  styles.row,

                  !isLast
                    ? styles.rowBorder
                    : null,
                ]}
              >
                <View
                  style={
                    styles.rowLeft
                  }
                >
                  <View
                    style={
                      styles.iconBox
                    }
                  >
                    <AppIcon
                      name={
                        item.icon
                      }
                      role="worker"
                      size="xs"
                      color={
                        WorkerColors.primary
                      }
                    />
                  </View>

                  <AppText
                    variant="body"
                    numberOfLines={1}
                    style={
                      styles.rowLabel
                    }
                  >
                    {item.label}
                  </AppText>
                </View>

                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={
                    styles.rowValue
                  }
                >
                  {item.value}
                </AppText>
              </View>
            );
          },
        )}
      </View>
    </View>
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  ProductPerformanceCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    rowBorder: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    rowLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconBox: {
      width: 32,

      height: 32,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowLabel: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    rowValue: {
      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },
  });