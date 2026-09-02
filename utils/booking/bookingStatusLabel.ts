import type { BookingStatus } from "@/hooks/booking/useBookingTimeLine";

export default function bookingStatusLabel(
  status: BookingStatus,
): string {
  switch (status) {
    case "pending_estimate":
      return "Pending";

    case "negotiating":
      return "Negotiating";

    case "accepted":
      return "Accepted";

    case "on_the_way":
      return "On The Way";

    case "arrived":
      return "Worker Arrived";

    case "in_progress":
      return "Work In Progress";

    case "awaiting_cash":
      return "Awaiting Payment";

    case "payment_pending_confirmation":
      return "Payment Confirmation";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return "Unknown";
  }
}