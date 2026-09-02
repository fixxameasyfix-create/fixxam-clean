export function formatBookingDate(
  value: string,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export function formatBookingTime(
  value: string,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function calculateBookingTotal(
  serviceFee: number | string,
  urgentFee: number | string,
  urgent: boolean,
) {
  const base = Number(serviceFee) || 0;

  const extra = urgent
    ? Number(urgentFee) || 0
    : 0;

  return {
    serviceFee: base,
    urgentFee: extra,
    total: base + extra,
  };
}