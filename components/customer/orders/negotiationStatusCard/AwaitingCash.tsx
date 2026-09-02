import React from "react";
import { View } from "react-native";

import { AppCard, AppText } from "@/components/ui";

import StatusHeader from "./StatusHeader";
import styles from "./styles";

type Props = {
  agreedPrice: number;
};

export default function AwaitingCash({
  agreedPrice,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon="cash-outline"
        color="#16A34A"
        title="Awaiting Cash Payment"
        description="The work has been completed. Please pay the worker the agreed amount in cash."
      />

      <View style={styles.section}>
        <AppText style={styles.label}>
          Amount to Pay
        </AppText>

        <AppText style={styles.amount}>
          ₦{agreedPrice.toLocaleString()}
        </AppText>
      </View>

      <View style={styles.divider} />

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: "#DCFCE7",
          },
        ]}
      >
        <AppText
          style={[
            styles.statusText,
            {
              color: "#166534",
            },
          ]}
        >
          Pay the worker in cash. After payment, tap the confirmation button below.
        </AppText>
      </View>
    </AppCard>
  );
}