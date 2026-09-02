import type { Ionicons } from "@expo/vector-icons";

export type OrderStatus =
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

export type OrderStatusConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  textColor: string;
};

export const ORDER_STATUS: Record<
  OrderStatus,
  OrderStatusConfig
> = {
  pending_estimate: {
    label: "Waiting Estimate",
    icon: "time-outline",
    backgroundColor: "#FEF3C7",
    textColor: "#B45309",
  },

  negotiating: {
    label: "Negotiating",
    icon: "swap-horizontal-outline",
    backgroundColor: "#FFEDD5",
    textColor: "#EA580C",
  },

  accepted: {
    label: "Accepted",
    icon: "checkmark-circle-outline",
    backgroundColor: "#DBEAFE",
    textColor: "#2563EB",
  },

  on_the_way: {
    label: "On the Way",
    icon: "car-outline",
    backgroundColor: "#DBEAFE",
    textColor: "#2563EB",
  },

  arrived: {
    label: "Arrived",
    icon: "location-outline",
    backgroundColor: "#E0F2FE",
    textColor: "#0284C7",
  },

  in_progress: {
    label: "In Progress",
    icon: "construct-outline",
    backgroundColor: "#DBEAFE",
    textColor: "#2563EB",
  },

  awaiting_cash: {
    label: "Awaiting Payment",
    icon: "cash-outline",
    backgroundColor: "#FEF3C7",
    textColor: "#B45309",
  },

  payment_pending_confirmation: {
    label: "Payment Review",
    icon: "card-outline",
    backgroundColor: "#EDE9FE",
    textColor: "#7C3AED",
  },

  completed: {
    label: "Completed",
    icon: "checkmark-done-circle-outline",
    backgroundColor: "#DCFCE7",
    textColor: "#15803D",
  },

  cancelled: {
    label: "Cancelled",
    icon: "close-circle-outline",
    backgroundColor: "#FEE2E2",
    textColor: "#DC2626",
  },
};

export function getOrderStatus(
  status: string
): OrderStatusConfig {
  return (
    ORDER_STATUS[
      status as OrderStatus
    ] ?? {
      label: status,
      icon: "help-circle-outline",
      backgroundColor: "#F1F5F9",
      textColor: "#64748B",
    }
  );
}