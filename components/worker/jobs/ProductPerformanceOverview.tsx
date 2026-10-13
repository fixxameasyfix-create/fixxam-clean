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
  productsSold: number;
  totalViews: number;
};

type MetricItem = {
  key:
    | "products"
    | "active"
    | "sold"
    | "views";

  value: string;

  label: string;
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

function ProductPerformanceOverview({
  totalProducts,
  activeProducts,
  productsSold,
  totalViews,
}: Props) {
  const metrics =
    useMemo<MetricItem[]>(
      () => [
        {
          key: "products",

          value:
            formatCount(
              totalProducts,
            ),

          label:
            "Products",
        },

        {
          key: "active",

          value:
            formatCount(
              activeProducts,
            ),

          label:
            "Active",
        },

        {
          key: "sold",

          value:
            formatCount(
              productsSold,
            ),

          label:
            "Sold",
        },

        {
          key: "views",

          value:
            formatCount(
              totalViews,
            ),

          label:
            "Views",
        },
      ],
      [
        activeProducts,
        productsSold,
        totalProducts,
        totalViews,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerIcon
          }
        >
          <AppIcon
            name="shop"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.headerTitle
            }
          >
            Product Overview
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Your product performance
          </AppText>
        </View>
      </View>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <View
        style={
          styles.metrics
        }
      >
        {metrics.map(
          (
            item,
            index,
          ) => {
            const isLeft =
              index % 2 === 0;

            const isTop =
              index < 2;

            return (
              <View
                key={
                  item.key
                }
                style={[
                  styles.metric,

                  isLeft
                    ? styles.metricRightBorder
                    : null,

                  isTop
                    ? styles.metricBottomBorder
                    : null,
                ]}
              >
                <AppText
                  variant="heading3"
                  weight="semibold"
                  style={
                    styles.metricValue
                  }
                >
                  {item.value}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.metricLabel
                  }
                >
                  {item.label}
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
  ProductPerformanceOverview,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
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
       HEADER
    ======================================================== */

    header: {
      minHeight:
        68,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    headerIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       METRICS
    ======================================================== */

    metrics: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",
    },

    metric: {
      width:
        "50%",

      minHeight:
        92,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    metricRightBorder: {
      borderRightWidth:
        StyleSheet.hairlineWidth,

      borderRightColor:
        Colors.divider,
    },

    metricBottomBorder: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    metricValue: {
      color:
        WorkerColors.primary,
    },

    metricLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign:
        "center",
    },
  });