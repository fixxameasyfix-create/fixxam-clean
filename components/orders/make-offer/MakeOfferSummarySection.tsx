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

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  serviceName: string;

  customerName: string;

  formattedAmount: string;
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

function MakeOfferSummarySection({
  serviceName,
  customerName,
  formattedAmount,
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

  const safeAmount =
    useMemo(
      () =>
        cleanText(
          formattedAmount,
          "₦0",
        ),
      [formattedAmount],
    );

  return (
    <View
      accessible
      accessibilityLabel={`Offer preview. ${safeAmount} for ${safeServiceName}, customer ${safeCustomerName}.`}
      style={
        styles.container
      }
    >
      {/* ========================================================
          TOP
      ======================================================== */}

      <View
        style={
          styles.topRow
        }
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <AppIcon
            name="check"
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
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
            style={
              styles.label
            }
          >
            OFFER PREVIEW
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
                styles.service
              }
            >
              {safeServiceName}
            </AppText>

            <View
              style={
                styles.dot
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.customer
              }
            >
              {safeCustomerName}
            </AppText>
          </View>
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={
            styles.amount
          }
        >
          {safeAmount}
        </AppText>
      </View>

      {/* ========================================================
          NOTE
      ======================================================== */}

      <View
        style={
          styles.noteRow
        }
      >
        <AppIcon
          name="info"
          size="xs"
          color={
            Colors.textMuted
          }
        />

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.note
          }
        >
          Customer can accept, decline, or counter your offer.
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

MakeOfferSummarySection.displayName =
  "MakeOfferSummarySection";

export default memo(
  MakeOfferSummarySection,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ==========================================================
       TOP
    ========================================================== */

    topRow: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconContainer: {
      width:
        32,

      height:
        32,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.xs,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    label: {
      fontSize:
        10,

      letterSpacing:
        0.35,

      color:
        WorkerColors.primary,
    },

    amount: {
      flexShrink:
        1,

      maxWidth:
        "42%",

      textAlign:
        "right",

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

    service: {
      maxWidth:
        "52%",

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

    customer: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       NOTE
    ========================================================== */

    noteRow: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      paddingTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    note: {
      flex:
        1,

      minWidth:
        0,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },
  });