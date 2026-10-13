import {
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  dealsCollection,
} from "@/firebase/collections/deals";

/* ============================================================
   TYPES
============================================================ */

type CreateProductDealInput = {
  productId: string;

  workerId: string;

  originalPrice: number;

  discountPercentage: number;

  discountedPrice: number;

  startsAt: Date;

  expiresAt: Date;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   UPSERT PRODUCT DEAL
============================================================ */

/**
 * Ensures one active product deal per product/worker.
 *
 * Existing active deal:
 *   -> update it
 *
 * Legacy duplicate active deals:
 *   -> keep first one active
 *   -> deactivate the others
 *
 * No active deal:
 *   -> create a new deal
 */
export default async function createProductDeal(
  input: CreateProductDealInput,
): Promise<DocumentReference> {
  const productId =
    cleanString(
      input.productId,
    );

  const workerId =
    cleanString(
      input.workerId,
    );

  const {
    originalPrice,
    discountPercentage,
    discountedPrice,
    startsAt,
    expiresAt,
  } = input;

  /* ==========================================================
     VALIDATION
  ========================================================== */

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
    !Number.isFinite(
      startsAt.getTime(),
    ) ||
    !Number.isFinite(
      expiresAt.getTime(),
    ) ||
    expiresAt.getTime() <=
      startsAt.getTime()
  ) {
    throw new Error(
      "Expiry date must be after start date.",
    );
  }

  /* ==========================================================
     FIND PRODUCT DEALS OWNED BY THIS WORKER
  ========================================================== */

  const existingQuery =
    query(
      dealsCollection,

      where(
        "productId",
        "==",
        productId,
      ),

      where(
        "workerId",
        "==",
        workerId,
      ),
    );

  const existingSnapshot =
    await getDocs(
      existingQuery,
    );

  const activeDeals =
    existingSnapshot.docs.filter(
      document => {
        const data =
          document.data();

        return (
          data.type ===
            "product" &&
          data.status ===
            "active"
        );
      },
    );

  /* ==========================================================
     COMMON DATA
  ========================================================== */

  const dealData = {
    type:
      "product" as const,

    title:
      "Product Discount",

    description:
      "Special discounted offer.",

    productId,

    workerId,

    originalPrice,

    discountedPrice,

    discountPercentage,

    status:
      "active" as const,

    startsAt,

    expiresAt,
  };

  const batch =
    writeBatch(
      db,
    );

  /* ==========================================================
     UPDATE EXISTING ACTIVE DEAL
  ========================================================== */

  if (
    activeDeals.length >
    0
  ) {
    const primaryDeal =
      activeDeals[0];

    batch.update(
      primaryDeal.ref,
      {
        ...dealData,

        updatedAt:
          serverTimestamp(),
      },
    );

    /*
     * Clean legacy duplicates.
     */
    for (
      const duplicateDeal of
        activeDeals.slice(1)
    ) {
      batch.update(
        duplicateDeal.ref,
        {
          status:
            "inactive",

          updatedAt:
            serverTimestamp(),

          deactivatedAt:
            serverTimestamp(),
        },
      );
    }

    await batch.commit();

    return primaryDeal.ref;
  }

  /* ==========================================================
     CREATE NEW DEAL
  ========================================================== */

  const newDealRef =
    doc(
      dealsCollection,
    );

  batch.set(
    newDealRef,
    {
      ...dealData,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  await batch.commit();

  return newDealRef;
}