/* ============================================================
   ARRIVAL TIME ESTIMATE

   Converts distance in kilometers into an estimated
   travel-time label.

   IMPORTANT:
   This is an estimate, not live Google Maps travel time.
============================================================ */

/*
 * Current approximation:
 *
 * 1 km ≈ 2 minutes
 *
 * This matches the existing Fixxam behavior.
 */
const MINUTES_PER_KM = 2;

/*
 * Very short distances should still display
 * a useful minimum arrival estimate.
 */
const MINIMUM_MINUTES = 2;

/* ============================================================
   VALIDATION
============================================================ */

function isValidDistance(
  distance: number,
): boolean {
  return (
    Number.isFinite(distance) &&
    distance >= 0
  );
}

/* ============================================================
   FORMAT MINUTES
============================================================ */

function formatMinutes(
  minutes: number,
): string {
  const safeMinutes =
    Math.max(
      MINIMUM_MINUTES,
      Math.round(minutes),
    );

  if (safeMinutes < 60) {
    return `${safeMinutes} mins away`;
  }

  /* ==========================================================
     HOURS + MINUTES
  ========================================================== */

  const hours =
    Math.floor(
      safeMinutes / 60,
    );

  const remainingMinutes =
    safeMinutes % 60;

  const hourLabel =
    `${hours} hr${
      hours === 1
        ? ''
        : 's'
    }`;

  if (
    remainingMinutes === 0
  ) {
    return `${hourLabel} away`;
  }

  return (
    `${hourLabel} ` +
    `${remainingMinutes} min${
      remainingMinutes === 1
        ? ''
        : 's'
    } away`
  );
}

/* ============================================================
   CALCULATE ARRIVAL TIME
============================================================ */

export function calculateArrivalTime(
  distance?: number | null,
): string {
  if (
    distance == null ||
    !isValidDistance(distance)
  ) {
    return '';
  }

  /*
   * Very close shop.
   *
   * Example:
   * 0.2 km -> 2 mins away
   * 0.7 km -> 2 mins away
   */
  if (distance < 1) {
    return `${MINIMUM_MINUTES} mins away`;
  }

  /*
   * Examples:
   *
   * 1.2 km -> 2 mins away
   * 1.5 km -> 3 mins away
   * 2.0 km -> 4 mins away
   * 5.0 km -> 10 mins away
   */
  const estimatedMinutes =
    distance *
    MINUTES_PER_KM;

  return formatMinutes(
    estimatedMinutes,
  );
}