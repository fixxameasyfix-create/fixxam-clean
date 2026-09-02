import React from "react";
import { View } from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import StatusHeader from "./StatusHeader";
import styles from "./styles";

type Props = {
  startedAt?: string;
};

export default function WorkStarted({
  startedAt,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon="construct-outline"
        color="#F59E0B"
        title="Work in Progress"
        description="The worker is currently carrying out your requested service."
      />

      {startedAt ? (
        <View style={styles.section}>
          <AppText style={styles.label}>
            Started At
          </AppText>

          <AppText style={styles.message}>
            {startedAt}
          </AppText>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: "#FEF3C7",
          },
        ]}
      >
        <AppText
          style={[
            styles.statusText,
            {
              color: "#92400E",
            },
          ]}
        >
          The service is currently in progress. You will be notified when payment is requested.
        </AppText>
      </View>
    </AppCard>
  );
}