import React from "react";

import OrderCard, {
  JobStatus,
} from "./OrderCard";

type Props = {
  productName: string;
  productImage: string;

  customerName: string;

  orderDate: string;
  orderTime: string;

  location: string;

  amount: number;

  status: JobStatus;

  onPress: () => void;
};

export default function ProductOrderCard({
  productName,
  productImage,
  customerName,
  orderDate,
  orderTime,
  location,
  amount,
  status,
  onPress,
}: Props) {
  return (
    <OrderCard
      image={productImage}
      title={productName}
      subtitle={customerName}
      location={location}
      bookingDate={orderDate}
      bookingTime={orderTime}
      amount={amount}
      status={status}
      onPress={onPress}
    />
  );
}