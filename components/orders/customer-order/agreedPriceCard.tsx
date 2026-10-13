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
  FixxamTokens,
} from "@/theme";

import {
  formatAmount,
} from "./customerOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  amount: number;
};

/* ============================================================
   COMPONENT
============================================================ */

function AgreedPriceCardComponent({
  amount,
}: Props) {
  const formattedAmount =
    formatAmount(amount);

  return (
    <View
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel={`Agreed service amount ${formattedAmount}`}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={styles.icon}
      >
        <AppIcon
          name="success"
          size="xs"
          color={
            Colors.success
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >
        <View
          style={styles.priceRow}
        >
          <View
            style={
              styles.labelContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              style={styles.label}
            >
              Agreed price
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={styles.text}
            >
              Final service amount
            </AppText>
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            numberOfLines={1}
            style={styles.amount}
          >
            {formattedAmount}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width:
        "100%",

      minHeight:
        58,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    /* ========================================================
       ICON
    ======================================================== */

    icon: {
      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    priceRow: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    labelContent: {
      flex:
        1,

      minWidth:
        0,
    },

    label: {
      color:
        Colors.success,
    },

    text: {
      marginTop:
        1,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    amount: {
      flexShrink:
        0,

      color:
        Colors.textPrimary,
    },
  });

/* ============================================================
   MEMO / EXPORT
============================================================ */

const AgreedPriceCard =
  memo(
    AgreedPriceCardComponent,
  );

AgreedPriceCard.displayName =
  "AgreedPriceCard";

export default AgreedPriceCard;