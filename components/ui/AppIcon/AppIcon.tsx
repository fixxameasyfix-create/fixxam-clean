// components/ui/AppIcon/AppIcon.tsx

import React from "react";
import type { LucideIcon } from "lucide-react-native";

import { resolveServiceIcon } from "./iconMap";

type Props = {
  name?: string | null;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function AppIcon({
  name,
  size = 24,
  color = "#2563EB",
  strokeWidth = 2,
}: Props) {
  const Icon: LucideIcon =
    resolveServiceIcon(name);

  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}