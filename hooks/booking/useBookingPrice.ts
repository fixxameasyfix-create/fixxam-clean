import { useMemo } from "react";

type Props = {
  basePrice: number;
};

export default function useBookingPrice({
  basePrice,
}: Props) {
  return useMemo(() => {
    return {
      basePrice,
      estimatedPrice: basePrice,
    };
  }, [basePrice]);
}