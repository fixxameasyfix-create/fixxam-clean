import React from "react";

import AirConditioning from "@/assets/svg/services/air-conditioning.svg";

import type { AppSvgProps } from "./types";

export default function AppSvg({
  size = 28,
  color = "#2563EB",
}: AppSvgProps) {
  return (
    <AirConditioning
      width={size}
      height={size}
      color={color}
    />
  );
}