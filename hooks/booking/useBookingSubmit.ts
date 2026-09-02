import {
  useCallback,
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import useBookingHaptics from "./useBookingHaptics";

import validateBooking from "@/utils/booking/validateBooking";

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
  booking: Booking;

  onContinue: (
    booking: Booking
  ) => void;
};

export default function useBookingSubmit({
  booking,
  onContinue,
}: Props) {
  const haptics =
    useBookingHaptics();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const submitBooking =
    useCallback(async () => {
      if (loading) {
        return;
      }

      setLoading(true);

      try {
        const result =
          validateBooking(
            booking
          );

        if (!result.valid) {
          await haptics.warning();

          Alert.alert(
            "Booking Error",
            result.message
          );

          return;
        }

        await haptics.success();

        onContinue(
          booking
        );
      } catch (error) {
        console.error(
          "Booking Submit Error:",
          error
        );

        Alert.alert(
          "Error",
          "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }, [
      booking,
      haptics,
      loading,
      onContinue,
    ]);

  return {
    loading,
    submitBooking,
  };
}