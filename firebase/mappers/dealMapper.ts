import type {
  QueryDocumentSnapshot,
} from "firebase/firestore";

import type {
  Deal,
  DealStatus,
  DealType,
} from "@/types/deal";

const DEAL_TYPES: DealType[] = [
  "product",
  "service",
];

const DEAL_STATUSES: DealStatus[] = [
  "active",
  "expired",
  "disabled",
];

function getDealType(
  value: unknown,
): DealType {
  if (
    typeof value === "string" &&
    DEAL_TYPES.includes(
      value as DealType,
    )
  ) {
    return value as DealType;
  }

  return "product";
}

function getDealStatus(
  value: unknown,
): DealStatus {
  if (
    typeof value === "string" &&
    DEAL_STATUSES.includes(
      value as DealStatus,
    )
  ) {
    return value as DealStatus;
  }

  return "disabled";
}

function getNumber(
  value: unknown,
): number {
  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function getString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export function dealMapper(
  doc: QueryDocumentSnapshot,
): Deal {
  const data = doc.data();

  return {
    id: doc.id,

    type: getDealType(
      data.type,
    ),

    title: getString(
      data.title,
    ),

    description: getString(
      data.description,
    ),

    productId:
      typeof data.productId ===
      "string"
        ? data.productId
        : undefined,

    workerId:
      typeof data.workerId ===
      "string"
        ? data.workerId
        : undefined,

    originalPrice:
      getNumber(
        data.originalPrice,
      ),

    discountedPrice:
      getNumber(
        data.discountedPrice,
      ),

    discountPercentage:
      getNumber(
        data.discountPercentage,
      ),

    status: getDealStatus(
      data.status,
    ),

    startsAt:
      data.startsAt ?? null,

    expiresAt:
      data.expiresAt ?? null,

    createdAt:
      data.createdAt ?? null,

    updatedAt:
      data.updatedAt ?? null,
  };
}