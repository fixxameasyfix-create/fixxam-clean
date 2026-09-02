import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

type BookCardItem = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
};

export const bookCards: BookCardItem[] = [
  {
    title: "Find Worker Nearby",
    description: "Find trusted workers near you.",
    icon: "location-outline",
    iconColor: "#2563EB",
    iconBackground: "#EFF6FF",
    onPress: () =>
      router.push(
        "/(customer)/nearby-workers",
      ),
  },

  {
    title: "Choose Your Services",
    description: "Browse services and choose what you need.",
    icon: "grid-outline",
    iconColor: "#16A34A",
    iconBackground: "#ECFDF5",
    onPress: () =>
      router.push(
        "/(customer)/details/categories",
      ),
  },

  {
    title: "Help Me Fix",
    description: "Book a professional to fix it for you.",
    icon: "headset-outline",
    iconColor: "#EA580C",
    iconBackground: "#FFF7ED",
    onPress: () =>
      router.push(
        "/(customer)/ai",
      ),
  },

  {
    title: "Fix Yourself",
    description: "Get guidance to fix it yourself.",
    icon: "construct-outline",
    iconColor: "#9333EA",
    iconBackground: "#F3E8FF",
    onPress: () =>
      router.push(
        "/(customer)/fix-yourself",
      ),
  },

  {
    title: "Buy Your Spare Parts",
    description: "Find and buy quality spare parts.",
    icon: "cart-outline",
    iconColor: "#EC4899",
    iconBackground: "#FDF2F8",
    onPress: () =>
      router.push(
        "/(customer)/buy-spare-parts/buy-spare-part",
      ),
  },

  {
    title: "Find Materials",
    description: "Get the right materials for your service.",
    icon: "cube-outline",
    iconColor: "#0891B2",
    iconBackground: "#ECFEFF",
    onPress: () =>
      router.push(
        "/(customer)/find-materials/services",
      ),
  },

  {
    title: "Get Worker By Call",
    description: "Call a nearby worker and get help fast.",
    icon: "call-outline",
    iconColor: "#DC2626",
    iconBackground: "#FEF2F2",
    onPress: () =>
      router.push(
        "/(customer)/contact-worker/contact",
      ),
  },
];