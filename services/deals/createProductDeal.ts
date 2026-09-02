import {
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  dealsCollection,
} from "@/firebase/collections/deals";

type CreateProductDealInput = {
  productId: string;
  workerId: string;
  originalPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  startsAt: Date;
  expiresAt: Date;
};

export default async function createProductDeal(
  input: CreateProductDealInput,
) {
  const {
    productId,
    workerId,
    originalPrice,
    discountPercentage,
    discountedPrice,
    startsAt,
    expiresAt,
  } = input;

  if (!productId) {
    throw new Error(
      "Product ID is required.",
    );
  }

  if (!workerId) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  if (
    !Number.isFinite(
      originalPrice,
    ) ||
    originalPrice <= 0
  ) {
    throw new Error(
      "Invalid original price.",
    );
  }

  if (
    !Number.isFinite(
      discountPercentage,
    ) ||
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    throw new Error(
      "Discount must be between 1% and 99%.",
    );
  }

  if (
    !Number.isFinite(
      discountedPrice,
    ) ||
    discountedPrice <= 0 ||
    discountedPrice >=
      originalPrice
  ) {
    throw new Error(
      "Invalid discounted price.",
    );
  }

  if (
    expiresAt.getTime() <=
    startsAt.getTime()
  ) {
    throw new Error(
      "Expiry date must be after start date.",
    );
  }

  return addDoc(
    dealsCollection,
    {
      type: "product",

      title: "Product Discount",

      description:
        "Special discounted offer.",

      productId,

      workerId,

      originalPrice,

      discountedPrice,

      discountPercentage,

      status: "active",

      startsAt,

      expiresAt,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}