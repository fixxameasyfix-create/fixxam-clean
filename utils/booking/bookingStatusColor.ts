import type { BookingStatus } from "@/types/booking";

/* ============================================================
   BOOKING STATUS COLOR
============================================================ */

export default function bookingStatusColor(
  status: BookingStatus,
): string {
  switch (status) {
    case "pending":
      return "#F59E0B";

    case "accepted":
      return "#3B82F6";

    case "in-progress":
      return "#2563EB";

    case "completed":
      return "#22C55E";

    case "cancelled":
      return "#EF4444";

    case "expired":
      return "#94A3B8";

    default: {
      const exhaustiveCheck: never = status;
      return exhaustiveCheck;
    }
  }
}