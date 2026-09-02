import { BOOKING } from "./bookingConstants";

export default function calculateUrgentFee(
  urgent: boolean
): number {

  return urgent
    ? BOOKING.URGENT_FEE
    : 0;

}