import React, { memo } from "react";

import BookingCard from "./BookingCard";
import BookingUrgentHeader from "./BookingUrgentHeader";
import BookingUrgentSwitch from "./BookingUrgentSwitch";

import useUrgentService from "@/hooks/booking/useUrgentService";

type Props = {
  urgent: boolean;
  onChange: (value: boolean) => void;
};

function BookingUrgentCard({
  urgent,
  onChange,
}: Props) {
  const service = useUrgentService({
    enabled: urgent,
  });

  return (
    <BookingCard>
      <BookingUrgentHeader
        available={service.available}
      />

      <BookingUrgentSwitch
        value={urgent}
        available={service.available}
        urgentFee={service.urgentFee}
        opensAt={service.opensAt}
        closesAt={service.closesAt}
        onChange={onChange}
      />
    </BookingCard>
  );
}

export default memo(BookingUrgentCard);