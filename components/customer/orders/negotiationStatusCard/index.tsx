import React from "react";

import WaitingEstimate from "./WaitingEstimate";
import Negotiating from "./Negotiating";
import AgreementReached from "./AgreementReached";
import WorkerOnTheWay from "./WorkerOnTheWay";
import WorkStarted from "./WorkStarted";
import AwaitingCash from "./AwaitingCash";
import Completed from "./Completed";
import Cancelled from "./Cancelled";

import WaitingWorkerResponseCard from "@/components/customer/orders/WaitingWorkerResponseCard";

import type { NegotiationStatusCardProps } from "./types";

export default function NegotiationStatusCard({
  booking,
  offers,
  onAccept,
  onReject,
}: NegotiationStatusCardProps) {
  switch (booking.status) {
    case "pending_estimate":
      return <WaitingEstimate booking={booking} />;

    case "negotiating":
      if (booking.lastOfferBy === "customer") {
        return (
          <WaitingWorkerResponseCard
            counterPrice={Number(booking.offerPrice ?? 0)}
          />
        );
      }

      return (
        <Negotiating
          booking={booking}
          offers={offers}
          onAccept={onAccept}
          onReject={onReject}
        />
      );

    case "accepted":
      return (
        <AgreementReached
          agreedPrice={Number(
            booking.offerPrice ??
              booking.agreedPrice ??
              0
          )}
        />
      );

    case "on_the_way":
      return (
        <WorkerOnTheWay
          estimatedArrival={booking.estimatedArrival}
        />
      );

    case "arrived":
      return (
        <WorkerOnTheWay
          arrived
          estimatedArrival={booking.estimatedArrival}
        />
      );

    case "in_progress":
      return (
        <WorkStarted
          startedAt={booking.startedAt}
        />
      );

    case "awaiting_cash":
    case "payment_pending_confirmation":
      return (
        <AwaitingCash
          agreedPrice={Number(
            booking.offerPrice ??
              booking.agreedPrice ??
              0
          )}
        />
      );

    case "completed":
      return (
        <Completed
          completedAt={booking.completedAt}
        />
      );

    case "cancelled":
      return (
        <Cancelled
          cancelledBy={booking.cancelledBy}
          reason={booking.cancelReason}
          cancelledAt={booking.cancelledAt}
        />
      );

    default:
      return <WaitingEstimate booking={booking} />;
  }
}