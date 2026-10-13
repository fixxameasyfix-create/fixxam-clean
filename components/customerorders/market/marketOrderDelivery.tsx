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
   HELPERS
============================================================ */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

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
        cleanText(
          receiverName,
        ),
      [
        receiverName,
      ],
    );

  const deliveryPhone =
    useMemo(
      () =>
        cleanText(
          receiverPhone,
        ),
      [
        receiverPhone,
      ],
    );

  const deliveryAddress =
    useMemo(
      () =>
        cleanText(
          address,
        ) ||
        "Delivery address unavailable",
      [
        address,
      ],
    );

  const accessibilityLabel =
    useMemo(
      () =>
        [
          "Delivery address.",
          deliveryName,
          deliveryAddress,
          deliveryPhone
            ? `Phone ${deliveryPhone}.`
            : "",
        ]
          .filter(
            Boolean,
          )
          .join(" "),
      [
        deliveryAddress,
        deliveryName,
        deliveryPhone,
      ],
    );

  return (
    <View
      accessible
      accessibilityLabel={
        accessibilityLabel
      }
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.title
        }
      >
        Delivery
      </AppText>

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <View
        style={
          styles.locationRow
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
            size="sm"
            state="active"
          />
        </View>

        <View
          style={
            styles.content
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.address
            }
          >
            {deliveryAddress}
          </AppText>

          {deliveryName ? (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.receiverName
              }
            >
              {deliveryName}
            </AppText>
          ) : null}
        </View>
      </View>

      {/* ======================================================
          PHONE
      ====================================================== */}

      {deliveryPhone ? (
        <>
          <View
            style={
              styles.divider
            }
          />

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
        </>
      ) : null}
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
       HEADER
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    iconBox: {
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

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    address: {
      lineHeight:
        20,

      color:
        Colors.textPrimary,
    },

    receiverName: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       PHONE
    ======================================================== */

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginTop:
        FixxamTokens.spacing.sm,

      marginLeft:
        40 +
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },

    phoneRow: {
      minHeight:
        36,

      marginLeft:
        40 +
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    phone: {
      flex:
        1,

      minWidth:
        0,
    },
  });