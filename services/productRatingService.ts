import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

export type ProductRatingState = {
  rated: boolean;
  count: number;
};

export type ToggleProductRatingResult = {
  rated: boolean;
};

type ProductRatingDocument = {
  customerId: string;
  productId: string;
  createdAt: unknown;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const PRODUCT_RATINGS_COLLECTION =
  "productRatings";

/* ==============================================================
   HELPERS
============================================================== */

function cleanId(
  value: unknown,
  fieldName: string,
): string {
  if (
    typeof value !== "string"
  ) {
    throw new Error(
      `${fieldName} is required.`,
    );
  }

  const cleaned =
    value.trim();

  if (!cleaned) {
    throw new Error(
      `${fieldName} is required.`,
    );
  }

  return cleaned;
}

function getAuthenticatedCustomerId(): string {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to rate a product.",
    );
  }

  return cleanId(
    user.uid,
    "Customer ID",
  );
}

function getProductRatingId(
  productId: string,
  customerId: string,
): string {
  return `${productId}_${customerId}`;
}

/* ==============================================================
   CHECK CUSTOMER PRODUCT RATING
============================================================== */

export async function hasCustomerRatedProduct(
  productId: string,
): Promise<boolean> {
  const customerId =
    getAuthenticatedCustomerId();

  const safeProductId =
    cleanId(
      productId,
      "Product ID",
    );

  const ratingId =
    getProductRatingId(
      safeProductId,
      customerId,
    );

  const ratingRef =
    doc(
      db,
      PRODUCT_RATINGS_COLLECTION,
      ratingId,
    );

  const snapshot =
    await getDoc(
      ratingRef,
    );

  return snapshot.exists();
}

/* ==============================================================
   RATE PRODUCT
============================================================== */

export async function rateProduct(
  productId: string,
): Promise<void> {
  const customerId =
    getAuthenticatedCustomerId();

  const safeProductId =
    cleanId(
      productId,
      "Product ID",
    );

  const ratingId =
    getProductRatingId(
      safeProductId,
      customerId,
    );

  const ratingRef =
    doc(
      db,
      PRODUCT_RATINGS_COLLECTION,
      ratingId,
    );

  const existing =
    await getDoc(
      ratingRef,
    );

  if (
    existing.exists()
  ) {
    return;
  }

  const ratingData: ProductRatingDocument =
    {
      customerId,

      productId:
        safeProductId,

      createdAt:
        serverTimestamp(),
    };

  await setDoc(
    ratingRef,
    ratingData,
  );
}

/* ==============================================================
   UNRATE PRODUCT
============================================================== */

export async function unrateProduct(
  productId: string,
): Promise<void> {
  const customerId =
    getAuthenticatedCustomerId();

  const safeProductId =
    cleanId(
      productId,
      "Product ID",
    );

  const ratingId =
    getProductRatingId(
      safeProductId,
      customerId,
    );

  const ratingRef =
    doc(
      db,
      PRODUCT_RATINGS_COLLECTION,
      ratingId,
    );

  const existing =
    await getDoc(
      ratingRef,
    );

  if (
    !existing.exists()
  ) {
    return;
  }

  await deleteDoc(
    ratingRef,
  );
}

/* ==============================================================
   TOGGLE PRODUCT RATING
============================================================== */

export async function toggleProductRating(
  productId: string,
): Promise<ToggleProductRatingResult> {
  const customerId =
    getAuthenticatedCustomerId();

  const safeProductId =
    cleanId(
      productId,
      "Product ID",
    );

  const ratingId =
    getProductRatingId(
      safeProductId,
      customerId,
    );

  const ratingRef =
    doc(
      db,
      PRODUCT_RATINGS_COLLECTION,
      ratingId,
    );

  const existing =
    await getDoc(
      ratingRef,
    );

  if (
    existing.exists()
  ) {
    await deleteDoc(
      ratingRef,
    );

    return {
      rated: false,
    };
  }

  const ratingData: ProductRatingDocument =
    {
      customerId,

      productId:
        safeProductId,

      createdAt:
        serverTimestamp(),
    };

  await setDoc(
    ratingRef,
    ratingData,
  );

  return {
    rated: true,
  };
}

/* ==============================================================
   SUBSCRIBE TO PRODUCT RATING COUNT
============================================================== */

/**
 * Subscribes to the total number of ratings
 * for a product.
 *
 * Firestore /productRatings reads are protected,
 * therefore guests must not create the listener.
 *
 * Guest:
 *   - count = 0
 *   - no Firestore listener
 *
 * Authenticated:
 *   - real-time rating count
 *
 * The listener automatically switches when
 * authentication state changes.
 */
export function subscribeToProductRatingCount(
  productId: string,
  onCountChange: (
    count: number,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  let safeProductId: string;

  try {
    safeProductId =
      cleanId(
        productId,
        "Product ID",
      );
  } catch (
    error
  ) {
    onCountChange(
      0,
    );

    onError?.(
      error instanceof Error
        ? error
        : new Error(
            "Invalid product ID.",
          ),
    );

    return () => {};
  }

  let unsubscribeSnapshot:
    | Unsubscribe
    | null = null;

  let disposed =
    false;

  const unsubscribeAuth =
    onAuthStateChanged(
      auth,
      user => {
        if (
          disposed
        ) {
          return;
        }

        /**
         * Guest user.
         *
         * Do not query /productRatings.
         */
        if (!user) {
          unsubscribeSnapshot?.();

          unsubscribeSnapshot =
            null;

          onCountChange(
            0,
          );

          return;
        }

        /**
         * Authenticated user.
         *
         * Remove any previous
         * Firestore listener first.
         */
        unsubscribeSnapshot?.();

        const ratingsQuery =
          query(
            collection(
              db,
              PRODUCT_RATINGS_COLLECTION,
            ),
            where(
              "productId",
              "==",
              safeProductId,
            ),
          );

        unsubscribeSnapshot =
          onSnapshot(
            ratingsQuery,

            snapshot => {
              if (
                disposed
              ) {
                return;
              }

              onCountChange(
                snapshot.size,
              );
            },

            error => {
              if (
                disposed
              ) {
                return;
              }

              if (
                __DEV__
              ) {
                console.error(
                  "PRODUCT_RATING_COUNT_SUBSCRIPTION_ERROR",
                  {
                    productId:
                      safeProductId,
                    error,
                  },
                );
              }

              onError?.(
                error,
              );
            },
          );
      },
    );

  return () => {
    disposed =
      true;

    unsubscribeSnapshot?.();

    unsubscribeSnapshot =
      null;

    unsubscribeAuth();
  };
}

/* ==============================================================
   SUBSCRIBE TO CUSTOMER PRODUCT RATING
============================================================== */

/**
 * Subscribes to the current customer's
 * rating state for a product.
 *
 * Guest:
 *   - rated = false
 *   - no Firestore listener
 *
 * Authenticated:
 *   - real-time rated state
 */
export function subscribeToCustomerProductRating(
  productId: string,
  onRatedChange: (
    rated: boolean,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  let safeProductId: string;

  try {
    safeProductId =
      cleanId(
        productId,
        "Product ID",
      );
  } catch (
    error
  ) {
    onRatedChange(
      false,
    );

    onError?.(
      error instanceof Error
        ? error
        : new Error(
            "Unable to load product rating.",
          ),
    );

    return () => {};
  }

  let unsubscribeSnapshot:
    | Unsubscribe
    | null = null;

  let disposed =
    false;

  const unsubscribeAuth =
    onAuthStateChanged(
      auth,
      user => {
        if (
          disposed
        ) {
          return;
        }

        /**
         * Guest user.
         *
         * A guest cannot have a
         * product rating.
         */
        if (!user) {
          unsubscribeSnapshot?.();

          unsubscribeSnapshot =
            null;

          onRatedChange(
            false,
          );

          return;
        }

        const customerId =
          cleanId(
            user.uid,
            "Customer ID",
          );

        const ratingId =
          getProductRatingId(
            safeProductId,
            customerId,
          );

        const ratingRef =
          doc(
            db,
            PRODUCT_RATINGS_COLLECTION,
            ratingId,
          );

        unsubscribeSnapshot?.();

        unsubscribeSnapshot =
          onSnapshot(
            ratingRef,

            snapshot => {
              if (
                disposed
              ) {
                return;
              }

              onRatedChange(
                snapshot.exists(),
              );
            },

            error => {
              if (
                disposed
              ) {
                return;
              }

              if (
                __DEV__
              ) {
                console.error(
                  "CUSTOMER_PRODUCT_RATING_SUBSCRIPTION_ERROR",
                  {
                    productId:
                      safeProductId,
                    error,
                  },
                );
              }

              onError?.(
                error,
              );
            },
          );
      },
    );

  return () => {
    disposed =
      true;

    unsubscribeSnapshot?.();

    unsubscribeSnapshot =
      null;

    unsubscribeAuth();
  };
}

/* ==============================================================
   SUBSCRIBE TO PRODUCT RATING STATE
============================================================== */

/**
 * Combines:
 *
 * 1. Customer's rated state
 * 2. Product's total rating count
 *
 * Both listeners are safely authentication-aware.
 */
export function subscribeToProductRatingState(
  productId: string,
  onChange: (
    state: ProductRatingState,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  let rated =
    false;

  let count =
    0;

  let ratedReady =
    false;

  let countReady =
    false;

  const emit =
    () => {
      if (
        !ratedReady ||
        !countReady
      ) {
        return;
      }

      onChange({
        rated,
        count,
      });
    };

  const unsubscribeRated =
    subscribeToCustomerProductRating(
      productId,

      value => {
        rated =
          value;

        ratedReady =
          true;

        emit();
      },

      onError,
    );

  const unsubscribeCount =
    subscribeToProductRatingCount(
      productId,

      value => {
        count =
          value;

        countReady =
          true;

        emit();
      },

      onError,
    );

  return () => {
    unsubscribeRated();
    unsubscribeCount();
  };
}