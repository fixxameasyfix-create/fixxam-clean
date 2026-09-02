export type DealType =
  | "product"
  | "service";

export type DealStatus =
  | "active"
  | "expired"
  | "disabled";

export interface Deal {
  id: string;

  type: DealType;

  title: string;

  description: string;

  productId?: string;

  workerId?: string;

  originalPrice: number;

  discountedPrice: number;

  discountPercentage: number;

  status: DealStatus;

  startsAt: unknown;

  expiresAt: unknown;

  createdAt: unknown;

  updatedAt: unknown;
}