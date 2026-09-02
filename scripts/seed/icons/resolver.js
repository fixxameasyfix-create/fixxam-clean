module.exports = function resolveServiceIcon(
  serviceId,
  subcategoryIcon,
  categoryIcon,
  defaultIcon
) {

  const id = serviceId.toLowerCase();

  // Air Conditioning
  if (id.includes("ac"))
    return {
      icon: "air-conditioner",
      color: "#06B6D4",
      backgroundColor: "#CFFAFE",
    };

  // Computer
  if (
    id.includes("computer") ||
    id.includes("laptop") ||
    id.includes("desktop")
  )
    return {
      icon: "laptop",
      color: "#2563EB",
      backgroundColor: "#DBEAFE",
    };

  // Phone
  if (
    id.includes("phone") ||
    id.includes("mobile")
  )
    return {
      icon: "cellphone",
      color: "#22C55E",
      backgroundColor: "#DCFCE7",
    };

  // Camera
  if (id.includes("camera"))
    return {
      icon: "camera",
      color: "#8B5CF6",
      backgroundColor: "#EDE9FE",
    };

  // Battery
  if (id.includes("battery"))
    return {
      icon: "battery",
      color: "#22C55E",
      backgroundColor: "#DCFCE7",
    };

  // Generator
  if (id.includes("generator"))
    return {
      icon: "engine",
      color: "#EA580C",
      backgroundColor: "#FFEDD5",
    };

  // Solar
  if (id.includes("solar"))
    return {
      icon: "solar-power",
      color: "#FACC15",
      backgroundColor: "#FEF9C3",
    };

  // Roof
  if (id.includes("roof"))
    return {
      icon: "home-roof",
      color: "#DC2626",
      backgroundColor: "#FEE2E2",
    };

  // Painting
  if (id.includes("paint"))
    return {
      icon: "brush",
      color: "#F97316",
      backgroundColor: "#FFEDD5",
    };

  // Plumbing
  if (
    id.includes("pipe") ||
    id.includes("plumb")
  )
    return {
      icon: "pipe-wrench",
      color: "#0EA5E9",
      backgroundColor: "#DBEAFE",
    };

  // Electrical
  if (
    id.includes("electrical") ||
    id.includes("wiring")
  )
    return {
      icon: "lightning-bolt",
      color: "#FACC15",
      backgroundColor: "#FEF9C3",
    };

  // Welding
  if (id.includes("weld"))
    return {
      icon: "welding",
      color: "#EA580C",
      backgroundColor: "#FFEDD5",
    };

  // Cleaning
  if (id.includes("clean"))
    return {
      icon: "spray-bottle",
      color: "#10B981",
      backgroundColor: "#DCFCE7",
    };

  // Default fallbacks
  return (
    subcategoryIcon ||
    categoryIcon ||
    defaultIcon
  );
};