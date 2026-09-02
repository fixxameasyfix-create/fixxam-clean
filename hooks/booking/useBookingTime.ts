import { useMemo } from "react";

type Props = {
  value: Date;
};

export default function useBookingTime({
  value,
}: Props) {

  return useMemo(() => {

    const hour =
      value.getHours();

    const displayTime =
      new Intl.DateTimeFormat(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      ).format(value);

    let period = "";

    let badgeText = "";

    let badgeColor = "";

    let badgeBackground = "";

    let recommendation = "";

    if (hour >= 5 && hour < 12) {

      period = "Morning";

      badgeText = "Best Time";

      badgeColor = "#16A34A";

      badgeBackground = "#F0FDF4";

      recommendation =
        "Morning bookings usually receive the fastest worker response.";

    } else if (
      hour >= 12 &&
      hour < 17
    ) {

      period = "Afternoon";

      badgeText = "Recommended";

      badgeColor = "#2563EB";

      badgeBackground = "#EFF6FF";

      recommendation =
        "Afternoon offers the highest worker availability.";

    } else if (
      hour >= 17 &&
      hour < 21
    ) {

      period = "Evening";

      badgeText = "Busy Hours";

      badgeColor = "#EA580C";

      badgeBackground = "#FFF7ED";

      recommendation =
        "Evening is busier. Book early for faster acceptance.";

    } else {

      period = "Night";

      badgeText = "Limited";

      badgeColor = "#7C3AED";

      badgeBackground = "#F5F3FF";

      recommendation =
        "Night bookings may take longer to assign a worker.";

    }

    return {

      displayTime,

      period,

      badgeText,

      badgeColor,

      badgeBackground,

      recommendation,

    };

  }, [value]);

}