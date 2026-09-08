import React, {
  memo,
} from "react";

import {
  Pressable,
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

import WorkerCounterOfferCard from "./WorkerCounterOfferCard";
import WorkerOfferActions from "./WorkerOfferActions";
import WorkerOfferSentCard from "./WorkerOfferSentCard";

/* ============================================================
   TYPES
============================================================ */

export type WorkerOfferState =
  | "none"
  | "sent"
  | "counter";

type Props = {
  state: WorkerOfferState;

  offerAmount?: number | null;

  offerMessage?: string | null;

  counterOfferAmount?: number | null;

  counterOfferMessage?: string | null;

  onSendOffer: () => void;

  onAcceptCounter: () => void;

  onCounter: () => void;

  onDeclineCounter: () => void;

  loading?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function isValidOfferAmount(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferCard({
  state,
  offerAmount,
  offerMessage,
  counterOfferAmount,
  counterOfferMessage,
  onSendOffer,
  onAcceptCounter,
  onCounter,
  onDeclineCounter,
  loading = false,
}: Props) {
  /* ==========================================================
     CUSTOMER COUNTER OFFER
  ========================================================== */

  if (state === "counter") {
    if (
      !isValidOfferAmount(
        counterOfferAmount,
      )
    ) {
      return null;
    }

    return (
      <View style={styles.container}>
        <WorkerCounterOfferCard
          amount={counterOfferAmount}
          message={
            counterOfferMessage
          }
        />

        <WorkerOfferActions
          amount={counterOfferAmount}
          onAccept={
            onAcceptCounter
          }
          onCounter={onCounter}
          onDecline={
            onDeclineCounter
          }
          loading={loading}
        />
      </View>
    );
  }

  /* ==========================================================
     WORKER OFFER SENT
  ========================================================== */

  if (state === "sent") {
    if (
      !isValidOfferAmount(
        offerAmount,
      )
    ) {
      return null;
    }

    return (
      <View style={styles.container}>
        <WorkerOfferSentCard
          amount={offerAmount}
          message={offerMessage}
        />
      </View>
    );
  }

  /* ==========================================================
     NO OFFER YET
  ========================================================== */

  return (
    <View
      style={styles.emptyCard}
      accessible
      accessibilityLabel="Send your offer. Review the customer's request and send your price."
    >
      <View
        style={styles.emptyHeader}
      >
        <View
          style={styles.emptyIcon}
        >
          <AppIcon
            name="payment"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.emptyContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            Send Your Offer
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.emptyText
            }
          >
            Review the customer's request and send your price.
          </AppText>
        </View>
      </View>

      <Pressable
        onPress={onSendOffer}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Send offer"
        accessibilityState={{
          disabled: loading,
        }}
        style={({ pressed }) => [
          styles.sendButton,

          loading
            ? styles.disabled
            : null,

          pressed &&
          !loading
            ? styles.pressed
            : null,
        ]}
      >
        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.sendButtonText
          }
        >
          SEND OFFER
        </AppText>

        <AppIcon
          name="next"
          role="worker"
          size="xs"
          color={
            Colors.textInverse
          }
        />
      </Pressable>
    </View>
  );
}

export default memo(
  WorkerOfferCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    /* ========================================================
       EMPTY CARD
    ======================================================== */

    emptyCard: {
      width: "100%",

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

    emptyHeader: {
      flexDirection: "row",

      alignItems:
        "flex-start",
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    emptyTitle: {
      color:
        Colors.textPrimary,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,
    },

    /* ========================================================
       SEND BUTTON
    ======================================================== */

    sendButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    sendButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });