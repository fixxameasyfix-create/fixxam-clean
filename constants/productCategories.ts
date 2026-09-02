export const PRODUCT_CATEGORIES = [

  "Plumbing",

  "Electrical",

  "Building Materials",

  "Paint",

  "Tools",

  "Furniture",

  "Home Appliances",

  "Automotive Parts",

  "Cleaning Supplies",

  "Safety Equipment",

  "Gardening",

  "Roofing",

  "Tiles",

  "Doors & Windows",

  "Kitchen",

  "Bathroom",

  "Air Conditioning",

  "Solar",

  "Water Tanks",

  "Others",

] as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[number];