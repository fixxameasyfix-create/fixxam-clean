/* ==============================================================
   BOOKING PRIORITY TYPES
============================================================== */

export type BookingPriority =
  | "immediate"
  | "normal"
  | "urgent";

export const BOOKING_PRIORITIES =
  [
    "immediate",
    "normal",
    "urgent",
  ] as const satisfies readonly BookingPriority[];

export function isBookingPriority(
  value: unknown,
): value is BookingPriority {
  return (
    typeof value === "string" &&
    BOOKING_PRIORITIES.some(
      priority =>
        priority === value,
    )
  );
}