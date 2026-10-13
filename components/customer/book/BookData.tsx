import type {
  ComponentProps,
} from "react";

import {
  router,
} from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

export type BookCardItem = {
  title: string;

  description: string;

  icon: MaterialIconName;

  iconColor: string;

  iconBackground: string;

  onPress: () => void;
};

/* ==============================================================
   BOOK CARDS
============================================================== */

export const bookCards: BookCardItem[] = [
  /* ============================================================
     BOOK AUTOMATICALLY
  ============================================================ */

 {
  title:
    "Book Automatically",

  description:
    "Let Fixxam find the right worker nearby.",

  icon:
  "calendar-check-outline",

  iconColor:
    "#F97316",

  iconBackground:
    "#FFF7ED",

  onPress: () =>
    router.push(
      "/(customer)/ai-booking",
    ),
},

  /* ============================================================
     FIND WORKER NEARBY
  ============================================================ */

  {
    title:
      "Find Worker Nearby",

    description:
      "Find trusted workers near you.",

    icon:
      "map-marker-radius-outline",

    iconColor:
      "#2563EB",

    iconBackground:
      "#EFF6FF",

    onPress: () =>
      router.push(
        "/(customer)/nearby-workers",
      ),
  },

  /* ============================================================
     FIND SHOP NEARBY
  ============================================================ */

  {
    title:
      "Find Shop Nearby",

    description:
      "Shop for services near you.",

    icon:
      "storefront-outline",

    iconColor:
      "#0D9488",

    iconBackground:
      "#F0FDFA",

    onPress: () =>
      router.push(
        "/(customer)/find-shop",
      ),
  },

  /* ============================================================
     CHOOSE YOUR SERVICES
  ============================================================ */

  {
    title:
      "Choose Your Services",

    description:
      "Browse services and choose what you need.",

    icon:
      "view-grid-outline",

    iconColor:
      "#16A34A",

    iconBackground:
      "#ECFDF5",

    onPress: () =>
      router.push(
        "/(customer)/details/categories",
      ),
  },

  /* ============================================================
     HELP ME FIX
  ============================================================ */

  {
    title:
      "Help Me Fix",

    description:
      "Book a professional to fix it for you.",

    icon:
      "headset",

    iconColor:
      "#EA580C",

    iconBackground:
      "#FFF7ED",

    onPress: () =>
      router.push(
        "/(customer)/ai",
      ),
  },

  /* ============================================================
     FIX YOURSELF
  ============================================================ */

  {
    title:
      "Fix Yourself",

    description:
      "Get guidance to fix it yourself.",

    icon:
      "hammer-wrench",

    iconColor:
      "#9333EA",

    iconBackground:
      "#F3E8FF",

    onPress: () =>
      router.push(
        "/(customer)/fix-yourself",
      ),
  },

  /* ============================================================
     BUY YOUR SPARE PARTS
  ============================================================ */

  {
    title:
      "Buy Your Spare Parts",

    description:
      "Find and buy quality spare parts.",

    icon:
      "cart-outline",

    iconColor:
      "#EC4899",

    iconBackground:
      "#FDF2F8",

    onPress: () =>
      router.push(
        "/(customer)/buy-spare-parts/buy-spare-part",
      ),
  },

  /* ============================================================
     FIND MATERIALS
  ============================================================ */

  {
    title:
      "Find Materials",

    description:
      "Get the right materials for your service.",

    icon:
      "cube-outline",

    iconColor:
      "#0891B2",

    iconBackground:
      "#ECFEFF",

    onPress: () =>
      router.push(
        "/(customer)/find-materials/services",
      ),
  },

  /* ============================================================
     GET WORKER BY CALL
  ============================================================ */

  {
    title:
      "Get Worker By Call",

    description:
      "Call a nearby worker and get help fast.",

    icon:
      "phone-outline",

    iconColor:
      "#DC2626",

    iconBackground:
      "#FEF2F2",

    onPress: () =>
      router.push(
        "/(customer)/contact-worker/contact",
      ),
  },
];