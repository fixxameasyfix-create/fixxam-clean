import React from "react";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import StatusHeader from "./StatusHeader";
import styles from "./styles";
import type { Booking } from "./types";

type Props = {
  booking: Booking;
};

export default function WaitingEstimate({
  booking,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon="time-outline"
        color="#F59E0B"
        title="Waiting for Estimate"
        description="The worker is reviewing your request."
      />

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: "#FEF3C7",
            marginTop: 12,
            alignSelf: "flex-start",
          },
        ]}
      >
        <Ionicons
          name="time-outline"
          size={14}
          color="#92400E"
          style={{ marginRight: 6 }}
        />

        <AppText
          style={[
            styles.statusText,
            {
              color: "#92400E",
            },
          ]}
        >
          Waiting for Worker's Estimate
        </AppText>
      </View>

      {booking.offerMessage ? (
        <View
          style={[
            styles.messageBox,
            {
              marginTop: 12,
            },
          ]}
        >
          <AppText
            weight="bold"
            style={styles.label}
          >
            Note
          </AppText>

          <AppText style={styles.message}>
            {booking.offerMessage}
          </AppText>
        </View>
      ) : null}
    </AppCard>
  );
}