import * as admin from "firebase-admin";

import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   DELETE SHOP
============================================================ */

export const deleteShop =
  onCall(
    {
      timeoutSeconds: 120,
      memory: "256MiB",
    },

    async (request) => {
      /* ======================================================
         AUTH
      ====================================================== */

      const workerId =
        cleanString(
          request.auth?.uid,
        );

      if (!workerId) {
        throw new HttpsError(
          "unauthenticated",
          "You must be signed in to delete your shop.",
        );
      }

      const db =
        admin.firestore();

      const shopRef =
        db
          .collection("shops")
          .doc(workerId);

      /* ======================================================
         SHOP
      ====================================================== */

      const shopSnapshot =
        await shopRef.get();

      if (!shopSnapshot.exists) {
        throw new HttpsError(
          "not-found",
          "Your shop does not exist.",
        );
      }

      const shop =
        shopSnapshot.data();

      if (!shop) {
        throw new HttpsError(
          "internal",
          "Shop information is unavailable.",
        );
      }

      /* ======================================================
         OWNERSHIP
      ====================================================== */

      const ownerId =
        cleanString(
          shop.ownerId,
        );

      if (ownerId !== workerId) {
        throw new HttpsError(
          "permission-denied",
          "You cannot delete this shop.",
        );
      }

      /* ======================================================
         ACTIVE REQUESTS
      ====================================================== */

      const requestsRef =
        db.collection(
          "shopRequests",
        );

      const [
        pendingSnapshot,
        acceptedSnapshot,
      ] =
        await Promise.all([
          requestsRef
            .where(
              "workerId",
              "==",
              workerId,
            )
            .where(
              "status",
              "==",
              "pending",
            )
            .limit(1)
            .get(),

          requestsRef
            .where(
              "workerId",
              "==",
              workerId,
            )
            .where(
              "status",
              "==",
              "accepted",
            )
            .limit(1)
            .get(),
        ]);

      if (
        !pendingSnapshot.empty ||
        !acceptedSnapshot.empty
      ) {
        throw new HttpsError(
          "failed-precondition",
          "Complete or decline your active customer requests before deleting your shop.",
        );
      }

      /* ======================================================
         DELETE SERVICES
      ====================================================== */

      await db.recursiveDelete(
        shopRef.collection(
          "services",
        ),
      );

      /* ======================================================
         DELETE SHOP FILES
      ====================================================== */

      try {
        await admin
          .storage()
          .bucket()
          .deleteFiles({
            prefix:
              `shops/${workerId}/`,
          });
      } catch (error) {
        console.error(
          "FIXXAM_DELETE_SHOP_FILES_ERROR:",
          {
            workerId,
            error,
          },
        );

        throw new HttpsError(
          "internal",
          "Unable to remove shop files.",
        );
      }

      /* ======================================================
         DELETE SHOP
      ====================================================== */

      await shopRef.delete();

      console.log(
        "FIXXAM_SHOP_DELETED:",
        {
          workerId,
        },
      );

      return {
        success: true,
      };
    },
  );