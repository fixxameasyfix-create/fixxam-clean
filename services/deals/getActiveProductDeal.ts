import {
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  dealsCollection,
} from "@/firebase/collections/deals";

/* ============================================================
   TYPES
============================================================ */

export type ActiveProductDeal = {
  id: string;

  productId: string;

  workerId: string;

  originalPrice: number;

  discountedPrice: number;

  discountPercentage: number;

  status: "active";

  startsAt: Date | null;

  expiresAt: Date | null;
};

/* ============================================================
   CONSTANTS
============================================================ */

/**
 * Firestore `in` queries support a limited
 * number of comparison values.
 *
 * Keep this below the platform limit so
 * the service remains safe and predictable.
 */
const FIRESTORE_IN_LIMIT = 30;

/* ============================================================
   HELPERS
============================================================ */

/**
 * Normalize string values safely.
 */
function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/**
 * Convert a Firestore timestamp-like
 * value into a Date.
 */
function toDateOrNull(
  value: unknown,
): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    const date = (
      value as {
        toDate: () => unknown;
      }
    ).toDate();

    return date instanceof Date &&
      Number.isFinite(
        date.getTime(),
      )
      ? date
      : null;
  }

  /*
   * Also support an already-created Date.
   */
  if (value instanceof Date) {
    return Number.isFinite(
      value.getTime(),
    )
      ? value
      : null;
  }

  return null;
}

/**
 * Safely convert a value to a finite number.
 */
function toFiniteNumber(
  value: unknown,
): number | null {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

/**
 * Validate an active deal.
 */
function mapDeal(
  document: QueryDocumentSnapshot<DocumentData>,
): ActiveProductDeal | null {
  const data =
    document.data();

  /* ----------------------------------------------------------
     IDS
  ---------------------------------------------------------- */

  const productId =
    normalizeString(
      data.productId,
    );

  const workerId =
    normalizeString(
      data.workerId,
    );

  if (!productId) {
    return null;
  }

  if (!workerId) {
    return null;
  }

  /* ----------------------------------------------------------
     DATES
  ---------------------------------------------------------- */

  const startsAt =
    toDateOrNull(
      data.startsAt,
    );

  const expiresAt =
    toDateOrNull(
      data.expiresAt,
    );

  const now =
    Date.now();

  /*
   * Deal has not started yet.
   */
  if (
    startsAt &&
    startsAt.getTime() > now
  ) {
    return null;
  }

  /*
   * Deal has already expired.
   */
  if (
    expiresAt &&
    expiresAt.getTime() <= now
  ) {
    return null;
  }

  /* ----------------------------------------------------------
     PRICES
  ---------------------------------------------------------- */

  const originalPrice =
    toFiniteNumber(
      data.originalPrice,
    );

  const discountedPrice =
    toFiniteNumber(
      data.discountedPrice,
    );

  const discountPercentage =
    toFiniteNumber(
      data.discountPercentage,
    );

  if (
    originalPrice === null ||
    originalPrice <= 0
  ) {
    return null;
  }

  if (
    discountedPrice === null ||
    discountedPrice <= 0 ||
    discountedPrice >=
      originalPrice
  ) {
    return null;
  }

  if (
    discountPercentage === null ||
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    return null;
  }

  /* ----------------------------------------------------------
     RETURN
  ---------------------------------------------------------- */

  return {
    id:
      document.id,

    productId,

    workerId,

    originalPrice,

    discountedPrice,

    discountPercentage,

    status:
      "active",

    startsAt,

    expiresAt,
  };
}

/* ============================================================
   GET ACTIVE PRODUCT DEALS
============================================================ */

/**
 * Fetch active product deals for multiple
 * product IDs.
 *
 * Returns:
 *
 * Map<productId, ActiveProductDeal>
 *
 * Example:
 *
 * const deals =
 *   await getActiveProductDeals([
 *     "product-1",
 *     "product-2",
 *   ]);
 *
 * const deal =
 *   deals.get("product-1") ?? null;
 */
export default async function getActiveProductDeals(
  productIds: string[],
): Promise<
  Map<string, ActiveProductDeal>
> {
  /* ----------------------------------------------------------
     NORMALIZE IDS
  ---------------------------------------------------------- */

  const normalizedIds =
    Array.from(
      new Set(
        productIds
          .filter(
            (
              id,
            ): id is string =>
              typeof id ===
              "string",
          )
          .map(
            (id) =>
              id.trim(),
          )
          .filter(Boolean),
      ),
    );

  /* ----------------------------------------------------------
     EMPTY INPUT
  ---------------------------------------------------------- */

  const dealsMap =
    new Map<
      string,
      ActiveProductDeal
    >();

  if (
    normalizedIds.length === 0
  ) {
    return dealsMap;
  }

  /* ----------------------------------------------------------
     FIRESTORE CHUNKS
  ---------------------------------------------------------- */

  for (
    let index = 0;
    index <
    normalizedIds.length;
    index +=
      FIRESTORE_IN_LIMIT
  ) {
    const chunk =
      normalizedIds.slice(
        index,
        index +
          FIRESTORE_IN_LIMIT,
      );

    if (
      chunk.length === 0
    ) {
      continue;
    }

    /* --------------------------------------------------------
       QUERY
    -------------------------------------------------------- */

    const dealsQuery =
      query(
        dealsCollection,

        where(
          "type",
          "==",
          "product",
        ),

        where(
          "status",
          "==",
          "active",
        ),

        where(
          "productId",
          "in",
          chunk,
        ),
      );

    const snapshot =
      await getDocs(
        dealsQuery,
      );

    /* --------------------------------------------------------
       MAP RESULTS
    -------------------------------------------------------- */

    for (
      const document of
        snapshot.docs
    ) {
      const deal =
        mapDeal(
          document,
        );

      if (!deal) {
        continue;
      }

      /*
       * If multiple active deals
       * somehow exist for one product,
       * keep the first valid result.
       */
      if (
        !dealsMap.has(
          deal.productId,
        )
      ) {
        dealsMap.set(
          deal.productId,
          deal,
        );
      }
    }
  }

  return dealsMap;
}