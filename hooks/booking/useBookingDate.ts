import { useMemo } from "react";

type Props = {
  value: Date;
};

export default function useBookingDate({
  value,
}: Props) {

  return useMemo(() => {

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    const selected =
      new Date(value);

    selected.setHours(
      0,
      0,
      0,
      0
    );

    const isToday =
      selected.getTime() ===
      today.getTime();

    const isTomorrow =
      selected.getTime() ===
      tomorrow.getTime();

    const formattedDate =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ).format(selected);

    const displayDate =
      isToday
        ? "Today"
        : isTomorrow
        ? "Tomorrow"
        : formattedDate;

    const diffInDays =
      Math.max(
        0,
        Math.ceil(
          (selected.getTime() -
            today.getTime()) /
            86400000
        )
      );

    const badgeText =
      diffInDays === 0
        ? "Today"
        : diffInDays === 1
        ? "Tomorrow"
        : diffInDays < 7
        ? `In ${diffInDays} days`
        : diffInDays < 30
        ? `In ${Math.ceil(
            diffInDays / 7
          )} weeks`
        : `In ${Math.ceil(
            diffInDays / 30
          )} months`;

    const badgeColor =
      diffInDays <= 1
        ? "#EA580C"
        : diffInDays < 7
        ? "#2563EB"
        : "#16A34A";

    const badgeBackground =
      diffInDays <= 1
        ? "#FFF7ED"
        : diffInDays < 7
        ? "#EFF6FF"
        : "#F0FDF4";

    return {

      today,

      isToday,

      isTomorrow,

      formattedDate,

      displayDate,

      diffInDays,

      badgeText,

      badgeColor,

      badgeBackground,

    };

  }, [value]);

}