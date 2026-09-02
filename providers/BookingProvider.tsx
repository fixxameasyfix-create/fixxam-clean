import React, {
  createContext,
  ReactNode,
  useContext,
} from "react";

import useBooking from "@/hooks/booking/useBooking";

import {
  BookingStatus,
} from "@/hooks/booking/useBookingTimeLine";

type BookingContextType =
  ReturnType<typeof useBooking> | null;

const BookingContext =
  createContext<BookingContextType>(null);

type Props = {
  children: ReactNode;

  basePrice: number;

  status?: BookingStatus;

  onContinue: (booking: {
    date: Date;
    time: Date;
    locationType:
      | "current"
      | "manual";
    address: string;
    photos: string[];
    note: string;
  }) => void;
};

export default function BookingProvider({
  children,
  basePrice,
  status = "pending_estimate",
  onContinue,
}: Props) {
  const booking = useBooking({
    basePrice,
    status,
    onContinue,
  });

  return (
    <BookingContext.Provider
      value={booking}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingProvider() {
  const context =
    useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBookingProvider must be used inside BookingProvider."
    );
  }

  return context;
}