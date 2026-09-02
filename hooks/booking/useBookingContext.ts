import { useBookingProvider } from "@/providers/BookingProvider";

export default function useBookingContext() {
  return useBookingProvider();
}