// components/ui/AppIcon/iconMap.ts

import * as LucideIcons from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

const aliases: Record<string, keyof typeof LucideIcons> = {
  "air-conditioner": "Fan",
  "air-conditioning": "Fan",
  "spray-bottle": "SprayCan",
  cleaning: "BrushCleaning",
  plumbing: "Droplets",
  electrician: "Zap",
  carpenter: "Hammer",
  mechanic: "Wrench",
  painting: "Paintbrush",
  delivery: "Truck",
  "phone-repair": "Smartphone",
  "computer-repair": "Laptop",
  home: "House",
  security: "Shield",
  photography: "Camera",
  catering: "CookingPot",
  beauty: "Scissors",
  package: "Package",
};

function normalizeIconKey(value: string): string {
  return value
    .trim()
    .replace(/[_\s]+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function toPascalCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join("");
}

export function resolveServiceIcon(
  iconName?: string | null,
): LucideIcon {
  const key = normalizeIconKey(
    iconName ?? "",
  );

  if (!key) {
    return LucideIcons.HelpCircle;
  }

  const alias = aliases[key];

  if (alias) {
    const icon = LucideIcons[alias];

    if (typeof icon === "function") {
      return icon as LucideIcon;
    }
  }

  const pascalName =
    toPascalCase(key) as keyof typeof LucideIcons;

  const dynamicIcon =
    LucideIcons[pascalName];

  if (typeof dynamicIcon === "function") {
    return dynamicIcon as LucideIcon;
  }

  return LucideIcons.HelpCircle;
}

export const iconMap = aliases;