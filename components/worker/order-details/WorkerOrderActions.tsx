import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  status: string;

  loading?: boolean;

  onOnTheWay: () => void;

  onArrived: () => void;

  onStartJob: () => void;

  onRequestCash: () => void;

  onConfirmPayment: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeStatus(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[\s-]+/g,
      "_",
    );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderActions({
  status,
  loading = false,
  onOnTheWay,
  onArrived,
  onStartJob,
  onRequestCash,
  onConfirmPayment,
}: Props) {
  const normalizedStatus =
    useMemo(
      () =>
        normalizeStatus(
          status,
        ),
      [status],
    );

  /* ==========================================================
     BOOKED
  ========================================================== */

  if (
    normalizedStatus ===
    "booked"
  ) {
    return (
      <ActionContainer>
        <AppButton
          title="I'm On The Way"
          role="worker"
          variant="primary"
          loading={
            loading
          }
          disabled={
            loading
          }
          onPress={
            onOnTheWay
          }
        />
      </ActionContainer>
    );
  }

  /* ==========================================================
     ON THE WAY
  ========================================================== */

  if (
    normalizedStatus ===
    "on_the_way"
  ) {
    return (
      <ActionContainer>
        <AppButton
          title="I've Arrived"
          role="worker"
          variant="primary"
          loading={
            loading
          }
          disabled={
            loading
          }
          onPress={
            onArrived
          }
        />
      </ActionContainer>
    );
  }

  /* ==========================================================
     ARRIVED
  ========================================================== */

  if (
    normalizedStatus ===
    "arrived"
  ) {
    return (
      <ActionContainer>
        <AppButton
          title="Start Job"
          role="worker"
          variant="primary"
          loading={
            loading
          }
          disabled={
            loading
          }
          onPress={
            onStartJob
          }
        />
      </ActionContainer>
    );
  }

  /* ==========================================================
     IN PROGRESS
  ========================================================== */

  if (
    normalizedStatus ===
    "in_progress"
  ) {
    return (
      <ActionContainer>
        <AppButton
          title="Request Cash Payment"
          role="worker"
          variant="primary"
          loading={
            loading
          }
          disabled={
            loading
          }
          onPress={
            onRequestCash
          }
        />
      </ActionContainer>
    );
  }

  /* ==========================================================
     AWAITING CUSTOMER PAYMENT
  ========================================================== */

  if (
    normalizedStatus ===
    "awaiting_cash"
  ) {
    return (
      <ActionContainer>
        <AppButton
          title="Waiting for Payment"
          role="worker"
          variant="secondary"
          disabled
          onPress={() => {}}
        />
      </ActionContainer>
    );
  }

  /* ==========================================================
     PAYMENT PENDING CONFIRMATION
  ========================================================== */

  if (
    normalizedStatus ===
    "payment_pending_confirmation"
  ) {
    return (
      <ActionContainer>
        <AppButton
          title="Confirm Payment"
          role="worker"
          variant="primary"
          loading={
            loading
          }
          disabled={
            loading
          }
          onPress={
            onConfirmPayment
          }
        />
      </ActionContainer>
    );
  }

  /* ==========================================================
     NO ACTION
  ========================================================== */

  return null;
}

/* ============================================================
   ACTION CONTAINER
============================================================ */

function ActionContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View
      style={
        styles.container
      }
    >
      {children}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOrderActions.displayName =
  "WorkerOrderActions";

export default memo(
  WorkerOrderActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xxl,
    },
  });