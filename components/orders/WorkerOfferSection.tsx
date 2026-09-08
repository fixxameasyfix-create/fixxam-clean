import React, {
  memo,
} from "react";

import WorkerOfferCard from "./WorkerOfferCard";

import type {
  WorkerOfferState,
} from "./WorkerOfferCard";

/* ============================================================
   RE-EXPORT
============================================================ */

export type {
  WorkerOfferState,
} from "./WorkerOfferCard";

/* ============================================================
   TYPES
============================================================ */

type WorkerOfferSectionProps = {
  state: WorkerOfferState;

  offerAmount?: number | null;

  offerMessage?: string | null;

  counterOfferAmount?: number | null;

  counterOfferMessage?: string | null;

  onSendOffer: () => void;

  onAcceptCounter: () => void;

  onCounter: () => void;

  onDeclineCounter: () => void;

  loading?: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferSection({
  state,
  offerAmount,
  offerMessage,
  counterOfferAmount,
  counterOfferMessage,
  onSendOffer,
  onAcceptCounter,
  onCounter,
  onDeclineCounter,
  loading = false,
}: WorkerOfferSectionProps) {
  return (
    <WorkerOfferCard
      state={state}
      offerAmount={offerAmount}
      offerMessage={offerMessage}
      counterOfferAmount={
        counterOfferAmount
      }
      counterOfferMessage={
        counterOfferMessage
      }
      onSendOffer={onSendOffer}
      onAcceptCounter={
        onAcceptCounter
      }
      onCounter={onCounter}
      onDeclineCounter={
        onDeclineCounter
      }
      loading={loading}
    />
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  WorkerOfferSection,
);