import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

const REVIEWS_COLLECTION = "reviews";

const COMMENT_MIN_LENGTH = 3;
const COMMENT_MAX_LENGTH = 500;

const RATING_MIN = 1;
const RATING_MAX = 5;

export interface CreateProductReviewInput {
  productId: string;
  productName: string;
  workerId: string;
  customerName: string;
  rating: number;
  comment: string;
}

function cleanRequiredString(
  value: unknown,
  fieldName: string,
): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const cleanedValue = value.trim();

  if (!cleanedValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleanedValue;
}

function validateRating(rating: unknown): number {
  if (typeof rating !== "number") {
    throw new Error("Rating must be a number.");
  }

  if (!Number.isInteger(rating)) {
    throw new Error("Rating must be a whole number.");
  }

  if (
    rating < RATING_MIN ||
    rating > RATING_MAX
  ) {
    throw new Error(
      `Rating must be between ${RATING_MIN} and ${RATING_MAX}.`,
    );
  }

  return rating;
}

function validateComment(comment: unknown): string {
  const cleanedComment = cleanRequiredString(
    comment,
    "Comment",
  );

  if (
    cleanedComment.length <
    COMMENT_MIN_LENGTH
  ) {
    throw new Error(
      `Comment must be at least ${COMMENT_MIN_LENGTH} characters.`,
    );
  }

  if (
    cleanedComment.length >
    COMMENT_MAX_LENGTH
  ) {
    throw new Error(
      `Comment must not exceed ${COMMENT_MAX_LENGTH} characters.`,
    );
  }

  return cleanedComment;
}

/**
 * Create a review for a product.
 */
export async function createProductReview(
  input: CreateProductReviewInput,
): Promise<string> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "You must be signed in to submit a review.",
    );
  }

  const productId = cleanRequiredString(
    input.productId,
    "Product ID",
  );

  const productName = cleanRequiredString(
    input.productName,
    "Product name",
  );

  const workerId = cleanRequiredString(
    input.workerId,
    "Worker ID",
  );

  const customerName = cleanRequiredString(
    input.customerName,
    "Customer name",
  );

  const rating = validateRating(
    input.rating,
  );

  const comment = validateComment(
    input.comment,
  );

  if (workerId === currentUser.uid) {
    throw new Error(
      "You cannot review your own product.",
    );
  }

  const reviewData = {
    customerId: currentUser.uid,
    customerName,

    productId,
    productName,

    workerId,

    targetId: productId,
    targetType: "product" as const,

    rating,
    comment,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const reviewReference = await addDoc(
    collection(
      db,
      REVIEWS_COLLECTION,
    ),
    reviewData,
  );

  return reviewReference.id;
}

/**
 * Subscribe to the number of reviews for a product.
 *
 * The Firestore listener is intentionally attached only
 * after Firebase Auth confirms that a user is signed in.
 *
 * This prevents permission-denied errors caused by the
 * Firestore security rule:
 *
 *   allow read: if signedIn();
 */
export function subscribeToProductReviewCount(
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
    safeProductId = cleanRequiredString(
      productId,
      "Product ID",
    );
  } catch (error) {
    onCountChange(0);

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

  let isDisposed = false;

  const unsubscribeAuth =
    onAuthStateChanged(
      auth,
      user => {
        if (isDisposed) {
          return;
        }

        /**
         * User is signed out.
         *
         * Do not create a Firestore listener because
         * /reviews currently requires authentication.
         */
        if (!user) {
          unsubscribeSnapshot?.();

          unsubscribeSnapshot = null;

          onCountChange(0);

          return;
        }

        /**
         * Authenticated user.
         *
         * Remove any previous Firestore listener before
         * creating a new one.
         */
        unsubscribeSnapshot?.();

        const reviewsQuery = query(
          collection(
            db,
            REVIEWS_COLLECTION,
          ),
          where(
            "targetType",
            "==",
            "product",
          ),
          where(
            "targetId",
            "==",
            safeProductId,
          ),
        );

        unsubscribeSnapshot =
          onSnapshot(
            reviewsQuery,

            snapshot => {
              if (isDisposed) {
                return;
              }

              onCountChange(
                snapshot.size,
              );
            },

            error => {
              if (isDisposed) {
                return;
              }

              if (__DEV__) {
                console.error(
                  "PRODUCT_REVIEW_COUNT_SUBSCRIPTION_ERROR",
                  {
                    productId:
                      safeProductId,
                    error,
                  },
                );
              }

              onError?.(error);
            },
          );
      },
    );

  /**
   * Cleanup:
   *
   * 1. Stop listening to Firebase Auth.
   * 2. Stop listening to Firestore.
   */
  return () => {
    isDisposed = true;

    unsubscribeSnapshot?.();

    unsubscribeSnapshot = null;

    unsubscribeAuth();
  };
}