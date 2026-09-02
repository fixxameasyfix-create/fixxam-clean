import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Props = {
  bookingId: string;
  status: string;
};

const STATUS_LABELS: Record<
  string,
  string
> = {
  pending:
    "New Request",

  pending_estimate:
    "Waiting for Estimate",

  negotiating:
    "Negotiating",

  booked:
    "Booked",

  accepted:
    "Accepted",

  on_the_way:
    "On The Way",

  arrived:
    "Arrived",

  in_progress:
    "In Progress",

  awaiting_cash:
    "Awaiting Cash",

  payment_pending_confirmation:
    "Payment Confirmation",

  completed:
    "Completed",

  cancelled:
    "Cancelled",
};

export default function WorkerOrderHero({
  bookingId,
  status,
}: Props) {
  const label =
    STATUS_LABELS[status] ??
    status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Booking #
        {bookingId.slice(0, 8)}
      </AppText>

      <View style={styles.badge}>
        <AppText
          weight="bold"
          style={styles.badgeText}
        >
          {label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FF6B00",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    color: "#FF6B00",
    fontSize: 12,
    textTransform: "capitalize",
  },
});