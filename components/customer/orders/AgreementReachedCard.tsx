import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  agreedPrice: number;
};

export default function AgreementReachedCard({
  agreedPrice,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons
            name="checkmark"
            size={20}
            color="#16A34A"
          />
        </View>

        <View style={styles.content}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Price agreed
          </AppText>

          <AppText style={styles.subtitle}>
            Your booking is confirmed.
          </AppText>
        </View>

        <View style={styles.priceBox}>
          <AppText
            weight="bold"
            style={styles.price}
          >
            ₦{agreedPrice.toLocaleString()}
          </AppText>
        </View>
      </View>

      <View style={styles.messageRow}>
        <Ionicons
          name="checkmark-circle-outline"
          size={16}
          color="#16A34A"
        />

        <AppText style={styles.message}>
          You and the worker agreed on this price.
          The worker can now start the job.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 4,

    padding: 14,

    borderRadius: 18,

    backgroundColor: "#F0FDF4",

    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#DCFCE7",

    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontSize: 15,
    color: "#166534",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: "#15803D",
  },

  priceBox: {
    marginLeft: 8,

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 10,

    backgroundColor: "#FFFFFF",
  },

  price: {
    fontSize: 15,
    color: "#0F172A",
  },

  messageRow: {
    marginTop: 10,

    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor: "#DCFCE7",

    flexDirection: "row",
    alignItems: "flex-start",
  },

  message: {
    flex: 1,
    marginLeft: 6,

    fontSize: 11.5,
    lineHeight: 17,

    color: "#166534",
  },
});