import * as admin from "firebase-admin";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  onDocumentWritten,
} from "firebase-functions/v2/firestore";

import {
  onSchedule,
} from "firebase-functions/v2/scheduler";

/* ============================================================
   CONFIG
============================================================ */

const OFFER_EXPIRY_HOURS = 24;

const OFFER_EXPIRY_MS =
  OFFER_EXPIRY_HOURS *
  60 *
  60 *
  1000;

const EXPIRY_BATCH_LIMIT = 100;

/* ============================================================
   TYPES
============================================================ */

type BookingData = {
  status?: unknown;

  offerStatus?: unknown;

  offerRound?: unknown;

  offerExpiresAt?: unknown;

  offerRespondedAt?: unknown;

  counterOfferStatus?: unknown;

  negotiationStatus?: unknown;

  cancellationReason?: unknown;

  cancelledBy?: unknown;

  cancelledAt?: unknown;

  updatedAt?: unknown;
};

/* ============================================================
   HELPERS
============================================================ */

function isPendingInitialOffer(
  data: BookingData,
): boolean {
  return (
    data.status === "pending" &&
    data.offerStatus === "sent" &&
    data.offerRound === 1 &&
    data.counterOfferStatus === "none"
  );
}


function hasActiveCounter(
  data: BookingData,
): boolean {
  return (
    data.counterOfferStatus === "sent"
  );
}


function hasValidTimestamp(
  value: unknown,
): value is Timestamp {
  return value instanceof Timestamp;
}


/* ============================================================
   SET INITIAL OFFER EXPIRY
============================================================ */

/**
 * Backend-authoritative 24-hour expiry.
 *
 * The mobile client must never calculate or write the
 * authoritative offerExpiresAt value.
 */
export const setBookingOfferExpiry =
  onDocumentWritten(
    {
      document:
        "bookings/{bookingId}",

      region:
        "us-central1",
    },

    async (event) => {
      const afterSnapshot =
        event.data?.after;

      if (
        !afterSnapshot ||
        !afterSnapshot.exists
      ) {
        return;
      }

      const after =
        afterSnapshot.data() as BookingData;

      /* --------------------------------------------------------
         Only an initial worker offer qualifies.
      -------------------------------------------------------- */

      if (
        !isPendingInitialOffer(after)
      ) {
        return;
      }

      /* --------------------------------------------------------
         Counter negotiation must never receive/reset an
         initial offer expiry.
      -------------------------------------------------------- */

      if (
        hasActiveCounter(after)
      ) {
        return;
      }

      /* --------------------------------------------------------
         Never overwrite an existing authoritative expiry.
      -------------------------------------------------------- */

      if (
        hasValidTimestamp(
          after.offerExpiresAt,
        )
      ) {
        return;
      }

      /* --------------------------------------------------------
         Generate expiry from backend server time.
      -------------------------------------------------------- */

      const now =
        Timestamp.now();

      const expiresAt =
        Timestamp.fromMillis(
          now.toMillis() +
            OFFER_EXPIRY_MS,
        );

      await afterSnapshot.ref.update({
        offerExpiresAt:
          expiresAt,

        updatedAt:
          now,
      });

      console.log(
        "FIXXAM_BOOKING_OFFER_EXPIRY_SET:",
        {
          bookingId:
            afterSnapshot.id,

          expiresAt:
            expiresAt.toDate()
              .toISOString(),
        },
      );
    },
  );


/* ============================================================
   EXPIRE BOOKING OFFERS
============================================================ */

/**
 * Authoritative backend expiry.
 *
 * Runs every minute.
 *
 * If the customer has not responded within 24 hours,
 * the entire booking becomes cancelled.
 *
 * The customer application does not need to be open.
 */
export const expireBookingOffers =
  onSchedule(
    {
      schedule:
        "every 1 minutes",

      timeZone:
        "Africa/Lagos",

      region:
        "us-central1",

      timeoutSeconds:
        60,

      memory:
        "256MiB",

      maxInstances:
        1,
    },

    async () => {
      const db =
        admin.firestore();

      const queryNow =
        Timestamp.now();

      /* --------------------------------------------------------
         Find potentially expired initial offers.
      -------------------------------------------------------- */

      const snapshot =
        await db
          .collection("bookings")
          .where(
            "status",
            "==",
            "pending",
          )
          .where(
            "offerStatus",
            "==",
            "sent",
          )
          .where(
            "offerExpiresAt",
            "<=",
            queryNow,
          )
          .limit(
            EXPIRY_BATCH_LIMIT,
          )
          .get();

      if (
        snapshot.empty
      ) {
        console.log(
          "FIXXAM_BOOKING_OFFER_EXPIRY_CHECK: no expired offers.",
        );

        return;
      }

      let expiredCount =
        0;

      /* --------------------------------------------------------
         Process each booking independently.
      -------------------------------------------------------- */

      for (
        const bookingDoc of
          snapshot.docs
      ) {
        try {
          const expired =
            await db.runTransaction(
              async (
                transaction,
              ): Promise<boolean> => {
                const freshSnapshot =
                  await transaction.get(
                    bookingDoc.ref,
                  );

                if (
                  !freshSnapshot.exists
                ) {
                  return false;
                }

                const data =
                  freshSnapshot.data() as BookingData;

                /* ----------------------------------------------
                   Re-check current state inside transaction.
                ---------------------------------------------- */

                if (
                  !isPendingInitialOffer(
                    data,
                  )
                ) {
                  return false;
                }

                /* ----------------------------------------------
                   Once negotiation has a counter offer,
                   original 24-hour expiry no longer applies.
                ---------------------------------------------- */

                if (
                  hasActiveCounter(
                    data,
                  )
                ) {
                  return false;
                }

                /* ----------------------------------------------
                   Expiry must be authoritative Firestore
                   Timestamp.
                ---------------------------------------------- */

                if (
                  !hasValidTimestamp(
                    data.offerExpiresAt,
                  )
                ) {
                  return false;
                }

                /* ----------------------------------------------
                   Use fresh server time inside transaction.
                ---------------------------------------------- */

                const now =
                  Timestamp.now();

                if (
                  data.offerExpiresAt.toMillis() >
                  now.toMillis()
                ) {
                  return false;
                }

                /* ----------------------------------------------
                   Authoritative system cancellation.
                ---------------------------------------------- */

                transaction.update(
                  bookingDoc.ref,
                  {
                    status:
                      "cancelled",

                    cancellationReason:
                      "offer_expired",

                    cancelledBy:
                      "system",

                    cancelledAt:
                      now,

                    offerRespondedAt:
                      now,

                    negotiationStatus:
                      "completed",

                    updatedAt:
                      now,
                  },
                );

                return true;
              },
            );

          if (expired) {
            expiredCount += 1;
          }
        } catch (error) {
          console.error(
            "FIXXAM_BOOKING_OFFER_EXPIRY_ERROR:",
            {
              bookingId:
                bookingDoc.id,

              error,
            },
          );
        }
      }

      console.log(
        "FIXXAM_BOOKING_OFFER_EXPIRY_COMPLETED:",
        {
          checked:
            snapshot.size,

          expired:
            expiredCount,
        },
      );
    },
  );