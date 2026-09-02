import React from "react";
import { View } from "react-native";

import { AppCard, AppText } from "@/components/ui";

import StatusHeader from "./StatusHeader";
import styles from "./styles";

type Props = {
  cancelledBy?: "customer" | "worker" | "admin";
  reason?: string;
  cancelledAt?: string;
};

export default function Cancelled({
  cancelledBy,
  reason,
  cancelledAt,
}: Props) {
  const cancelledByText = {
    customer: "Customer",
    worker: "Worker",
    admin: "Fixxam Support",
  }[cancelledBy ?? "customer"];

  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon="close-circle"
        color="#DC2626"
        title="Order Cancelled"
        description="This order has been cancelled."
      />

      <View style={styles.section}>
        <AppText style={styles.label}>
          Cancelled By
        </AppText>

        <AppText style={styles.message}>
          {cancelledByText}
        </AppText>
      </View>

      {!!reason && (
        <View style={styles.messageBox}>
          <AppText style={styles.label}>
            Reason
          </AppText>

          <AppText style={styles.message}>
            {reason}
          </AppText>
        </View>
      )}

      {!!cancelledAt && (
        <View style={styles.section}>
          <AppText style={styles.label}>
            Cancelled On
          </AppText>

          <AppText style={styles.message}>
            {cancelledAt}
          </AppText>
        </View>
      )}

      <View style={styles.divider} />

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: "#FEE2E2",
          },
        ]}
      >
        <AppText
          style={[
            styles.statusText,
            {
              color: "#B91C1C",
            },
          ]}
        >
          This booking is no longer active.
        </AppText>
      </View>
    </AppCard>
  );
}