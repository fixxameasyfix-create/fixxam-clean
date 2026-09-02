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

  offers: BookingOffer[];

};

export default function CustomerOfferHistory({

  offers,

}: Props) {

  return (

    <FlatList

      scrollEnabled={false}

      data={offers}

      keyExtractor={(item) => item.id}

      ItemSeparatorComponent={() => (
        <View style={styles.space} />
      )}

      renderItem={({ item }) => (

        <View
          style={styles.card}
        >

          <AppText
            weight="bold"
          >
            {item.sender === "worker"
              ? "Worker"
              : "You"}
          </AppText>

          <AppText
            style={styles.amount}
          >
            ₦{item.amount.toLocaleString()}
          </AppText>

          <AppText
            style={styles.message}
          >
            {item.message}
          </AppText>

        </View>

      )}

      ListEmptyComponent={

        <View style={styles.empty}>

          <AppText>
            No offers yet.
          </AppText>

        </View>

      }

    />

  );

}

const styles = StyleSheet.create({

  card: {

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

  },

  amount: {

    marginTop: 8,

    fontSize: 20,

    color: "#FF6B00",

    fontWeight: "700",

  },

  message: {

    marginTop: 8,

    color: "#64748B",

  },

  space: {

    height: 12,

  },

  empty: {

    paddingVertical: 24,

    alignItems: "center",

  },

});