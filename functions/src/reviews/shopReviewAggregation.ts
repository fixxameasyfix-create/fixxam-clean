import {
  onDocumentWritten,
} from 'firebase-functions/v2/firestore';

import * as admin from 'firebase-admin';

const db =
  admin.firestore();

const REVIEWS_COLLECTION =
  'reviews';

const SHOPS_COLLECTION =
  'shops';

const SHOP_TARGET_TYPE =
  'shop';

const MIN_RATING = 1;
const MAX_RATING = 5;

type ReviewData = {
  targetType?: unknown;
  targetId?: unknown;
  shopId?: unknown;
  rating?: unknown;
};

function getShopId(
  data:
    | ReviewData
    | undefined,
): string | null {
  if (!data) {
    return null;
  }

  /*
   * targetId is the canonical relationship
   * for shop reviews.
   */
  if (
    data.targetType ===
      SHOP_TARGET_TYPE &&
    typeof data.targetId ===
      'string'
  ) {
    const targetId =
      data.targetId.trim();

    if (targetId) {
      return targetId;
    }
  }

  /*
   * Keep shopId as a safe fallback for
   * older/legacy review documents.
   */
  if (
    typeof data.shopId ===
    'string'
  ) {
    const shopId =
      data.shopId.trim();

    if (shopId) {
      return shopId;
    }
  }

  return null;
}

function getValidRating(
  value: unknown,
): number | null {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < MIN_RATING ||
    value > MAX_RATING
  ) {
    return null;
  }

  return value;
}

async function recalculateShopRating(
  shopId: string,
): Promise<void> {
  const reviewsSnapshot =
    await db
      .collection(
        REVIEWS_COLLECTION,
      )
      .where(
        'targetType',
        '==',
        SHOP_TARGET_TYPE,
      )
      .where(
        'targetId',
        '==',
        shopId,
      )
      .get();

  let reviewCount = 0;
  let ratingTotal = 0;

  for (
    const reviewDoc of
      reviewsSnapshot.docs
  ) {
    const review =
      reviewDoc.data();

    const rating =
      getValidRating(
        review.rating,
      );

    /*
     * Ignore malformed review documents
     * instead of corrupting the shop aggregate.
     */
    if (
      rating === null
    ) {
      continue;
    }

    reviewCount += 1;
    ratingTotal += rating;
  }

  const rating =
    reviewCount > 0
      ? Number(
          (
            ratingTotal /
            reviewCount
          ).toFixed(1),
        )
      : 0;

  await db
    .collection(
      SHOPS_COLLECTION,
    )
    .doc(shopId)
    .update({
      rating,
      reviewCount,
      updatedAt:
        admin.firestore.FieldValue
          .serverTimestamp(),
    });

  console.log(
    'FIXXAM_SHOP_REVIEW_AGGREGATION_UPDATED:',
    {
      shopId,
      rating,
      reviewCount,
    },
  );
}

/* ============================================================
   SHOP REVIEW AGGREGATION
============================================================ */

export const shopReviewAggregation =
  onDocumentWritten(
    'reviews/{reviewId}',
    async event => {
      const before =
        event.data?.before.data() as
          | ReviewData
          | undefined;

      const after =
        event.data?.after.data() as
          | ReviewData
          | undefined;

      const beforeShopId =
        getShopId(before);

      const afterShopId =
        getShopId(after);

      /*
       * Ignore worker/product reviews.
       */
      if (
        !beforeShopId &&
        !afterShopId
      ) {
        return;
      }

      /*
       * Normally these are the same because
       * shopId/targetId are immutable by rules.
       *
       * Recalculate both if a future migration
       * ever moves a review between shops.
       */
      const shopIds =
        new Set(
          [
            beforeShopId,
            afterShopId,
          ].filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
        );

      for (
        const shopId of
          shopIds
      ) {
        try {
          await recalculateShopRating(
            shopId,
          );
        } catch (error) {
          console.error(
            'FIXXAM_SHOP_REVIEW_AGGREGATION_ERROR:',
            {
              reviewId:
                event.params
                  .reviewId,
              shopId,
              error,
            },
          );

          throw error;
        }
      }
    },
  );