/* ============================================================
   DISTANCE UTILITIES

   Calculates straight-line distance between two coordinates
   using the Haversine formula.

   Result is returned in kilometers.
============================================================ */

const EARTH_RADIUS_KM = 6371;

/* ============================================================
   VALIDATION
============================================================ */

function isValidLatitude(
  value: number,
): boolean {
  return (
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: number,
): boolean {
  return (
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

/* ============================================================
   RADIANS
============================================================ */

function toRadians(
  value: number,
): number {
  return (
    value *
    (Math.PI / 180)
  );
}

/* ============================================================
   CALCULATE DISTANCE
============================================================ */

export function calculateDistance(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
): number {
  /*
   * Reject invalid coordinates.
   *
   * Returning 0 keeps the UI safe,
   * while callers can treat 0 as
   * distance unavailable when needed.
   */
  if (
    !isValidLatitude(
      startLatitude,
    ) ||
    !isValidLongitude(
      startLongitude,
    ) ||
    !isValidLatitude(
      endLatitude,
    ) ||
    !isValidLongitude(
      endLongitude,
    )
  ) {
    return 0;
  }

  /* ==========================================================
     DIFFERENCE BETWEEN COORDINATES
  ========================================================== */

  const latitudeDifference =
    toRadians(
      endLatitude -
        startLatitude,
    );

  const longitudeDifference =
    toRadians(
      endLongitude -
        startLongitude,
    );

  const startLatitudeRadians =
    toRadians(
      startLatitude,
    );

  const endLatitudeRadians =
    toRadians(
      endLatitude,
    );

  /* ==========================================================
     HAVERSINE FORMULA
  ========================================================== */

  const sinLatitude =
    Math.sin(
      latitudeDifference / 2,
    );

  const sinLongitude =
    Math.sin(
      longitudeDifference / 2,
    );

  const haversine =
    sinLatitude *
      sinLatitude +
    Math.cos(
      startLatitudeRadians,
    ) *
      Math.cos(
        endLatitudeRadians,
      ) *
      sinLongitude *
      sinLongitude;

  /*
   * Floating-point calculations can very rarely
   * produce a value slightly outside 0..1.
   *
   * Clamp it before sqrt() to prevent NaN.
   */
  const normalizedHaversine =
    Math.min(
      1,
      Math.max(
        0,
        haversine,
      ),
    );

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(
        normalizedHaversine,
      ),
      Math.sqrt(
        1 -
          normalizedHaversine,
      ),
    );

  /* ==========================================================
     DISTANCE IN KILOMETERS
  ========================================================== */

  const distanceKm =
    EARTH_RADIUS_KM *
    angularDistance;

  /*
   * Keep one decimal place:
   *
   * 0.4 km
   * 1.2 km
   * 12.7 km
   */
  return Number(
    distanceKm.toFixed(1),
  );
}