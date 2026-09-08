import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerEstimateForm from "@/components/bookings/WorkerEstimateForm";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  bookingId: string;

  status: string;

  offerPrice?: number | null;

  offerMessage?: string | null;

  onOfferSent?: () => void;
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

function formatMoney(
  value: number,
): string {
  return `₦${value.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderEstimateCard({
  bookingId,
  status,
  offerPrice,
  offerMessage,
  onOfferSent,
}: Props) {
  const normalizedStatus =
    useMemo(
      () =>
        normalizeStatus(
          status,
        ),
      [status],
    );

  const isPendingEstimate =
    normalizedStatus ===
    "pending_estimate";

  const isNegotiating =
    normalizedStatus ===
    "negotiating";

  const canSendOffer =
    isPendingEstimate ||
    isNegotiating;

  const safeOfferPrice =
    typeof offerPrice ===
      "number" &&
    Number.isFinite(
      offerPrice,
    )
      ? offerPrice
      : null;

  const hasOffer =
    safeOfferPrice !==
    null;

  const displayMessage =
    typeof offerMessage ===
      "string"
      ? offerMessage.trim()
      : "";

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        {isPendingEstimate
          ? "Send Estimate"
          : "Price Estimate"}
      </AppText>

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      {isPendingEstimate ? (
        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.description
          }
        >
          Review the customer's request and send your estimated price.
        </AppText>
      ) : null}

      {isNegotiating ? (
        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.description
          }
        >
          The customer is reviewing the current offer. You can send another offer if needed.
        </AppText>
      ) : null}

      {/* ======================================================
          CURRENT OFFER
      ====================================================== */}

      {hasOffer ? (
        <View
          style={
            styles.summary
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.label
            }
          >
            Current Offer
          </AppText>

          <AppText
            variant="heading1"
            weight="bold"
            numberOfLines={1}
            style={
              styles.price
            }
          >
            {formatMoney(
              safeOfferPrice,
            )}
          </AppText>

          {displayMessage ? (
            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.message
              }
            >
              {displayMessage}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {/* ======================================================
          ESTIMATE FORM
      ====================================================== */}

      {canSendOffer ? (
        <WorkerEstimateForm
          bookingId={
            bookingId
          }
          onSuccess={
            onOfferSent
          }
        />
      ) : null}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOrderEstimateCard.displayName =
  "WorkerOrderEstimateCard";

export default memo(
  WorkerOrderEstimateCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.lg,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CURRENT OFFER
    ======================================================== */

    summary: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    label: {
      color:
        Colors.textSecondary,
    },

    price: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        WorkerColors.primary,
    },

    message: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });