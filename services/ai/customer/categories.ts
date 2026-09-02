export const CUSTOMER_SERVICE_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Air Conditioning",
  "Generator",
  "Solar",
  "Appliance Repair",
  "Carpentry",
  "Painting",
  "Masonry",
  "Roofing",
  "Tiling",
  "POP Ceiling",
  "Cleaning",
  "Pest Control",
  "Furniture Assembly",
  "Moving Service",
  "Auto Mechanic",
  "Welding",
  "Glass & Aluminium",
  "Borehole",
  "CCTV & Security",
  "Internet & Networking",
  "Smart Home",
] as const;

export type CustomerServiceCategory =
  (typeof CUSTOMER_SERVICE_CATEGORIES)[number];