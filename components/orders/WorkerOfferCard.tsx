import React, { memo } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";

import WorkerCounterOfferCard from "./WorkerCounterOfferCard";
import WorkerOfferActions from "./WorkerOfferActions";
import WorkerOfferSentCard from "./WorkerOfferSentCard";

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
  if (state === "counter") {
    if (
      typeof counterOfferAmount !== "number" ||
      counterOfferAmount <= 0
    ) {
      return null;
    }

    return (
      <View style={styles.container}>
        <WorkerCounterOfferCard
          amount={counterOfferAmount}
          message={counterOfferMessage}
        />

        <WorkerOfferActions
          amount={counterOfferAmount}
          onAccept={onAcceptCounter}
          onCounter={onCounter}
          onDecline={onDeclineCounter}
          loading={loading}
        />
      </View>
    );
  }

  if (state === "sent") {
    if (
      typeof offerAmount !== "number" ||
      offerAmount <= 0
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

  return (
    <View style={styles.emptyCard}>
      <AppText
        weight="bold"
        style={styles.emptyTitle}
      >
        Send Your Offer
      </AppText>

      <AppText style={styles.emptyText}>
        Review the customer's request and send
        your price.
      </AppText>

      <AppText
        weight="bold"
        style={styles.sendButton}
        onPress={onSendOffer}
      >
        SEND OFFER →
      </AppText>
    </View>
  );
}

export default memo(WorkerOfferCard);

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  emptyCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },

  emptyTitle: {
    fontSize: 14,
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 4,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#64748B",
  },

  sendButton: {
    marginTop: 14,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    fontSize: 10.5,
  },
});