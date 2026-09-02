import type {
  BookingOffer,
} from "@/firebase/queries/bookings/listenOffers";

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

export interface Booking {
  id: string;

  status: BookingStatus;

  lastOfferBy?: "customer" | "worker";

  offerPrice?: number;

  agreedPrice?: number;

  offerMessage?: string;

  estimatedArrival?: string;

  startedAt?: string;

  completedAt?: string;

  cancelledAt?: string;

  cancelledBy?: "customer" | "worker" | "admin";

  cancelReason?: string;

  workerName?: string;

  workerPhoto?: string;

  online?: boolean;

  rating?: number;

  serviceName?: string;

  bookingDate?: string;

  bookingTime?: string;

  address?: string;

  description?: string;

  photo?: string;

  amount?: number;

  paymentStatus?: string;
}

export interface Offer {
  id: string;

  amount: number;

  message: string;

  sender: "customer" | "worker";

  createdAt: string;

  status?: "pending" | "accepted" | "rejected";
}

export interface NegotiationStatusCardProps {
  booking: Booking;

  offers: BookingOffer[];

  onAccept: () => Promise<void>;

  onReject: () => Promise<void>;
}