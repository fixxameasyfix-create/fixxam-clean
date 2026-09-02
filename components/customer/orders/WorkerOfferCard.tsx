import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  price: number;
  message?: string;
};

export default function WaitingEstimateCard({
  price,
  message,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons
            name="cash-outline"
            size={20}
            color="#2563EB"
          />
        </View>

        <View style={styles.headerContent}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Estimate received
          </AppText>

          <AppText style={styles.subtitle}>
            The worker sent you a price.
          </AppText>
        </View>
      </View>

      <View style={styles.priceRow}>
        <AppText style={styles.priceLabel}>
          Price
        </AppText>

        <AppText
          weight="bold"
          style={styles.price}
        >
          ₦{price.toLocaleString()}
        </AppText>
      </View>

      {message?.trim() ? (
        <View style={styles.note}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color="#64748B"
          />

          <AppText
            numberOfLines={3}
            style={styles.noteText}
          >
            {message.trim()}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 14,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,

    fontSize: 12.5,
    color: "#64748B",
  },

  priceRow: {
    marginTop: 12,

    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 14,

    backgroundColor: "#F8FAFC",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceLabel: {
    fontSize: 13,
    color: "#64748B",
  },

  price: {
    fontSize: 22,
    color: "#F97316",
  },

  note: {
    marginTop: 10,

    flexDirection: "row",
    alignItems: "flex-start",

    paddingHorizontal: 10,
    paddingVertical: 8,

    backgroundColor: "#F8FAFC",

    borderRadius: 12,
  },

  noteText: {
    flex: 1,

    marginLeft: 7,

    fontSize: 12.5,
    lineHeight: 18,

    color: "#64748B",
  },
});