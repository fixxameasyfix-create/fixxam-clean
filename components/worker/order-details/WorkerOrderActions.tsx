import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
} from "@/components/ui";

type Props = {
  status: string;
  loading?: boolean;

  onOnTheWay: () => void;
  onArrived: () => void;
  onStartJob: () => void;
  onRequestCash: () => void;
  onConfirmPayment: () => void;
};

export default function WorkerOrderActions({
  status,
  loading = false,
  onOnTheWay,
  onArrived,
  onStartJob,
  onRequestCash,
  onConfirmPayment,
}: Props) {
  /*
   * ============================================================
   * BOOKED
   * ============================================================
   *
   * Customer has accepted the worker's offer.
   * Worker can now start travelling.
   */

  if (status === "booked") {
    return (
      <View style={styles.container}>
        <AppButton
          title="I'm On The Way"
          loading={loading}
          onPress={onOnTheWay}
        />
      </View>
    );
  }

  /*
   * ============================================================
   * ON THE WAY
   * ============================================================
   */

  if (status === "on_the_way") {
    return (
      <View style={styles.container}>
        <AppButton
          title="I've Arrived"
          loading={loading}
          onPress={onArrived}
        />
      </View>
    );
  }

  /*
   * ============================================================
   * ARRIVED
   * ============================================================
   */

  if (status === "arrived") {
    return (
      <View style={styles.container}>
        <AppButton
          title="Start Job"
          loading={loading}
          onPress={onStartJob}
        />
      </View>
    );
  }

  /*
   * ============================================================
   * IN PROGRESS
   * ============================================================
   */

  if (status === "in_progress") {
    return (
      <View style={styles.container}>
        <AppButton
          title="Request Cash Payment"
          loading={loading}
          onPress={onRequestCash}
        />
      </View>
    );
  }

  /*
   * ============================================================
   * AWAITING CUSTOMER PAYMENT
   * ============================================================
   */

  if (status === "awaiting_cash") {
    return (
      <View style={styles.container}>
        <AppButton
          title="Waiting for Payment"
          loading={false}
          disabled
          onPress={() => {}}
        />
      </View>
    );
  }

  /*
   * ============================================================
   * PAYMENT PENDING CONFIRMATION
   * ============================================================
   *
   * Customer has indicated payment.
   * Worker confirms receipt.
   */

  if (
    status ===
    "payment_pending_confirmation"
  ) {
    return (
      <View style={styles.container}>
        <AppButton
          title="Confirm Payment"
          loading={loading}
          onPress={onConfirmPayment}
        />
      </View>
    );
  }

  /*
   * ============================================================
   * NO ACTION
   * ============================================================
   *
   * pending
   * pending_estimate
   * negotiating
   * completed
   * cancelled
   */

  return null;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 40,
  },
});