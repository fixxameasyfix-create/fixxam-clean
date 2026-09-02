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

export default function WorkerCounterOfferCard({
  price,
  message,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="swap-horizontal-outline"
            size={20}
            color="#2563EB"
          />
        </View>

        <View style={styles.headerContent}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            New offer from worker
          </AppText>

          <AppText style={styles.subtitle}>
            Review the price and choose what to do.
          </AppText>
        </View>
      </View>

      <View style={styles.offerRow}>
        <View>
          <AppText style={styles.label}>
            Worker&apos;s offer
          </AppText>

          <AppText
            weight="bold"
            style={styles.price}
          >
            ₦{price.toLocaleString()}
          </AppText>
        </View>

        <View style={styles.status}>
          <Ionicons
            name="cash-outline"
            size={15}
            color="#1D4ED8"
          />

          <AppText
            weight="bold"
            style={styles.statusText}
          >
            New offer
          </AppText>
        </View>
      </View>

      {message?.trim() ? (
        <View style={styles.messageRow}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={17}
            color="#64748B"
          />

          <View style={styles.messageContent}>
            <AppText
              weight="bold"
              style={styles.messageLabel}
            >
              Worker&apos;s message
            </AppText>

            <AppText style={styles.message}>
              {message}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    color: "#1D4ED8",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },

  offerRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#BFDBFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  price: {
    fontSize: 25,
    color: "#F97316",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  statusText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#1D4ED8",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#BFDBFE",
  },

  messageContent: {
    flex: 1,
    marginLeft: 8,
  },

  messageLabel: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 2,
  },

  message: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
});