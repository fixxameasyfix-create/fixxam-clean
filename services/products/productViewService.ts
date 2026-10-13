import {
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   CONSTANTS
============================================================ */

const PRODUCTS_COLLECTION = "products";
const VIEWS_FIELD = "views";

export const PRODUCT_REVIEW_MIN_LENGTH = 10;
export const PRODUCT_REVIEW_MAX_LENGTH = 500;

/* ============================================================
   HELPERS
============================================================ */

function normalizeProductId(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ============================================================
   RECORD PRODUCT VIEW
============================================================ */

export async function recordProductView(
  productId: string,
): Promise<void> {
  const normalizedProductId =
    normalizeProductId(
      productId,
    );

  if (!normalizedProductId) {
    return;
  }

  /*
   * Product view writes are protected by Firestore rules.
   *
   * The product details page is public, so guests can reach
   * this function without being authenticated.
   *
   * Do not attempt a protected Firestore write for guests.
   */
  if (!auth.currentUser) {
    return;
  }

  const productRef =
    doc(
      db,
      PRODUCTS_COLLECTION,
      normalizedProductId,
    );

  await updateDoc(
    productRef,
    {
      [VIEWS_FIELD]:
        increment(1),
    },
  );
}