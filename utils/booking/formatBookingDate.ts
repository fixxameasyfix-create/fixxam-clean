export default function formatBookingDate(
  date: Date
): string {

  return date.toLocaleDateString(
    "en-GB",
    {

      weekday: "short",

      day: "numeric",

      month: "short",

      year: "numeric",

    }
  );

}