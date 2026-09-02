import { useMemo } from "react";

import useBookingAnimation from "./useBookingAnimation";
import useBookingHaptics from "./useBookingHaptics";
import useBookingId from "./useBookingId";
import useBookingPrice from "./useBookingPrice";
import useBookingState from "./useBookingState";
import useBookingSubmit from "./useBookingSubmit";
import useBookingTimeline, {
  BookingStatus,
} from "./useBookingTimeLine";

type Booking = {
  date: Date;

  time: Date;

  locationType:
    | "current"
    | "manual";

  address: string;

  photos: string[];

  note: string;
};

type Props = {
  basePrice: number;

  status?: BookingStatus;

  onContinue: (
    booking: Booking
  ) => void;
};

export default function useBooking({
  basePrice,
  status = "pending_estimate",
  onContinue,
}: Props) {
  const state =
    useBookingState();

  const animation =
    useBookingAnimation();

  const haptics =
    useBookingHaptics();

  const bookingId =
    useBookingId();

  const price =
    useBookingPrice({
      basePrice,
    });

  const timeline =
    useBookingTimeline(
      status
    );

  const booking = useMemo<Booking>(
    () => ({
      date: state.date,
      time: state.time,
      locationType:
        state.locationType,
      address: state.address,
      photos: state.photos,
      note: state.note,
    }),
    [
      state.date,
      state.time,
      state.locationType,
      state.address,
      state.photos,
      state.note,
    ]
  );

  const submit =
    useBookingSubmit({
      booking,
      onContinue,
    });

  return useMemo(
    () => ({
      ...state,

      bookingId,

      price,

      timeline,

      animation,

      haptics,

      ...submit,
    }),
    [
      state,
      bookingId,
      price,
      timeline,
      animation,
      haptics,
      submit,
    ]
  );
}