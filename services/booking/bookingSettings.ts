import type { Booking } from "@/types/booking";

import {
acceptBooking,
arrivedBooking,
cancelBooking,
completeBooking,
createBooking,
rejectBooking,
startBooking,
type CustomerCancellationReason,
type OfferAcceptedBy,
} from "@/firebase/queries/bookings";

export async function bookWorker(
booking: Booking,
) {
return createBooking(booking);
}

export async function acceptJob(
bookingId: string,
acceptedBy: OfferAcceptedBy,
) {
return acceptBooking(
bookingId,
acceptedBy,
);
}

export async function acceptCustomerOffer(
bookingId: string,
) {
return acceptBooking(
bookingId,
"customer",
);
}

export async function acceptWorkerCounterOffer(
bookingId: string,
) {
return acceptBooking(
bookingId,
"worker",
);
}

export async function rejectJob(
bookingId: string,
) {
return rejectBooking(bookingId);
}

export async function arrivedAtJob(
bookingId: string,
) {
return arrivedBooking(bookingId);
}

export async function startJob(
bookingId: string,
) {
return startBooking(bookingId);
}

export async function completeJob(
bookingId: string,
) {
return completeBooking(bookingId);
}

export async function cancelJob(
bookingId: string,
reason: CustomerCancellationReason,
note = "",
) {
return cancelBooking(
bookingId,
reason,
note,
);
}