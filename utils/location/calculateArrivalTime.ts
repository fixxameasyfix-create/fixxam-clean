export function calculateArrivalTime(distance?: number) {
  if (distance == null) return "";

  if (distance < 1) {
    return "2 mins away";
  }

  const minutes = Math.round(distance * 2);

  if (minutes < 60) {
    return `${minutes} mins away`;
  }

  const hours = Math.round(minutes / 60);

  return `${hours} hr${hours > 1 ? "s" : ""} away`;
}