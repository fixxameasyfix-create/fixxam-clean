import { getApps, initializeApp } from "firebase-admin/app";
import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

export const onBookingCompleted = onDocumentUpdated(
  "bookings/{bookingId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) {
      return;
    }

    if (
      before.status === "completed" ||
      after.status !== "completed"
    ) {
      return;
    }

    if (after.analyticsUpdated === true) {
      return;
    }

    await db.runTransaction(async (tx) => {
      tx.update(
        db.collection("services").doc(after.serviceId),
        {
          bookingCount: FieldValue.increment(1),
          completedCount: FieldValue.increment(1),
        }
      );

      tx.update(
        db.collection("users").doc(after.workerId),
        {
          completedJobs: FieldValue.increment(1),
          totalBookings: FieldValue.increment(1),
        }
      );

      tx.update(
        db.collection("bookings").doc(event.params.bookingId),
        {
          analyticsUpdated: true,
        }
      );
    });

    console.log(
      `Analytics updated for booking ${event.params.bookingId}`
    );
  }
);