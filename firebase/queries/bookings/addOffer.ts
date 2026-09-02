import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/firebase/config";

type AddOfferParams = {
  bookingId: string;

  sender:
    | "worker"
    | "customer";

  amount: number;

  message: string;
};

export async function addOffer({
  bookingId,
  sender,
  amount,
  message,
}: AddOfferParams): Promise<void> {
  const cleanBookingId =
    bookingId.trim();

  if (!cleanBookingId) {
    throw new Error(
      "Booking ID is required.",
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Offer amount must be greater than zero.",
    );
  }

  const cleanMessage =
    message.trim();

  if (cleanMessage.length > 500) {
    throw new Error(
      "Offer message is too long.",
    );
  }

  const bookingRef = doc(
    db,
    "bookings",
    cleanBookingId,
  );

  const offerRef = doc(
    collection(
      db,
      "bookings",
      cleanBookingId,
      "offers",
    ),
  );

  const batch = writeBatch(db);

  /*
   * 1. Save the offer
   */
  batch.set(offerRef, {
    sender,
    amount,
    message: cleanMessage,
    createdAt:
      serverTimestamp(),
    updatedAt:
      serverTimestamp(),
  });

  /*
   * 2. Update the existing booking
   *
   * We DO NOT create another booking.
   *
   * Existing request becomes:
   *
   * negotiating
   */
  batch.update(bookingRef, {
    status: "negotiating",

    offerPrice: amount,

    offerMessage:
      cleanMessage,

    lastOfferBy: sender,

    updatedAt:
      serverTimestamp(),
  });

  /*
   * 3. Commit both writes together.
   */
  await batch.commit();
}