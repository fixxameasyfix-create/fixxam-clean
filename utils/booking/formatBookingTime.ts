export default function formatBookingTime(
  time: Date
): string {

  return time.toLocaleTimeString(
    [],
    {

      hour: "2-digit",

      minute: "2-digit",

      hour12: true,

    }
  );

}