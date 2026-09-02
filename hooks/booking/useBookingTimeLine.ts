export type BookingStatus =
  | "pending_estimate"
  | "negotiating"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "awaiting_cash"
  | "payment_pending_confirmation"
  | "completed"
  | "cancelled";

export default function useBookingTimeline(
  status: BookingStatus,
) {
  return [
    {
      key: "pending_estimate",
      title: "Booking Sent",
      completed: status !== "pending_estimate",
    },

    {
      key: "negotiating",
      title: "Negotiation",
      completed: [
        "negotiating",
        "accepted",
        "on_the_way",
        "arrived",
        "in_progress",
        "awaiting_cash",
        "payment_pending_confirmation",
        "completed",
      ].includes(status),
    },

    {
      key: "accepted",
      title: "Offer Accepted",
      completed: [
        "accepted",
        "on_the_way",
        "arrived",
        "in_progress",
        "awaiting_cash",
        "payment_pending_confirmation",
        "completed",
      ].includes(status),
    },

    {
      key: "on_the_way",
      title: "On The Way",
      completed: [
        "on_the_way",
        "arrived",
        "in_progress",
        "awaiting_cash",
        "payment_pending_confirmation",
        "completed",
      ].includes(status),
    },

    {
      key: "in_progress",
      title: "In Progress",
      completed: [
        "in_progress",
        "awaiting_cash",
        "payment_pending_confirmation",
        "completed",
      ].includes(status),
    },

    {
      key: "awaiting_cash",
      title: "Awaiting Payment",
      completed: [
        "awaiting_cash",
        "payment_pending_confirmation",
        "completed",
      ].includes(status),
    },

    {
      key: "payment_pending_confirmation",
      title: "Payment Confirmation",
      completed: [
        "payment_pending_confirmation",
        "completed",
      ].includes(status),
    },

    {
      key: "completed",
      title: "Completed",
      completed: status === "completed",
    },
  ];
}