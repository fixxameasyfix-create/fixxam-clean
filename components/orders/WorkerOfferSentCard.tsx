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
  WorkerColors,
} from "@/theme";

import WorkerOfferAmount from "./WorkerOfferAmount";
import WorkerOfferHeader from "./WorkerOfferHeader";
import WorkerOfferMessage from "./WorkerOfferMessage";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  amount: number;

  message?:
    | string
    | null;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferSentCard({
  amount,
  message,
}: Props) {
  const safeMessage =
    typeof message === "string"
      ? message.trim()
      : "";

  return (
    <View
      accessible
      accessibilityLabel="Offer sent. Waiting for the customer to respond."
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <WorkerOfferHeader
        title="Offer sent"
        subtitle="Waiting for customer response"
        icon="check"
      />

      {/* ======================================================
          AMOUNT
      ====================================================== */}

      <View
        style={
          styles.amountSection
        }
      >
        <WorkerOfferAmount
          label="Your offer"
          amount={
            amount
          }
        />
      </View>

      {/* ======================================================
          MESSAGE
      ====================================================== */}

      {safeMessage ? (
        <View
          style={
            styles.messageSection
          }
        >
          <WorkerOfferMessage
            message={
              safeMessage
            }
          />
        </View>
      ) : null}

      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        style={
          styles.statusRow
        }
      >
        <View
          style={
            styles.statusIcon
          }
        >
          <AppIcon
            name="clock"
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.statusText
          }
        >
          Waiting for the customer to respond.
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOfferSentCard.displayName =
  "WorkerOfferSentCard";

export default memo(
  WorkerOfferSentCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      padding:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       AMOUNT
    ======================================================== */

    amountSection: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    messageSection: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusRow: {
      width:
        "100%",

      minHeight:
        30,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    statusIcon: {
      width:
        26,

      height:
        26,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    statusText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.xs,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },
  });