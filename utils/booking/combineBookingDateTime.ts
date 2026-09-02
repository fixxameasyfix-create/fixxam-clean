export default function combineBookingDateTime(
  date: Date,
  time: Date
): Date {

  const bookingDate =
    new Date(date);

  bookingDate.setHours(
    time.getHours(),
    time.getMinutes(),
    0,
    0
  );

  return bookingDate;

}