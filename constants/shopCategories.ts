import type {
  ComponentProps,
} from "react";

import type {
  Ionicons,
} from "@expo/vector-icons";

/* ==============================================================
   TYPES
============================================================== */

export type ShopCategoryIcon =
  ComponentProps<typeof Ionicons>["name"];

export type ShopCategoryGroup =
  | "vehicle"
  | "electronics"
  | "home"
  | "construction"
  | "power"
  | "cleaning"
  | "fashion"
  | "beauty"
  | "food"
  | "events"
  | "technology"
  | "security"
  | "business"
  | "property"
  | "agriculture"
  | "health"
  | "logistics";

export type ShopCategory = {
  id: string;

  label: string;

  icon: ShopCategoryIcon;

  group: ShopCategoryGroup;

  /**
   * Smaller number = shown earlier.
   *
   * This allows popular categories to appear first
   * without relying on array position throughout the app.
   */
  priority: number;
};

/* ==============================================================
   SHOP CATEGORIES

   Shared source of truth for:
   - Create My Shop
   - Find a Shop
   - Shop filters
   - Shop search
   - Shop category display

   IMPORTANT:
   `id` is the stable value stored in Firestore.
   Do not rename IDs after shops start using them
   without a migration.
============================================================== */

export const SHOP_CATEGORIES = [
  /* ============================================================
     MOST REQUESTED / HOME SERVICES
  ============================================================ */

  {
    id: "plumbing",
    label: "Plumbing",
    icon: "water-outline",
    group: "home",
    priority: 1,
  },

  {
    id: "electrical-repair",
    label: "Electrical Repair",
    icon: "flash-outline",
    group: "home",
    priority: 2,
  },

  {
    id: "phone-repair",
    label: "Phone Repair",
    icon: "phone-portrait-outline",
    group: "electronics",
    priority: 3,
  },

  {
    id: "car-repair",
    label: "Car Repair",
    icon: "car-sport-outline",
    group: "vehicle",
    priority: 4,
  },

  {
    id: "ac-repair",
    label: "AC Repair",
    icon: "snow-outline",
    group: "home",
    priority: 5,
  },

  {
    id: "generator-repair",
    label: "Generator Repair",
    icon: "settings-outline",
    group: "power",
    priority: 6,
  },

  {
    id: "solar-installation",
    label: "Solar Installation",
    icon: "sunny-outline",
    group: "power",
    priority: 7,
  },

  {
    id: "appliance-repair",
    label: "Appliance Repair",
    icon: "construct-outline",
    group: "electronics",
    priority: 8,
  },

  {
    id: "computer-repair",
    label: "Computer Repair",
    icon: "laptop-outline",
    group: "electronics",
    priority: 9,
  },

  {
    id: "tailoring",
    label: "Tailoring",
    icon: "shirt-outline",
    group: "fashion",
    priority: 10,
  },

  {
    id: "cleaning-services",
    label: "Cleaning Services",
    icon: "sparkles-outline",
    group: "cleaning",
    priority: 11,
  },

  {
    id: "carpentry",
    label: "Carpentry",
    icon: "hammer-outline",
    group: "construction",
    priority: 12,
  },

  {
    id: "house-painting",
    label: "House Painting",
    icon: "color-palette-outline",
    group: "construction",
    priority: 13,
  },

  {
    id: "welding",
    label: "Welding",
    icon: "construct-outline",
    group: "construction",
    priority: 14,
  },

  {
    id: "refrigerator-repair",
    label: "Refrigerator Repair",
    icon: "snow-outline",
    group: "electronics",
    priority: 15,
  },

  {
    id: "barbing",
    label: "Barbing",
    icon: "cut-outline",
    group: "beauty",
    priority: 16,
  },

  {
    id: "hairdressing",
    label: "Hairdressing",
    icon: "cut-outline",
    group: "beauty",
    priority: 17,
  },

  {
    id: "laundry",
    label: "Laundry",
    icon: "shirt-outline",
    group: "cleaning",
    priority: 18,
  },

  {
    id: "pest-control",
    label: "Pest Control",
    icon: "bug-outline",
    group: "cleaning",
    priority: 19,
  },

  {
    id: "cctv-installation",
    label: "CCTV Installation",
    icon: "videocam-outline",
    group: "security",
    priority: 20,
  },

  /* ============================================================
     VEHICLE SERVICES
  ============================================================ */

  {
    id: "auto-mechanic",
    label: "Auto Mechanic",
    icon: "car-sport-outline",
    group: "vehicle",
    priority: 21,
  },

  {
    id: "auto-electrician",
    label: "Auto Electrician",
    icon: "flash-outline",
    group: "vehicle",
    priority: 22,
  },

  {
    id: "car-diagnostics",
    label: "Car Diagnostics",
    icon: "speedometer-outline",
    group: "vehicle",
    priority: 23,
  },

  {
    id: "car-ac-repair",
    label: "Car AC Repair",
    icon: "snow-outline",
    group: "vehicle",
    priority: 24,
  },

  {
    id: "brake-repair",
    label: "Brake Repair",
    icon: "construct-outline",
    group: "vehicle",
    priority: 25,
  },

  {
    id: "engine-repair",
    label: "Engine Repair",
    icon: "settings-outline",
    group: "vehicle",
    priority: 26,
  },

  {
    id: "gearbox-repair",
    label: "Gearbox Repair",
    icon: "settings-outline",
    group: "vehicle",
    priority: 27,
  },

  {
    id: "tyre-repair",
    label: "Tyre Repair",
    icon: "ellipse-outline",
    group: "vehicle",
    priority: 28,
  },

  {
    id: "wheel-alignment",
    label: "Wheel Alignment",
    icon: "git-compare-outline",
    group: "vehicle",
    priority: 29,
  },

  {
    id: "vulcanizing",
    label: "Vulcanizing",
    icon: "ellipse-outline",
    group: "vehicle",
    priority: 30,
  },

  {
    id: "panel-beating",
    label: "Panel Beating",
    icon: "hammer-outline",
    group: "vehicle",
    priority: 31,
  },

  {
    id: "car-painting",
    label: "Car Painting",
    icon: "color-palette-outline",
    group: "vehicle",
    priority: 32,
  },

  {
    id: "car-wash",
    label: "Car Wash",
    icon: "water-outline",
    group: "vehicle",
    priority: 33,
  },

  {
    id: "car-detailing",
    label: "Car Detailing",
    icon: "sparkles-outline",
    group: "vehicle",
    priority: 34,
  },

  {
    id: "motorcycle-repair",
    label: "Motorcycle Repair",
    icon: "bicycle-outline",
    group: "vehicle",
    priority: 35,
  },

  {
    id: "car-battery-service",
    label: "Car Battery Service",
    icon: "battery-charging-outline",
    group: "vehicle",
    priority: 36,
  },

  /* ============================================================
     PHONE / ELECTRONICS / DEVICES
  ============================================================ */

  {
    id: "tablet-repair",
    label: "Tablet Repair",
    icon: "tablet-portrait-outline",
    group: "electronics",
    priority: 37,
  },

  {
    id: "phone-screen-repair",
    label: "Phone Screen Repair",
    icon: "phone-portrait-outline",
    group: "electronics",
    priority: 38,
  },

  {
    id: "phone-battery-repair",
    label: "Phone Battery Replacement",
    icon: "battery-charging-outline",
    group: "electronics",
    priority: 39,
  },

  {
    id: "charging-port-repair",
    label: "Charging Port Repair",
    icon: "flash-outline",
    group: "electronics",
    priority: 40,
  },

  {
    id: "laptop-repair",
    label: "Laptop Repair",
    icon: "laptop-outline",
    group: "electronics",
    priority: 41,
  },

  {
    id: "desktop-repair",
    label: "Desktop Computer Repair",
    icon: "desktop-outline",
    group: "electronics",
    priority: 42,
  },

  {
    id: "printer-repair",
    label: "Printer Repair",
    icon: "print-outline",
    group: "electronics",
    priority: 43,
  },

  {
    id: "photocopier-repair",
    label: "Photocopier Repair",
    icon: "copy-outline",
    group: "electronics",
    priority: 44,
  },

  {
    id: "tv-repair",
    label: "TV Repair",
    icon: "tv-outline",
    group: "electronics",
    priority: 45,
  },

  {
    id: "decoder-repair",
    label: "Decoder Repair",
    icon: "tv-outline",
    group: "electronics",
    priority: 46,
  },

  {
    id: "satellite-installation",
    label: "Satellite & Dish Installation",
    icon: "radio-outline",
    group: "electronics",
    priority: 47,
  },

  {
    id: "washing-machine-repair",
    label: "Washing Machine Repair",
    icon: "construct-outline",
    group: "electronics",
    priority: 48,
  },

  {
    id: "microwave-repair",
    label: "Microwave Repair",
    icon: "construct-outline",
    group: "electronics",
    priority: 49,
  },

  {
    id: "electric-cooker-repair",
    label: "Electric Cooker Repair",
    icon: "construct-outline",
    group: "electronics",
    priority: 50,
  },

  {
    id: "water-dispenser-repair",
    label: "Water Dispenser Repair",
    icon: "water-outline",
    group: "electronics",
    priority: 51,
  },

  {
    id: "sound-system-repair",
    label: "Sound System Repair",
    icon: "volume-high-outline",
    group: "electronics",
    priority: 52,
  },

  {
    id: "electronics-repair",
    label: "General Electronics Repair",
    icon: "hardware-chip-outline",
    group: "electronics",
    priority: 53,
  },

  /* ============================================================
     POWER / ELECTRICAL
  ============================================================ */

  {
    id: "house-wiring",
    label: "House Wiring",
    icon: "flash-outline",
    group: "power",
    priority: 54,
  },

  {
    id: "electrical-installation",
    label: "Electrical Installation",
    icon: "flash-outline",
    group: "power",
    priority: 55,
  },

  {
    id: "inverter-installation",
    label: "Inverter Installation",
    icon: "battery-charging-outline",
    group: "power",
    priority: 56,
  },

  {
    id: "inverter-repair",
    label: "Inverter Repair",
    icon: "battery-charging-outline",
    group: "power",
    priority: 57,
  },

  {
    id: "solar-repair",
    label: "Solar System Repair",
    icon: "sunny-outline",
    group: "power",
    priority: 58,
  },

  {
    id: "solar-battery-service",
    label: "Solar Battery Service",
    icon: "battery-charging-outline",
    group: "power",
    priority: 59,
  },

  {
    id: "generator-installation",
    label: "Generator Installation",
    icon: "settings-outline",
    group: "power",
    priority: 60,
  },

  /* ============================================================
     HOME / PLUMBING / COOLING
  ============================================================ */

  {
    id: "pipe-repair",
    label: "Pipe Repair",
    icon: "water-outline",
    group: "home",
    priority: 61,
  },

  {
    id: "drain-unblocking",
    label: "Drain Unblocking",
    icon: "water-outline",
    group: "home",
    priority: 62,
  },

  {
    id: "toilet-repair",
    label: "Toilet Repair",
    icon: "water-outline",
    group: "home",
    priority: 63,
  },

  {
    id: "water-pump-repair",
    label: "Water Pump Repair",
    icon: "water-outline",
    group: "home",
    priority: 64,
  },

  {
    id: "borehole-service",
    label: "Borehole Service",
    icon: "water-outline",
    group: "home",
    priority: 65,
  },

  {
    id: "water-tank-installation",
    label: "Water Tank Installation",
    icon: "water-outline",
    group: "home",
    priority: 66,
  },

  {
    id: "ac-installation",
    label: "AC Installation",
    icon: "snow-outline",
    group: "home",
    priority: 67,
  },

  {
    id: "ac-servicing",
    label: "AC Servicing",
    icon: "snow-outline",
    group: "home",
    priority: 68,
  },

  {
    id: "freezer-repair",
    label: "Freezer Repair",
    icon: "snow-outline",
    group: "home",
    priority: 69,
  },

  /* ============================================================
     BUILDING / CONSTRUCTION
  ============================================================ */

  {
    id: "building-construction",
    label: "Building Construction",
    icon: "business-outline",
    group: "construction",
    priority: 70,
  },

  {
    id: "masonry",
    label: "Masonry",
    icon: "business-outline",
    group: "construction",
    priority: 71,
  },

  {
    id: "bricklaying",
    label: "Bricklaying",
    icon: "business-outline",
    group: "construction",
    priority: 72,
  },

  {
    id: "roofing",
    label: "Roofing",
    icon: "home-outline",
    group: "construction",
    priority: 73,
  },

  {
    id: "tiling",
    label: "Tiling",
    icon: "grid-outline",
    group: "construction",
    priority: 74,
  },

  {
    id: "flooring",
    label: "Flooring",
    icon: "grid-outline",
    group: "construction",
    priority: 75,
  },

  {
    id: "pop-ceiling",
    label: "POP Ceiling",
    icon: "layers-outline",
    group: "construction",
    priority: 76,
  },

  {
    id: "interlocking",
    label: "Interlocking",
    icon: "grid-outline",
    group: "construction",
    priority: 77,
  },

  {
    id: "glasswork",
    label: "Glasswork",
    icon: "apps-outline",
    group: "construction",
    priority: 78,
  },

  {
    id: "aluminium-work",
    label: "Aluminium Work",
    icon: "apps-outline",
    group: "construction",
    priority: 79,
  },

  {
    id: "window-installation",
    label: "Window Installation",
    icon: "apps-outline",
    group: "construction",
    priority: 80,
  },

  {
    id: "door-installation",
    label: "Door Installation",
    icon: "home-outline",
    group: "construction",
    priority: 81,
  },

  {
    id: "gate-fabrication",
    label: "Gate Fabrication",
    icon: "construct-outline",
    group: "construction",
    priority: 82,
  },

  {
    id: "furniture-making",
    label: "Furniture Making",
    icon: "hammer-outline",
    group: "construction",
    priority: 83,
  },

  {
    id: "furniture-repair",
    label: "Furniture Repair",
    icon: "hammer-outline",
    group: "construction",
    priority: 84,
  },

  {
    id: "upholstery",
    label: "Upholstery",
    icon: "bed-outline",
    group: "construction",
    priority: 85,
  },

  {
    id: "interior-decoration",
    label: "Interior Decoration",
    icon: "color-palette-outline",
    group: "construction",
    priority: 86,
  },

  {
    id: "waterproofing",
    label: "Waterproofing",
    icon: "water-outline",
    group: "construction",
    priority: 87,
  },

  /* ============================================================
     CLEANING / PROPERTY CARE
  ============================================================ */

  {
    id: "house-cleaning",
    label: "House Cleaning",
    icon: "sparkles-outline",
    group: "cleaning",
    priority: 88,
  },

  {
    id: "office-cleaning",
    label: "Office Cleaning",
    icon: "business-outline",
    group: "cleaning",
    priority: 89,
  },

  {
    id: "deep-cleaning",
    label: "Deep Cleaning",
    icon: "sparkles-outline",
    group: "cleaning",
    priority: 90,
  },

  {
    id: "post-construction-cleaning",
    label: "Post Construction Cleaning",
    icon: "sparkles-outline",
    group: "cleaning",
    priority: 91,
  },

  {
    id: "fumigation",
    label: "Fumigation",
    icon: "bug-outline",
    group: "cleaning",
    priority: 92,
  },

  {
    id: "dry-cleaning",
    label: "Dry Cleaning",
    icon: "shirt-outline",
    group: "cleaning",
    priority: 93,
  },

  {
    id: "carpet-cleaning",
    label: "Carpet Cleaning",
    icon: "sparkles-outline",
    group: "cleaning",
    priority: 94,
  },

  {
    id: "sofa-cleaning",
    label: "Sofa Cleaning",
    icon: "sparkles-outline",
    group: "cleaning",
    priority: 95,
  },

  {
    id: "waste-disposal",
    label: "Waste Disposal",
    icon: "trash-outline",
    group: "cleaning",
    priority: 96,
  },

  {
    id: "gardening",
    label: "Gardening",
    icon: "leaf-outline",
    group: "home",
    priority: 97,
  },

  {
    id: "landscaping",
    label: "Landscaping",
    icon: "leaf-outline",
    group: "home",
    priority: 98,
  },

  /* ============================================================
     FASHION / BEAUTY
  ============================================================ */

  {
    id: "fashion-design",
    label: "Fashion Design",
    icon: "shirt-outline",
    group: "fashion",
    priority: 99,
  },

  {
    id: "clothing-alteration",
    label: "Clothing Alteration",
    icon: "shirt-outline",
    group: "fashion",
    priority: 100,
  },

  {
    id: "shoe-repair",
    label: "Shoe Repair",
    icon: "footsteps-outline",
    group: "fashion",
    priority: 101,
  },

  {
    id: "leather-work",
    label: "Leather Work",
    icon: "briefcase-outline",
    group: "fashion",
    priority: 102,
  },

  {
    id: "makeup",
    label: "Makeup",
    icon: "color-palette-outline",
    group: "beauty",
    priority: 103,
  },

  {
    id: "nail-care",
    label: "Nail Care",
    icon: "sparkles-outline",
    group: "beauty",
    priority: 104,
  },

  {
    id: "braiding",
    label: "Hair Braiding",
    icon: "cut-outline",
    group: "beauty",
    priority: 105,
  },

  {
    id: "wig-installation",
    label: "Wig Installation",
    icon: "cut-outline",
    group: "beauty",
    priority: 106,
  },

  {
    id: "spa-services",
    label: "Spa Services",
    icon: "flower-outline",
    group: "beauty",
    priority: 107,
  },

  {
    id: "massage",
    label: "Massage",
    icon: "body-outline",
    group: "beauty",
    priority: 108,
  },

  /* ============================================================
     FOOD / EVENTS / MEDIA
  ============================================================ */

  {
    id: "catering",
    label: "Catering",
    icon: "restaurant-outline",
    group: "food",
    priority: 109,
  },

  {
    id: "baking",
    label: "Baking & Cakes",
    icon: "restaurant-outline",
    group: "food",
    priority: 110,
  },

  {
    id: "event-planning",
    label: "Event Planning",
    icon: "calendar-outline",
    group: "events",
    priority: 111,
  },

  {
    id: "event-decoration",
    label: "Event Decoration",
    icon: "balloon-outline",
    group: "events",
    priority: 112,
  },

  {
    id: "dj-services",
    label: "DJ Services",
    icon: "musical-notes-outline",
    group: "events",
    priority: 113,
  },

  {
    id: "mc-services",
    label: "MC Services",
    icon: "mic-outline",
    group: "events",
    priority: 114,
  },

  {
    id: "photography",
    label: "Photography",
    icon: "camera-outline",
    group: "events",
    priority: 115,
  },

  {
    id: "videography",
    label: "Videography",
    icon: "videocam-outline",
    group: "events",
    priority: 116,
  },

  {
    id: "printing",
    label: "Printing",
    icon: "print-outline",
    group: "business",
    priority: 117,
  },

  {
    id: "branding",
    label: "Branding",
    icon: "brush-outline",
    group: "business",
    priority: 118,
  },

  {
    id: "graphic-design",
    label: "Graphic Design",
    icon: "color-palette-outline",
    group: "technology",
    priority: 119,
  },

  /* ============================================================
     TECHNOLOGY / BUSINESS
  ============================================================ */

  {
    id: "internet-installation",
    label: "Internet Installation",
    icon: "wifi-outline",
    group: "technology",
    priority: 120,
  },

  {
    id: "networking",
    label: "Computer Networking",
    icon: "wifi-outline",
    group: "technology",
    priority: 121,
  },

  {
    id: "data-recovery",
    label: "Data Recovery",
    icon: "server-outline",
    group: "technology",
    priority: 122,
  },

  {
    id: "software-installation",
    label: "Software Installation",
    icon: "code-slash-outline",
    group: "technology",
    priority: 123,
  },

  {
    id: "website-development",
    label: "Website Development",
    icon: "globe-outline",
    group: "technology",
    priority: 124,
  },

  {
    id: "mobile-app-development",
    label: "Mobile App Development",
    icon: "phone-portrait-outline",
    group: "technology",
    priority: 125,
  },

  {
    id: "pos-repair",
    label: "POS Repair",
    icon: "card-outline",
    group: "electronics",
    priority: 126,
  },

  {
    id: "accounting",
    label: "Accounting",
    icon: "calculator-outline",
    group: "business",
    priority: 127,
  },

  {
    id: "bookkeeping",
    label: "Bookkeeping",
    icon: "book-outline",
    group: "business",
    priority: 128,
  },

  {
    id: "business-consulting",
    label: "Business Consulting",
    icon: "briefcase-outline",
    group: "business",
    priority: 129,
  },

  /* ============================================================
     SECURITY / PROPERTY
  ============================================================ */

  {
    id: "security-services",
    label: "Security Services",
    icon: "shield-checkmark-outline",
    group: "security",
    priority: 130,
  },

  {
    id: "alarm-installation",
    label: "Alarm Installation",
    icon: "notifications-outline",
    group: "security",
    priority: 131,
  },

  {
    id: "electric-fence",
    label: "Electric Fence Installation",
    icon: "flash-outline",
    group: "security",
    priority: 132,
  },

  {
    id: "locksmith",
    label: "Locksmith",
    icon: "key-outline",
    group: "security",
    priority: 133,
  },

  {
    id: "property-maintenance",
    label: "Property Maintenance",
    icon: "home-outline",
    group: "property",
    priority: 134,
  },

  {
    id: "land-surveying",
    label: "Land Surveying",
    icon: "map-outline",
    group: "property",
    priority: 135,
  },

  {
    id: "real-estate-services",
    label: "Real Estate Services",
    icon: "business-outline",
    group: "property",
    priority: 136,
  },

  /* ============================================================
     AGRICULTURE
  ============================================================ */

  {
    id: "farm-services",
    label: "Farm Services",
    icon: "leaf-outline",
    group: "agriculture",
    priority: 137,
  },

  {
    id: "poultry-services",
    label: "Poultry Services",
    icon: "leaf-outline",
    group: "agriculture",
    priority: 138,
  },

  {
    id: "fish-farming",
    label: "Fish Farming",
    icon: "fish-outline",
    group: "agriculture",
    priority: 139,
  },

  {
    id: "livestock-services",
    label: "Livestock Services",
    icon: "leaf-outline",
    group: "agriculture",
    priority: 140,
  },

  {
    id: "irrigation-installation",
    label: "Irrigation Installation",
    icon: "water-outline",
    group: "agriculture",
    priority: 141,
  },

  /* ============================================================
     HEALTH / CARE
  ============================================================ */

  {
    id: "physiotherapy",
    label: "Physiotherapy",
    icon: "body-outline",
    group: "health",
    priority: 142,
  },

  {
    id: "home-care",
    label: "Home Care",
    icon: "heart-outline",
    group: "health",
    priority: 143,
  },

  {
    id: "elderly-care",
    label: "Elderly Care",
    icon: "heart-outline",
    group: "health",
    priority: 144,
  },

  {
    id: "childcare",
    label: "Childcare",
    icon: "people-outline",
    group: "health",
    priority: 145,
  },

  /* ============================================================
     LOGISTICS / MOVING
  ============================================================ */

  {
    id: "delivery-services",
    label: "Delivery Services",
    icon: "cube-outline",
    group: "logistics",
    priority: 146,
  },

  {
    id: "courier-services",
    label: "Courier Services",
    icon: "paper-plane-outline",
    group: "logistics",
    priority: 147,
  },

  {
    id: "moving-services",
    label: "Moving Services",
    icon: "car-outline",
    group: "logistics",
    priority: 148,
  },

  {
    id: "furniture-moving",
    label: "Furniture Moving",
    icon: "cube-outline",
    group: "logistics",
    priority: 149,
  },

  {
    id: "haulage",
    label: "Haulage",
    icon: "car-outline",
    group: "logistics",
    priority: 150,
  },
] as const satisfies readonly ShopCategory[];

/* ==============================================================
   DERIVED TYPES
============================================================== */

export type ShopCategoryId =
  (typeof SHOP_CATEGORIES)[number]["id"];

export type ShopCategoryFilter =
  | "all"
  | ShopCategoryId;

/* ==============================================================
   FIND SHOP FILTERS

   "all" is UI-only.
   Never store "all" as a shop category in Firestore.
============================================================== */

export const FIND_SHOP_CATEGORIES = [
  {
    id: "all",
    label: "All",
    icon: "grid-outline",
  },

  ...SHOP_CATEGORIES,
] as const;

/* ==============================================================
   VALIDATION
============================================================== */

export function isShopCategoryId(
  value: unknown,
): value is ShopCategoryId {
  return (
    typeof value === "string" &&
    SHOP_CATEGORIES.some(
      category =>
        category.id === value,
    )
  );
}

export function isShopCategoryFilter(
  value: unknown,
): value is ShopCategoryFilter {
  return (
    value === "all" ||
    isShopCategoryId(value)
  );
}

/* ==============================================================
   LOOKUP
============================================================== */

export function getShopCategory(
  value: unknown,
): (typeof SHOP_CATEGORIES)[number] | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  if (!normalized) {
    return null;
  }

  return (
    SHOP_CATEGORIES.find(
      category =>
        category.id === normalized ||
        category.label
          .toLowerCase() ===
          normalized,
    ) ??
    null
  );
}

export function normalizeShopCategoryId(
  value: unknown,
): ShopCategoryId | '' {
  const category =
    getShopCategory(value);

  if (!category) {
    return '';
  }

  return category.id as ShopCategoryId;
}

export function getShopCategoryLabel(
  value: unknown,
): string {
  return (
    getShopCategory(value)?.label ??
    ""
  );
}

export function getShopCategoryIcon(
  value: unknown,
): ShopCategoryIcon {
  return (
    getShopCategory(value)?.icon ??
    "grid-outline"
  );
}

/* ==============================================================
   GROUP HELPERS
============================================================== */

export function getShopCategoriesByGroup(
  group: ShopCategoryGroup,
): readonly ShopCategory[] {
  return SHOP_CATEGORIES.filter(
    category =>
      category.group === group,
  );
}

/* ==============================================================
   POPULAR CATEGORIES

   Currently driven by curated priority.

   Later this can be replaced by Firestore analytics
   without changing the category IDs.
============================================================== */

export function getPopularShopCategories(
  limit = 10,
): readonly ShopCategory[] {
  const safeLimit =
    Number.isFinite(limit)
      ? Math.max(
          0,
          Math.floor(limit),
        )
      : 10;

  return [...SHOP_CATEGORIES]
    .sort(
      (a, b) =>
        a.priority -
        b.priority,
    )
    .slice(
      0,
      safeLimit,
    );
}