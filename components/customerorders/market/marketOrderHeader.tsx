import React, {
  memo,
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

import type {
  MarketProduct,
} from "./marketOrder.utils";

import {
  formatMarketDate,
  formatMarketOrderNumber,
  getMarketStatusConfig,
  type MarketStatus,
} from "./marketOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  status: MarketStatus;

  createdAt: unknown;

  products: MarketProduct[];

  storeName: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderHeaderComponent({
  orderId,
  status,
  createdAt,
  storeName,
}: Props) {
  const statusConfig =
    getMarketStatusConfig(
      status,
    );

  const orderNumber =
    formatMarketOrderNumber(
      orderId,
    );

  const orderedDate =
    formatMarketDate(
      createdAt,
    );

  const safeStoreName =
    typeof storeName === "string" &&
    storeName.trim()
      ? storeName.trim()
      : "Market Store";

  return (
    <View
      accessible
      accessibilityLabel={`Order ${orderNumber}. Store ${safeStoreName}. ${statusConfig.label}.`}
      style={
        styles.card
      }
    >
      {/* ======================================================
          STORE
      ====================================================== */}

      <View
        style={
          styles.storeRow
        }
      >
        <View
          style={
            styles.storeIcon
          }
        >
          <AppIcon
            name="cart"
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        <View
          style={
            styles.storeInfo
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={
              styles.storeName
            }
          >
            {safeStoreName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Seller
          </AppText>
        </View>
      </View>

      {/* ======================================================
          META
      ====================================================== */}

      <View
        style={
          styles.divider
        }
      />

      <View
        style={
          styles.metaRow
        }
      >
        <View
          style={
            styles.metaItem
          }
        >
          <AppText
            variant="caption"
            tone="muted"
          >
            Order
          </AppText>

          <AppText
            variant="caption"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.metaValue
            }
          >
            {orderNumber}
          </AppText>
        </View>

        {orderedDate ? (
          <View
            style={
              styles.dateItem
            }
          >
            <AppText
              variant="caption"
              tone="muted"
            >
              Ordered
            </AppText>

            <AppText
              variant="caption"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.metaValue
              }
            >
              {orderedDate}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MarketOrderHeader =
  memo(
    MarketOrderHeaderComponent,
  );

MarketOrderHeader.displayName =
  "MarketOrderHeader";

export default MarketOrderHeader;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       STORE
    ======================================================== */

    storeRow: {
      minHeight:
        48,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    storeIcon: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    storeInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    storeName: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       META
    ======================================================== */

    metaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    metaItem: {
      flex:
        1,

      minWidth:
        0,
    },

    dateItem: {
      flex:
        1,

      minWidth:
        0,

      alignItems:
        "flex-end",
    },

    metaValue: {
      marginTop:
        2,

      color:
        Colors.textPrimary,
    },
  });