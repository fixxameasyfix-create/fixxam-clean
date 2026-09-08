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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  receiverName?: string;

  receiverPhone?: string;

  address: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderDelivery({
  receiverName,
  receiverPhone,
  address,
}: Props) {
  const deliveryName =
    useMemo(
      () =>
        typeof receiverName === "string" &&
        receiverName.trim()
          ? receiverName.trim()
          : "Delivery location",
      [
        receiverName,
      ],
    );

  const deliveryAddress =
    useMemo(
      () =>
        typeof address === "string" &&
        address.trim()
          ? address.trim()
          : "Delivery address unavailable",
      [
        address,
      ],
    );

  const deliveryPhone =
    useMemo(
      () =>
        typeof receiverPhone === "string"
          ? receiverPhone.trim()
          : "",
      [
        receiverPhone,
      ],
    );

  return (
    <View
      style={
        styles.card
      }
      accessibilityLabel={`${deliveryName}. ${deliveryAddress}${
        deliveryPhone
          ? `. Phone ${deliveryPhone}`
          : ""
      }`}
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="body"
        weight="bold"
        style={
          styles.title
        }
      >
        Delivery Address
      </AppText>

      {/* ======================================================
          DELIVERY INFO
      ====================================================== */}

      <View
        style={
          styles.row
        }
      >
        <View
          style={
            styles.iconBox
          }
        >
          <AppIcon
            name="location"
            role="customer"
            size="md"
            color={
              CustomerColors.primary
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
            weight="bold"
            numberOfLines={1}
            style={
              styles.name
            }
          >
            {deliveryName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.address
            }
          >
            {deliveryAddress}
          </AppText>

          {deliveryPhone ? (
            <View
              style={
                styles.phoneRow
              }
            >
              <AppIcon
                name="phone"
                size="xs"
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.phone
                }
              >
                {deliveryPhone}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderDelivery =
  memo(
    MarketOrderDelivery,
  );

MemoizedMarketOrderDelivery.displayName =
  "MarketOrderDelivery";

export default MemoizedMarketOrderDelivery;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    row: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    iconBox: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    name: {
      color:
        Colors.textPrimary,
    },

    address: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PHONE
    ======================================================== */

    phoneRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    phone: {
      flex: 1,

      color:
        Colors.textSecondary,
    },
  });