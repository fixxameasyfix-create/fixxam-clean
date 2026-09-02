import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function workerAcceptCounterOffer(
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
      "There is no active negotiation.",
    );
  }

  if (
    booking.lastOfferBy !==
    "customer"
  ) {
    throw new Error(
      "There is no customer counter-offer to accept.",
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
      "A valid customer offer is required.",
    );
  }

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