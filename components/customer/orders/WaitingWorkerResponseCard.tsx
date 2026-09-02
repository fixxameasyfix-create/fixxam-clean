import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  counterPrice: number;
};

export default function WaitingWorkerResponseCard({
  counterPrice,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="time-outline"
            size={20}
            color="#D97706"
          />
        </View>

        <View style={styles.headerContent}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Waiting for worker
          </AppText>

          <AppText style={styles.subtitle}>
            Your offer has been sent.
          </AppText>
        </View>
      </View>

      <View style={styles.offerRow}>
        <View>
          <AppText style={styles.label}>
            Your offer
          </AppText>

          <AppText
            weight="bold"
            style={styles.price}
          >
            ₦{counterPrice.toLocaleString()}
          </AppText>
        </View>

        <View style={styles.status}>
          <Ionicons
            name="time-outline"
            size={15}
            color="#92400E"
          />

          <AppText
            weight="bold"
            style={styles.statusText}
          >
            Waiting
          </AppText>
        </View>
      </View>

      <View style={styles.messageRow}>
        <Ionicons
          name="notifications-outline"
          size={17}
          color="#92400E"
        />

        <AppText style={styles.message}>
          The worker will reply when they review your offer.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFBEB",
    borderRadius: 18,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    color: "#92400E",
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
    borderTopColor: "#FDE68A",
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
    fontSize: 24,
    color: "#F97316",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },

  statusText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#92400E",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#FDE68A",
  },

  message: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
});