import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type Props = {
  orderId: string;

  serviceName: string;

  customerName: string;

  icon?:
    | string
    | null;

  iconColor?:
    | string
    | null;

  backgroundColor?:
    | string
    | null;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
  fallback: string,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const cleaned =
    value.trim();

  return cleaned ||
    fallback;
}

/* ==============================================================
   COMPONENT
============================================================== */

function MakeOfferOrderCard({
  orderId,
  serviceName,
  customerName,
  icon,
  iconColor,
  backgroundColor,
}: Props) {
  const safeServiceName =
    useMemo(
      () =>
        cleanText(
          serviceName,
          "Service request",
        ),
      [serviceName],
    );

  const safeCustomerName =
    useMemo(
      () =>
        cleanText(
          customerName,
          "Customer",
        ),
      [customerName],
    );

  const safeOrderId =
    useMemo(
      () =>
        cleanText(
          orderId,
          "",
        ),
      [orderId],
    );

  const materialIcon =
    useMemo<MaterialIconName>(
      () =>
        icon &&
        icon in
          MaterialCommunityIcons.glyphMap
          ? (icon as MaterialIconName)
          : "tools",
      [icon],
    );

  return (
    <View
      accessible
      accessibilityLabel={`${safeServiceName}. Customer ${safeCustomerName}${
        safeOrderId
          ? `. Order ${safeOrderId}`
          : ""
      }`}
      style={
        styles.container
      }
    >
      {/* ========================================================
          SERVICE ICON
      ======================================================== */}

      <View
        style={[
          styles.iconContainer,

          {
            backgroundColor:
              backgroundColor ||
              WorkerColors.primarySoft,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            materialIcon
          }
          size={22}
          color={
            iconColor ||
            WorkerColors.primary
          }
        />
      </View>

      {/* ========================================================
          ORDER INFO
      ======================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.serviceName
          }
        >
          {safeServiceName}
        </AppText>

        <View
          style={
            styles.metaRow
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.customerName
            }
          >
            {safeCustomerName}
          </AppText>

          {safeOrderId ? (
            <>
              <View
                style={
                  styles.dot
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                ellipsizeMode="middle"
                style={
                  styles.orderId
                }
              >
                #{safeOrderId}
              </AppText>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

MakeOfferOrderCard.displayName =
  "MakeOfferOrderCard";

export default memo(
  MakeOfferOrderCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      minHeight:
        58,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.background,
    },

    /* ==========================================================
       ICON
    ========================================================== */

    iconContainer: {
      width:
        42,

      height:
        42,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    /* ==========================================================
       CONTENT
    ========================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    serviceName: {
      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       META
    ========================================================== */

    metaRow: {
      width:
        "100%",

      minWidth:
        0,

      marginTop:
        2,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    customerName: {
      maxWidth:
        "45%",

      flexShrink:
        1,

      color:
        Colors.textSecondary,
    },

    dot: {
      width:
        3,

      height:
        3,

      flexShrink:
        0,

      marginHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.textMuted,
    },

    orderId: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textMuted,
    },
  });