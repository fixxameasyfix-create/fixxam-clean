

import React from "react";
import AirConditioning from "@/assets/svg/services/air-conditioning.svg";

type Props = {
  size?: number;
  color?: string;
};

export default function AppSvg({
  size = 30,
  color = "#2563EB",
}: Props) {
  return (
    <AirConditioning
      width={size}
      height={size}
      color={color}
    />
  );
}