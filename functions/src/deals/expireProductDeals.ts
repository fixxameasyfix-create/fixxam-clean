import * as admin from "firebase-admin";

import {
  onSchedule,
} from "firebase-functions/v2/scheduler";

/* ============================================================
   CONSTANTS
============================================================ */

const BATCH_LIMIT = 400;

/* ============================================================
   EXPIRE PRODUCT DEALS
============================================================ */

/**
 * Automatically expires product discounts
 * after their expiry date.
 *
 * Flow:
 *
 * active deal
 *      ↓
 * expiresAt <= now
 *      ↓
 * status = expired
 *
 * Customer pricing does not depend solely
 * on this function because the client-side
 * active-deal service also validates expiresAt.
 */
export const expireProductDeals =
  onSchedule(
    {
      schedule:
        "every 5 minutes",

      timeZone:
        "Africa/Lagos",

      timeoutSeconds:
        120,

      memory:
        "256MiB",

      retryCount:
        1,
    },

    async () => {
      const firestore =
        admin.firestore();

      const now =
        admin.firestore.Timestamp.now();

      try {
        const snapshot =
          await firestore
            .collection(
              "deals",
            )
            .where(
              "type",
              "==",
              "product",
            )
            .where(
              "status",
              "==",
              "active",
            )
            .where(
              "expiresAt",
              "<=",
              now,
            )
            .limit(
              BATCH_LIMIT,
            )
            .get();

        if (
          snapshot.empty
        ) {
          console.log(
            "FIXXAM_PRODUCT_DEALS_EXPIRY: No expired product deals.",
          );

          return;
        }

        const batch =
          firestore.batch();

        for (
          const document of
            snapshot.docs
        ) {
          batch.update(
            document.ref,
            {
              status:
                "expired",

              updatedAt:
                admin.firestore
                  .FieldValue
                  .serverTimestamp(),
            },
          );
        }

        await batch.commit();

        console.log(
          "FIXXAM_PRODUCT_DEALS_EXPIRED:",
          {
            count:
              snapshot.size,
          },
        );
      } catch (error) {
        console.error(
          "FIXXAM_PRODUCT_DEALS_EXPIRY_ERROR:",
          error,
        );

        throw error;
      }
    },
  );