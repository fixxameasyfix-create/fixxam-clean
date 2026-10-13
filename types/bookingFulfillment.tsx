/* ==============================================================
   BOOKING FULFILLMENT TYPES
============================================================== */

/**
 * Defines the concrete fulfillment mode
 * stored on an actual booking.
 *
 * Unlike ServiceFulfillmentMode:
 *
 * - "flexible" is not stored on a booking.
 *   The customer must choose one concrete option.
 *
 * - "needs_review" is not bookable.
 *
 * - "remote" represents a service completed
 *   without a physical service destination.
 */
export type BookingFulfillmentMode =
  | "worker_visits_customer"
  | "customer_visits_worker"
  | "remote";

/* ==============================================================
   VALID MODES
============================================================== */

export const BOOKING_FULFILLMENT_MODES =
  [
    "worker_visits_customer",
    "customer_visits_worker",
    "remote",
  ] as const satisfies readonly BookingFulfillmentMode[];

/* ==============================================================
   VALIDATION
============================================================== */

/**
 * Runtime validation for booking fulfillment.
 *
 * Use this before trusting values coming from:
 *
 * - route params
 * - Firestore
 * - external input
 * - form state
 */
export function isBookingFulfillmentMode(
  value: unknown,
): value is BookingFulfillmentMode {
  return (
    typeof value === "string" &&
    BOOKING_FULFILLMENT_MODES.some(
      mode => mode === value,
    )
  );
}

/* ==============================================================
   LOCATION REQUIREMENT
============================================================== */

/**
 * Returns true when the booking requires
 * a physical destination.
 *
 * worker_visits_customer:
 *   customer service location is required.
 *
 * customer_visits_worker:
 *   provider location is required.
 *
 * remote:
 *   no physical destination is required.
 */
export function bookingRequiresPhysicalLocation(
  mode: BookingFulfillmentMode,
): boolean {
  return mode !== "remote";
}