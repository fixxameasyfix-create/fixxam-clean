import React from "react";

import {
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import type {
  BookingOffer,
} from "@/firebase/queries/bookings/listenOffers";

type Props = {
  offers?: BookingOffer[];
};

export default function WorkerOrderOfferHistory({
  offers = [],
}: Props) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Offer History
      </AppText>

      <FlatList
        data={offers}
        keyExtractor={(
          item,
          index,
        ) =>
          item.id ??
          `${item.sender}-${item.amount}-${index}`
        }
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isWorker =
            item.sender === "worker";

          const amount = Number(
            item.amount ?? 0,
          );

          const message =
            typeof item.message ===
            "string"
              ? item.message.trim()
              : "";

          return (
            <View
              style={[
                styles.bubble,
                isWorker
                  ? styles.workerBubble
                  : styles.customerBubble,
              ]}
            >
              <View
                style={
                  styles.header
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.sender
                  }
                >
                  {isWorker
                    ? "You"
                    : "Customer"}
                </AppText>

                <View
                  style={[
                    styles.senderBadge,
                    isWorker
                      ? styles.workerBadge
                      : styles.customerBadge,
                  ]}
                >
                  <AppText
                    weight="bold"
                    style={[
                      styles.senderBadgeText,
                      isWorker
                        ? styles.workerBadgeText
                        : styles.customerBadgeText,
                    ]}
                  >
                    {isWorker
                      ? "WORKER"
                      : "CUSTOMER"}
                  </AppText>
                </View>
              </View>

              <AppText
                weight="bold"
                style={styles.amount}
              >
                ₦
                {Number.isFinite(
                  amount,
                )
                  ? amount.toLocaleString()
                  : "0"}
              </AppText>

              {message ? (
                <AppText
                  style={
                    styles.message
                  }
                >
                  {message}
                </AppText>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
    marginBottom: 16,
  },

  bubble: {
    width: "88%",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  workerBubble: {
    backgroundColor: "#FFF7ED",
    alignSelf: "flex-end",
  },

  customerBubble: {
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  sender: {
    color: "#0F172A",
    fontSize: 13,
  },

  senderBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  workerBadge: {
    backgroundColor: "#FFEDD5",
  },

  customerBadge: {
    backgroundColor: "#DBEAFE",
  },

  senderBadgeText: {
    fontSize: 9,
  },

  workerBadgeText: {
    color: "#C2410C",
  },

  customerBadgeText: {
    color: "#1D4ED8",
  },

  amount: {
    color: "#FF6B00",
    fontSize: 18,
    marginBottom: 6,
  },

  message: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
  },
});