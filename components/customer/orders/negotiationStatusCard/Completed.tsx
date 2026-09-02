import React from "react";
import { View } from "react-native";

import { AppCard, AppText } from "@/components/ui";

import StatusHeader from "./StatusHeader";
import styles from "./styles";

type Props = {
  completedAt?: string;
};

export default function Completed({
  completedAt,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon="checkmark-done-circle"
        color="#16A34A"
        title="Order Completed"
        description="This service has been completed successfully."
      />

      {completedAt ? (
        <View style={styles.section}>
          <AppText style={styles.label}>
            Completed On
          </AppText>

          <AppText style={styles.message}>
            {completedAt}
          </AppText>
        </View>
      ) : null}

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
          Thank you for using Fixxam.
        </AppText>
      </View>
    </AppCard>
  );
}