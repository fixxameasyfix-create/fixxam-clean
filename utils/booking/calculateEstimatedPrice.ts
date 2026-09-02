import calculateUrgentFee from "./calculateUrgentFee";

type Props = {
  basePrice: number;
  urgent: boolean;
};

export default function calculateEstimatedPrice({
  basePrice,
  urgent,
}: Props): number {

  const urgentFee =
    calculateUrgentFee(
      urgent
    );

  return (
    basePrice +
    urgentFee
  );

}