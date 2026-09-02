import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function rejectOffer(
  bookingId: string,
): Promise<void> {
  const cleanBookingId =
    bookingId.trim();

  if (!cleanBookingId) {
    throw new Error(
      "Booking ID is required.",
    );
  }

  const bookingRef = doc(
    db,
    "bookings",
    cleanBookingId,
  );

  const snapshot =
    await getDoc(bookingRef);

  if (!snapshot.exists()) {
    throw new Error(
      "Booking not found.",
    );
  }

  const booking =
    snapshot.data();

  if (
    booking.status !==
    "negotiating"
  ) {
    throw new Error(
      "There is no active offer to reject.",
    );
  }

  if (
    booking.lastOfferBy !==
    "worker"
  ) {
    throw new Error(
      "There is no worker offer to reject.",
    );
  }

  await updateDoc(
    bookingRef,
    {
      status: "negotiating",

      offerPrice: null,

      offerMessage: null,

      lastOfferBy: null,

      updatedAt:
        serverTimestamp(),
    },
  );
}