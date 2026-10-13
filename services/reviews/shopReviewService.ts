import { onAuthStateChanged } from 'firebase/auth';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';

import { auth, db } from '@/firebase/config';

/* ============================================================
   TYPES
============================================================ */

export type ShopReviewRating = 1 | 2 | 3 | 4 | 5;

export type CreateShopReviewInput = {
  shopId: string;
  rating: ShopReviewRating;
  comment?: string;
};

export type ShopReviewRecord = {
  id: string;
  customerId: string;
  customerName: string;
  shopId: string;
  rating: ShopReviewRating;
  comment: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

/* ============================================================
   CONSTANTS
============================================================ */

const REVIEWS_COLLECTION = 'reviews';
const USERS_COLLECTION = 'users';

export const SHOP_REVIEW_MIN_COMMENT_LENGTH = 3;
export const SHOP_REVIEW_MAX_COMMENT_LENGTH = 500;

export const SHOP_REVIEW_MIN_RATING = 1;
export const SHOP_REVIEW_MAX_RATING = 5;

const MAX_CUSTOMER_NAME_LENGTH = 150;

/* ============================================================
   STRING HELPERS
============================================================ */

function cleanRequiredString(
  value: unknown,
  fieldName: string,
): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} is required.`);
  }

  const cleaned = value.trim();

  if (!cleaned) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleaned;
}

function cleanOptionalComment(
  value: unknown,
): string {
  if (value == null) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new Error(
      'Invalid review comment.',
    );
  }

  const cleaned = value.trim();

  if (
    cleaned.length > 0 &&
    cleaned.length <
      SHOP_REVIEW_MIN_COMMENT_LENGTH
  ) {
    throw new Error(
      `Comment must be at least ${SHOP_REVIEW_MIN_COMMENT_LENGTH} characters.`,
    );
  }

  if (
    cleaned.length >
    SHOP_REVIEW_MAX_COMMENT_LENGTH
  ) {
    throw new Error(
      `Comment cannot exceed ${SHOP_REVIEW_MAX_COMMENT_LENGTH} characters.`,
    );
  }

  return cleaned;
}

/* ============================================================
   RATING
============================================================ */

function validateRating(
  value: unknown,
): ShopReviewRating {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value <
      SHOP_REVIEW_MIN_RATING ||
    value >
      SHOP_REVIEW_MAX_RATING
  ) {
    throw new Error(
      'Rating must be between 1 and 5 stars.',
    );
  }

  return value as ShopReviewRating;
}

/* ============================================================
   AUTH
============================================================ */

function getAuthenticatedCustomerId(): string {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      'You must be signed in to write a review.',
    );
  }

  return cleanRequiredString(
    user.uid,
    'Customer ID',
  );
}

/* ============================================================
   CUSTOMER PROFILE NAME
============================================================ */

type CustomerProfileData = {
  firstName?: unknown;
  otherName?: unknown;
  surname?: unknown;
  fullName?: unknown;
};

function cleanNamePart(
  value: unknown,
): string {
  if (
    typeof value !== 'string'
  ) {
    return '';
  }

  return value.trim();
}

async function getAuthenticatedCustomerName(
  customerId: string,
): Promise<string> {
  const profileRef = doc(
    db,
    USERS_COLLECTION,
    customerId,
  );

  const profileSnapshot =
    await getDoc(profileRef);

  if (!profileSnapshot.exists()) {
    throw new Error(
      'Your customer profile could not be found. Please complete your profile before writing a review.',
    );
  }

  const profile =
    profileSnapshot.data() as CustomerProfileData;

  const firstName =
    cleanNamePart(
      profile.firstName,
    );

  const otherName =
    cleanNamePart(
      profile.otherName,
    );

  const surname =
    cleanNamePart(
      profile.surname,
    );

  /*
   * The customer profile requires
   * first name and surname.
   *
   * We build the review name directly
   * from the saved profile fields.
   */
  const profileName = [
    firstName,
    otherName,
    surname,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (
    !firstName ||
    !surname ||
    !profileName
  ) {
    throw new Error(
      'Please complete your first name and surname in your profile before writing a review.',
    );
  }

  return profileName.slice(
    0,
    MAX_CUSTOMER_NAME_LENGTH,
  );
}

/* ============================================================
   TIMESTAMP
============================================================ */

function getTimestampMillis(
  value: Timestamp | null,
): number {
  if (!value) {
    return 0;
  }

  return value.toMillis();
}

/* ============================================================
   MAP REVIEW
============================================================ */

function mapShopReview(
  id: string,
  data: DocumentData,
  shopId: string,
): ShopReviewRecord {
  const rating =
    Number(data.rating);

  return {
    id,

    customerId:
      typeof data.customerId ===
      'string'
        ? data.customerId
        : '',

    customerName:
      typeof data.customerName ===
        'string' &&
      data.customerName.trim()
        ? data.customerName.trim()
        : 'Customer',

    shopId:
      typeof data.shopId ===
      'string'
        ? data.shopId
        : shopId,

    rating:
      rating >= 1 &&
      rating <= 5
        ? (rating as ShopReviewRating)
        : 1,

    comment:
      typeof data.comment ===
      'string'
        ? data.comment
        : '',

    createdAt:
      data.createdAt ?? null,

    updatedAt:
      data.updatedAt ?? null,
  };
}

/* ============================================================
   CREATE SHOP REVIEW
============================================================ */

export async function createShopReview(
  input: CreateShopReviewInput,
): Promise<string> {
  const customerId =
    getAuthenticatedCustomerId();

  const shopId =
    cleanRequiredString(
      input.shopId,
      'Shop ID',
    );

  const rating =
    validateRating(
      input.rating,
    );

  const comment =
    cleanOptionalComment(
      input.comment,
    );

  /*
   * IMPORTANT:
   *
   * Do NOT accept customerName
   * from the review form.
   *
   * The name comes directly from:
   *
   * users/{customerId}
   */
  const customerName =
    await getAuthenticatedCustomerName(
      customerId,
    );

  const reviewRef =
    await addDoc(
      collection(
        db,
        REVIEWS_COLLECTION,
      ),
      {
        customerId,

        customerName,

        shopId,

        targetId:
          shopId,

        targetType:
          'shop',

        rating,

        comment,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );

  return reviewRef.id;
}

/* ============================================================
   REALTIME SHOP REVIEWS
============================================================ */

/**
 * Subscribe to shop reviews safely.
 *
 * Firestore /reviews reads require authentication.
 *
 * Therefore:
 *
 * - Guest users do not attach a Firestore listener.
 * - Signed-in users receive realtime reviews.
 * - Auth state changes are handled automatically.
 * - All listeners are cleaned up correctly.
 */
export function subscribeToShopReviews(
  shopId: string,
  onReviewsChange: (
    reviews: ShopReviewRecord[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  let safeShopId: string;

  try {
    safeShopId =
      cleanRequiredString(
        shopId,
        'Shop ID',
      );
  } catch (error) {
    onReviewsChange([]);

    onError?.(
      error instanceof Error
        ? error
        : new Error(
            'Invalid Shop ID.',
          ),
    );

    return () => {};
  }

  let unsubscribeSnapshot:
    | Unsubscribe
    | null = null;

  let isDisposed = false;

  /*
   * Wait for Firebase Auth state before
   * attaching the protected /reviews listener.
   */
  const unsubscribeAuth =
    onAuthStateChanged(
      auth,
      (user) => {
        if (isDisposed) {
          return;
        }

        /* ---------------------------------------------
           SIGNED OUT
        --------------------------------------------- */

        if (!user) {
          unsubscribeSnapshot?.();

          unsubscribeSnapshot = null;

          /*
           * Do not query /reviews while signed out.
           *
           * This prevents:
           *
           * FirebaseError:
           * Missing or insufficient permissions.
           */
          onReviewsChange([]);

          return;
        }

        /* ---------------------------------------------
           SIGNED IN
        --------------------------------------------- */

        /*
         * Remove any previous Firestore listener
         * before creating a new one.
         */
        unsubscribeSnapshot?.();

        const reviewsQuery =
          query(
            collection(
              db,
              REVIEWS_COLLECTION,
            ),
            where(
              'targetType',
              '==',
              'shop',
            ),
            where(
              'targetId',
              '==',
              safeShopId,
            ),
          );

        unsubscribeSnapshot =
          onSnapshot(
            reviewsQuery,

            (snapshot) => {
              if (isDisposed) {
                return;
              }

              const reviews =
                snapshot.docs
                  .map(
                    (reviewDoc) =>
                      mapShopReview(
                        reviewDoc.id,
                        reviewDoc.data(),
                        safeShopId,
                      ),
                  )
                  .sort(
                    (a, b) =>
                      getTimestampMillis(
                        b.createdAt,
                      ) -
                      getTimestampMillis(
                        a.createdAt,
                      ),
                  );

              onReviewsChange(
                reviews,
              );
            },

            (error) => {
              if (isDisposed) {
                return;
              }

              if (__DEV__) {
                console.error(
                  'SHOP_REVIEW_SUBSCRIPTION_ERROR',
                  {
                    shopId:
                      safeShopId,
                    error,
                  },
                );
              }

              onError?.(error);
            },
          );
      },
    );

  /* ---------------------------------------------
     CLEANUP
  --------------------------------------------- */

  return () => {
    isDisposed = true;

    unsubscribeSnapshot?.();

    unsubscribeSnapshot = null;

    unsubscribeAuth();
  };
}