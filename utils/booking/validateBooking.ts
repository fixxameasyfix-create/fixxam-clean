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

export type BookingValidationResult = {
  valid: boolean;
  message?: string;
};

export default function validateBooking(
  booking: Booking
): BookingValidationResult {
  if (!booking.date) {
    return {
      valid: false,
      message:
        "Please select a booking date.",
    };
  }

  if (!booking.time) {
    return {
      valid: false,
      message:
        "Please select a booking time.",
    };
  }

  if (!booking.address.trim()) {
    return {
      valid: false,
      message:
        "Please select your location or enter your address.",
    };
  }

  return {
    valid: true,
  };
}