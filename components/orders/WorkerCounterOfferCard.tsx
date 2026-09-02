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

function WorkerCounterOfferCard({
  amount,
  message,
}: Props) {
  return (
    <View style={styles.card}>
      <WorkerOfferHeader
        title="COUNTER OFFER RECEIVED"
        subtitle="Customer has responded to your offer."
        icon="swap-horizontal-outline"
      />

      <WorkerOfferAmount
        label="CUSTOMER COUNTER OFFER"
        amount={amount}
      />

      <WorkerOfferMessage
        message={
          message ||
          `I can pay ₦${amount.toLocaleString(
            "en-NG",
          )}.`
        }
      />

      <View style={styles.info}>
        <Ionicons
          name="information-circle-outline"
          size={17}
          color="#64748B"
        />

        <AppText style={styles.infoText}>
          You can accept the customer's price,
          send another counter offer, or decline.
        </AppText>
      </View>
    </View>
  );
}

export default memo(WorkerCounterOfferCard);

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  info: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 9.5,
    lineHeight: 15,
    color: "#64748B",
  },
});