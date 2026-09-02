export default function formatBookingId(
  bookingId: string
): string {

  return bookingId
    .trim()
    .toUpperCase();

}