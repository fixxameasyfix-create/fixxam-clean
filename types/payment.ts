import { Timestamp } from "firebase/firestore";

export type PaymentMethod = "cash";

export type PaymentStatus =
  | "pending"
  | "customer_confirmed"
  | "worker_confirmed";

export interface Payment {
  method: PaymentMethod;

  status: PaymentStatus;

  amount: number;

  paidAt?: Timestamp;
}