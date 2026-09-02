import React from "react";
import { View } from "react-native";

import { AppCard, AppText } from "@/components/ui";

import StatusHeader from "./StatusHeader";
import styles from "./styles";

type Props = {
  agreedPrice: number;
};

export default function AgreementReached({
  agreedPrice,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon="checkmark-circle"
        color="#16A34A"
        title="Agreement Reached"
        description="Both you and the worker have agreed on the final price."
      />

      <View style={styles.section}>
        <AppText style={styles.label}>
          Agreed Price
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
          Waiting for worker to start the job
        </AppText>
      </View>
    </AppCard>
  );
}