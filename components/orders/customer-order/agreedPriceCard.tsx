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
  return (
    <View
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel={`Agreed service amount ${formatAmount(
        amount,
      )}`}
    >
      {/* ======================================================
          STATUS ICON
      ====================================================== */}

      <View
        style={styles.icon}
      >
        <AppIcon
          name="success"
          size="md"
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
        <AppText
          variant="caption"
          weight="bold"
          style={styles.label}
        >
          AGREED SERVICE AMOUNT
        </AppText>

        <AppText
          variant="heading3"
          weight="bold"
          style={styles.amount}
        >
          {formatAmount(
            amount,
          )}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.text}
        >
          This is the final amount agreed between you and the worker.
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const AgreedPriceCard =
  memo(
    AgreedPriceCardComponent,
  );

export default AgreedPriceCard;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,

      ...FixxamTokens.shadow.card,
    },

    icon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    label: {
      letterSpacing: 0.5,

      color:
        Colors.success,
    },

    amount: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    text: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },
  });