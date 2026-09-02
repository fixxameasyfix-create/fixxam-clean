import { useMemo } from "react";

type Props = {
  enabled: boolean;
};

export default function useUrgentService({
  enabled,
}: Props) {
  const available = useMemo(() => {
    const hour = new Date().getHours();

    return hour >= 7 && hour < 19;
  }, []);

  return {
    enabled,
    available,
    urgentFee: 1500,
    estimatedArrival: "30–90 mins",
    opensAt: "7:00 AM",
    closesAt: "7:00 PM",
  };
}