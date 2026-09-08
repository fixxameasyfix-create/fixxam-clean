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

  message?: string | null;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferSentCard({
  amount,
  message,
}: Props) {
  return (
    <View
      accessible
      accessibilityLabel="Offer sent. Waiting for the customer to respond."
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <WorkerOfferHeader
        title="Offer Sent"
        subtitle="Your offer is waiting for the customer."
        icon="check"
      />

      {/* ======================================================
          AMOUNT
      ====================================================== */}

      <WorkerOfferAmount
        label="YOUR OFFER"
        amount={amount}
      />

      {/* ======================================================
          MESSAGE
      ====================================================== */}

      <WorkerOfferMessage
        message={message}
      />

      {/* ======================================================
          WAITING STATUS
      ====================================================== */}

      <View
        style={styles.waiting}
      >
        <View
          style={
            styles.waitingIcon
          }
        >
          <AppIcon
            name="clock"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.waitingContent
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.waitingTitle
            }
          >
            WAITING FOR CUSTOMER
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.waitingText
            }
          >
            The customer can accept or respond with a counter offer.
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(
  WorkerOfferSentCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
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
       WAITING
    ======================================================== */

    waiting: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    waitingIcon: {
      width: 40,

      height: 40,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    waitingContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    waitingTitle: {
      letterSpacing: 0.3,

      color:
        WorkerColors.primary,
    },

    waitingText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },
  });