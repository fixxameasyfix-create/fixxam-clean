import React from "react";

import OrderCard from "./OrderCard";
type JobStatus =
  | "pending_estimate"
  | "negotiating"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "awaiting_cash"
  | "payment_pending_confirmation"
  | "completed"
  | "cancelled";

type Props = {
  customerName: string;
  customerPhoto: string;

  serviceName: string;

  location: string;

  bookingDate: string;
  bookingTime: string;

  amount: number;

  status: JobStatus,

  onPress: () => void;
};

export default function BookingOrderCard({
  customerName,
  customerPhoto,
  serviceName,
  location,
  bookingDate,
  bookingTime,
  amount,
  status,
  onPress,
}: Props) {

  const date = new Date(bookingDate);

const formattedDate = date.toLocaleDateString();
const formattedTime = date.toLocaleTimeString([], {
  hour: "numeric",
  minute: "2-digit",
});

    return (
    <OrderCard
      image={customerPhoto}
      title={serviceName}
      subtitle={customerName}
      location={location}
      bookingDate={formattedDate}
bookingTime={formattedTime}
      amount={amount}
      status={status}
      onPress={onPress}
    />
  );
}