import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export type BookingStatus =
  | "pending"
  | "pending_estimate"
  | "negotiating"
  | "booked"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "awaiting_cash"
  | "payment_pending_confirmation"
  | "completed"
  | "cancelled";

export type UpdateBookingData = {
  status?: BookingStatus;

  workerId?: string | null;
  workerName?: string | null;
  workerPhoto?: string | null;

  price?: number | null;
  amount?: number | null;
  agreedPrice?: number | null;

  offerPrice?: number | null;
  offerMessage?: string | null;

  lastOfferBy?:
    | "worker"
    | "customer"
    | null;

  estimatePrice?: number | null;
  estimateMessage?: string | null;

  date?: string | null;
  time?: string | null;

  bookingDate?: string | null;
  bookingTime?: string | null;
};

export async function updateBooking(
  bookingId: string,
  data: UpdateBookingData,
): Promise<void> {
  const cleanBookingId =
    bookingId.trim();

  if (!cleanBookingId) {
    throw new Error(
      "Booking ID is required.",
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Booking update data is required.",
    );
  }

  await updateDoc(
    doc(
      db,
      "bookings",
      cleanBookingId,
    ),
    {
      ...data,
      updatedAt:
        serverTimestamp(),
    },
  );
}