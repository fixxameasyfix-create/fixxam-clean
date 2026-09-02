export const BOOKING_STATUS = {
  PENDING_ESTIMATE: "pending_estimate",
  NEGOTIATING: "negotiating",
  ACCEPTED: "accepted",
  ON_THE_WAY: "on_the_way",
  ARRIVED: "arrived",
  IN_PROGRESS: "in_progress",
  AWAITING_CASH: "awaiting_cash",
  PAYMENT_PENDING_CONFIRMATION:
    "payment_pending_confirmation",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const OPEN_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING_ESTIMATE,
  BOOKING_STATUS.NEGOTIATING,
];

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.ON_THE_WAY,
  BOOKING_STATUS.ARRIVED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.AWAITING_CASH,
  BOOKING_STATUS.PAYMENT_PENDING_CONFIRMATION,
];

export const CLOSED_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
];