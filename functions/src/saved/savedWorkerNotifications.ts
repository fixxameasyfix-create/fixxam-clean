import {
  onDocumentCreated,
} from "firebase-functions/v2/firestore";

import {
  sendUserPushNotification,
} from "../notifications/sendCustomerPushNotification";

/* ============================================================
   CONFIG
============================================================ */

const REGION =
  "us-central1";

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ============================================================
   SAVED WORKER CREATED
   CUSTOMER → WORKER
============================================================ */

export const savedWorkerCreatedNotification =
  onDocumentCreated(
    {
      document:
        "savedWorkers/{savedWorkerId}",

      region:
        REGION,

      retry:
        true,
    },

    async event => {
      const saved =
        event.data?.data();

      if (!saved) {
        return;
      }

      const savedWorkerId =
        event.params
          .savedWorkerId;

      const workerId =
        cleanString(
          saved.workerId,
        );

      const customerId =
        cleanString(
          saved.customerId,
        );

      const customerName =
        cleanString(
          saved.customerName,
        ) ||
        "A customer";

      if (
        !workerId ||
        !customerId
      ) {
        console.warn(
          "SAVED_WORKER_INVALID_DATA:",
          {
            savedWorkerId,
          },
        );

        return;
      }

      if (
        workerId ===
        customerId
      ) {
        return;
      }

      await sendUserPushNotification({
        userId:
          workerId,

        recipientRole:
          "worker",

        type:
          "saved_worker",

        title:
          "Someone Saved You",

        message:
          `${customerName} has saved you.`,

        notificationId:
          `saved_worker_${savedWorkerId}`,

        data: {
          type:
            "saved_worker",

          action:
            "worker_saved",

          savedWorkerId,

          customerId,

          workerId,
        },
      });
    },
  );