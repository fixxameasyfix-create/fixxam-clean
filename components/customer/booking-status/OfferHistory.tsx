import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

import type {
  BookingOffer,
} from "@/firebase/queries/bookings/listenOffers";

type Props = {
  offers: BookingOffer[];
};

export default function OfferHistory({
  offers,
}: Props) {
  if (!offers.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Price Offers
      </AppText>

      <View style={styles.list}>
        {offers.map((offer) => {
          const isCustomer =
            offer.sender === "customer";

          return (
            <View
              key={offer.id}
              style={[
                styles.offer,
                isCustomer
                  ? styles.customer
                  : styles.worker,
              ]}
            >
              <View style={styles.offerHeader}>
                <AppText
                  weight="bold"
                  style={styles.sender}
                >
                  {isCustomer
                    ? "You"
                    : "Worker"}
                </AppText>

                <AppText
                  weight="bold"
                  style={styles.price}
                >
                  ₦
                  {offer.amount.toLocaleString()}
                </AppText>
              </View>

              {offer.message?.trim() ? (
                <AppText
                  numberOfLines={2}
                  style={styles.message}
                >
                  {offer.message}
                </AppText>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 4,
  },

  title: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },

  list: {
    gap: 6,
  },

  offer: {
    maxWidth: "82%",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 15,
  },

  customer: {
    alignSelf: "flex-end",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  worker: {
    alignSelf: "flex-start",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },

  sender: {
    fontSize: 12,
    color: "#475569",
  },

  price: {
    fontSize: 15,
    color: "#F97316",
  },

  message: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },
});