import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function acceptOffer(
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

  /*
   * Only an active negotiation
   * can be accepted.
   */
  if (
    booking.status !==
    "negotiating"
  ) {
    throw new Error(
      "There is no active offer to accept.",
    );
  }

  /*
   * Customer can only accept
   * the latest offer sent by
   * the worker.
   */
  if (
    booking.lastOfferBy !==
    "worker"
  ) {
    throw new Error(
      "There is no worker offer available to accept.",
    );
  }

  const offerPrice =
    Number(
      booking.offerPrice ?? 0,
    );

  if (
    !Number.isFinite(
      offerPrice,
    ) ||
    offerPrice <= 0
  ) {
    throw new Error(
      "A valid worker offer is required before accepting.",
    );
  }

  /*
   * New flow:
   *
   * negotiating
   *      ↓
   * booked
   *
   * The agreed price is now
   * fixed for the booking.
   */
  await updateDoc(
    bookingRef,
    {
      status: "booked",

      agreedPrice:
        offerPrice,

      price:
        offerPrice,

      amount:
        offerPrice,

      acceptedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}