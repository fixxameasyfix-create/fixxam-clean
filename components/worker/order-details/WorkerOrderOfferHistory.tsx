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
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  BookingOffer,
} from "@/firebase/queries/bookings/listenOffers";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  offers?: BookingOffer[];
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeMoney(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return Math.max(
      0,
      value,
    );
  }

  if (
    typeof value === "string"
  ) {
    const cleaned =
      value
        .replace(
          /[₦,\s]/g,
          "",
        )
        .trim();

    if (!cleaned) {
      return 0;
    }

    const parsed =
      Number(cleaned);

    return Number.isFinite(
      parsed,
    )
      ? Math.max(
          0,
          parsed,
        )
      : 0;
  }

  return 0;
}

function getSafeText(
  value: unknown,
): string {
  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  return "";
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
   OFFER ITEM
============================================================ */

const OfferItem =
  memo(
    function OfferItem({
      offer,
      index,
    }: {
      offer: BookingOffer;
      index: number;
    }) {
      const sender =
        getSafeText(
          offer.sender,
        ).toLowerCase();

      const isWorker =
        sender ===
        "worker";

      const amount =
        getSafeMoney(
          offer.amount,
        );

      const message =
        getSafeText(
          offer.message,
        );

      return (
        <View
          style={[
            styles.bubble,

            isWorker
              ? styles.workerBubble
              : styles.customerBubble,

            index > 0
              ? styles.bubbleSpacing
              : null,
          ]}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.sender
              }
            >
              {isWorker
                ? "You"
                : "Customer"}
            </AppText>

            <View
              style={[
                styles.senderBadge,

                isWorker
                  ? styles.workerBadge
                  : styles.customerBadge,
              ]}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={[
                  styles.senderBadgeText,

                  isWorker
                    ? styles.workerBadgeText
                    : styles.customerBadgeText,
                ]}
              >
                {isWorker
                  ? "WORKER"
                  : "CUSTOMER"}
              </AppText>
            </View>
          </View>

          {/* ==================================================
              AMOUNT
          ================================================== */}

          <AppText
            variant="heading3"
            weight="bold"
            numberOfLines={1}
            style={[
              styles.amount,

              isWorker
                ? styles.workerAmount
                : styles.customerAmount,
            ]}
          >
            {formatMoney(
              amount,
            )}
          </AppText>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          {message ? (
            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.message
              }
            >
              {message}
            </AppText>
          ) : null}
        </View>
      );
    },
  );

OfferItem.displayName =
  "WorkerOrderOfferHistoryItem";

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderOfferHistory({
  offers = [],
}: Props) {
  const validOffers =
    useMemo(
      () =>
        offers.filter(
          offer =>
            offer != null,
        ),
      [offers],
    );

  if (
    validOffers.length === 0
  ) {
    return null;
  }

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Offer History
      </AppText>

      {/* ======================================================
          OFFERS
      ====================================================== */}

      <View>
        {validOffers.map(
          (
            offer,
            index,
          ) => {
            const key =
              getSafeText(
                offer.id,
              ) ||
              `${getSafeText(
                offer.sender,
              )}-${getSafeMoney(
                offer.amount,
              )}-${index}`;

            return (
              <OfferItem
                key={key}
                offer={
                  offer
                }
                index={
                  index
                }
              />
            );
          },
        )}
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOrderOfferHistory.displayName =
  "WorkerOrderOfferHistory";

export default memo(
  WorkerOrderOfferHistory,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

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

    title: {
      marginBottom:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       OFFER BUBBLE
    ======================================================== */

    bubble: {
      width: "88%",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.lg,
    },

    bubbleSpacing: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    workerBubble: {
      alignSelf:
        "flex-end",

      borderColor:
        WorkerColors.primarySoft,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    customerBubble: {
      alignSelf:
        "flex-start",

      borderColor:
        CustomerColors.primarySoft,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    sender: {
      flexShrink: 1,

      color:
        Colors.textPrimary,
    },

    senderBadge: {
      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    workerBadge: {
      backgroundColor:
        Colors.surface,
    },

    customerBadge: {
      backgroundColor:
        Colors.surface,
    },

    senderBadgeText: {
      fontSize: 9,
    },

    workerBadgeText: {
      color:
        WorkerColors.primary,
    },

    customerBadgeText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       OFFER CONTENT
    ======================================================== */

    amount: {
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    workerAmount: {
      color:
        WorkerColors.primary,
    },

    customerAmount: {
      color:
        CustomerColors.primary,
    },

    message: {
      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });