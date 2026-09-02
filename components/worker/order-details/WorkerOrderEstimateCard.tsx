import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import WorkerEstimateForm from "@/components/bookings/WorkerEstimateForm";

type Props = {
  bookingId: string;
  status: string;
  offerPrice?: number | null;
  offerMessage?: string | null;
  onOfferSent?: () => void;
};

export default function WorkerOrderEstimateCard({
  bookingId,
  status,
  offerPrice,
  offerMessage,
  onOfferSent,
}: Props) {
  const isPendingEstimate =
    status === "pending_estimate";

  const isNegotiating =
    status === "negotiating";

  const canSendOffer =
    isPendingEstimate ||
    isNegotiating;

  const hasOffer =
    offerPrice != null &&
    Number.isFinite(
      Number(offerPrice),
    );

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        {isPendingEstimate
          ? "Send Estimate"
          : "Price Estimate"}
      </AppText>

      {isPendingEstimate ? (
        <AppText
          style={styles.description}
        >
          Review the customer's request
          and send your estimated price.
        </AppText>
      ) : null}

      {isNegotiating ? (
        <AppText
          style={styles.description}
        >
          The customer is reviewing the
          current offer. You can send
          another offer if needed.
        </AppText>
      ) : null}

      {hasOffer ? (
        <View style={styles.summary}>
          <AppText
            style={styles.label}
          >
            Current Offer
          </AppText>

          <AppText
            weight="bold"
            style={styles.price}
          >
            ₦
            {Number(
              offerPrice,
            ).toLocaleString()}
          </AppText>

          {offerMessage ? (
            <AppText
              style={styles.message}
            >
              {offerMessage}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {canSendOffer ? (
        <WorkerEstimateForm
          bookingId={bookingId}
          onSuccess={onOfferSent}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
    marginBottom: 8,
  },

  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },

  summary: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  label: {
    color: "#64748B",
    fontSize: 13,
  },

  price: {
    marginTop: 6,
    fontSize: 24,
    color: "#FF6B00",
  },

  message: {
    marginTop: 8,
    color: "#475569",
    lineHeight: 20,
    fontSize: 13,
  },
});