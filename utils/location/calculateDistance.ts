export function calculateDistance(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
): number {
  const toRadians = (value: number) =>
    (value * Math.PI) / 180;

  const earthRadius = 6371; // km

  const dLat = toRadians(
    endLatitude - startLatitude,
  );

  const dLon = toRadians(
    endLongitude - startLongitude,
  );

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(toRadians(startLatitude)) *
      Math.cos(toRadians(endLatitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return Number(
    (earthRadius * c).toFixed(1),
  );
}