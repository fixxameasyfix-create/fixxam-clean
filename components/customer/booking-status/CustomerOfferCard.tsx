import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  amount: number;
  message: string;
  sender: "worker" | "customer";
};

export default function CustomerOfferCard({
  amount,
  message,
  sender,
}: Props) {
  const isWorker = sender === "worker";

  return (
    <View
      style={[
        styles.container,
        isWorker
          ? styles.workerContainer
          : styles.customerContainer,
      ]}
    >
      <View style={styles.header}>
        <AppText
          weight="bold"
          style={styles.sender}
        >
          {isWorker ? "Worker" : "You"}
        </AppText>

        <AppText
          weight="bold"
          style={styles.amount}
        >
          ₦{amount.toLocaleString()}
        </AppText>
      </View>

      {!!message.trim() && (
        <AppText
          numberOfLines={2}
          style={styles.message}
        >
          {message.trim()}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "78%",

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 14,

    marginBottom: 6,
  },

  workerContainer: {
    alignSelf: "flex-start",

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  customerContainer: {
    alignSelf: "flex-end",

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 14,
  },

  sender: {
    fontSize: 12,

    color: "#64748B",
  },

  amount: {
    fontSize: 15,

    color: "#F97316",
  },

  message: {
    marginTop: 3,

    fontSize: 12,

    lineHeight: 17,

    color: "#64748B",
  },
});