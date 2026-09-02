import React, { memo } from "react";
import { StyleSheet, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import WorkerOfferHeader from "./WorkerOfferHeader";
import WorkerOfferAmount from "./WorkerOfferAmount";
import WorkerOfferMessage from "./WorkerOfferMessage";

type Props = {
  amount: number;
  message?: string | null;
};

function WorkerOfferSentCard({
  amount,
  message,
}: Props) {
  return (
    <View style={styles.card}>
      <WorkerOfferHeader
        title="Offer Sent"
        subtitle="Your offer is waiting for the customer."
        icon="paper-plane-outline"
      />

      <WorkerOfferAmount
        label="YOUR OFFER"
        amount={amount}
      />

      <WorkerOfferMessage
        message={message}
      />

      <View style={styles.waiting}>
        <View style={styles.waitingIcon}>
          <Ionicons
            name="time-outline"
            size={19}
            color="#2563EB"
          />
        </View>

        <View style={styles.waitingContent}>
          <AppText
            weight="bold"
            style={styles.waitingTitle}
          >
            WAITING FOR CUSTOMER
          </AppText>

          <AppText style={styles.waitingText}>
            The customer can accept or respond
            with a counter offer.
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(WorkerOfferSentCard);

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },

  waiting: {
    marginTop: 12,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },

  waitingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  waitingContent: {
    flex: 1,
    marginLeft: 9,
  },

  waitingTitle: {
    fontSize: 9.5,
    color: "#2563EB",
  },

  waitingText: {
    marginTop: 3,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#64748B",
  },
});