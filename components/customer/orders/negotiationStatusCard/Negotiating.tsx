import React, {
  useState,
} from "react";

import {
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import OfferHistory from "@/components/customer/booking-status/OfferHistory";

import OfferInput from "@/components/customer/booking-status/OfferInput";

import CustomerOfferActions from "@/components/customer/booking-status/CustomerOfferActions";

import StatusHeader from "./StatusHeader";

import styles from "./styles";

import type {
  Booking,
} from "./types";

import type {
  BookingOffer,
} from "@/firebase/queries/bookings/listenOffers";

type Props = {
  booking: Booking;

  offers: BookingOffer[];

  onAccept: () => Promise<void>;

  onReject: () => Promise<void>;
};

export default function NegotiationStatusCard({
  booking,

  offers,

  onAccept,

  onReject,
}: Props) {
  const [
    showCounterOffer,
    setShowCounterOffer,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const hasWorkerOffer =
    booking.lastOfferBy ===
    "worker" &&
    booking.offerPrice != null;

  const handleAccept =
    async () => {
      if (actionLoading) {
        return;
      }

      try {
        setActionLoading(true);

        await onAccept();
      } finally {
        setActionLoading(false);
      }
    };

  const handleReject =
    async () => {
      if (actionLoading) {
        return;
      }

      try {
        setActionLoading(true);

        await onReject();
      } finally {
        setActionLoading(false);
      }
    };

  const handleCounterOffer =
    () => {
      setShowCounterOffer(true);
    };

  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon="cash-outline"
        color="#16A34A"
        title="Negotiation"
        description={
          hasWorkerOffer
            ? "The worker has sent you an estimate. Review it and choose what to do."
            : "Review the latest offer or send a counter offer."
        }
      />

      {booking.offerPrice !=
        null && (
        <View
          style={
            styles.section
          }
        >
          <AppText
            style={
              styles.label
            }
          >
            Current Offer
          </AppText>

          <AppText
            style={
              styles.amount
            }
          >
            ₦
            {Number(
              booking.offerPrice,
            ).toLocaleString()}
          </AppText>
        </View>
      )}

      {!!booking.offerMessage && (
        <View
          style={
            styles.messageBox
          }
        >
          <AppText
            style={
              styles.label
            }
          >
            Worker's Message
          </AppText>

          <AppText
            style={
              styles.message
            }
          >
            {
              booking.offerMessage
            }
          </AppText>
        </View>
      )}

      {offers.length > 0 && (
        <View
          style={
            styles.section
          }
        >
          <OfferHistory
            offers={offers}
          />
        </View>
      )}

      {showCounterOffer && (
        <View
          style={
            styles.section
          }
        >
          <OfferInput
            bookingId={
              booking.id
            }
          />
        </View>
      )}

      <View
        style={
          styles.actions
        }
      >
        <CustomerOfferActions
          loading={
            actionLoading
          }
          onAccept={
            handleAccept
          }
          onReject={
            handleReject
          }
          onCounterOffer={
            handleCounterOffer
          }
          showCounterOffer={
            hasWorkerOffer &&
            !showCounterOffer
          }
        />
      </View>
    </AppCard>
  );
}