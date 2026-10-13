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

/**
 * Internal type used only for deciding
 * which deal is the newest when legacy
 * duplicate active deals exist.
 */
type MappedActiveProductDeal = {
  deal: ActiveProductDeal;

  sortTimestamp: number;
};

/* ============================================================
   CONSTANTS
============================================================ */

/**
 * Firestore `in` queries support a limited
 * number of comparison values.
 *
 * Keep chunks predictable and within
 * the supported query limit.
 */
const FIRESTORE_IN_LIMIT =
  30;

/* ============================================================
   HELPERS
============================================================ */

/**
 * Normalize string values safely.
 */
function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/**
 * Convert Firestore timestamp-like values
 * or Date instances into a valid Date.
 */
function toDateOrNull(
  value: unknown,
): Date | null {
  if (
    value &&
    typeof value ===
      "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate ===
      "function"
  ) {
    const converted =
      (
        value as {
          toDate: () => unknown;
        }
      ).toDate();

    if (
      converted instanceof Date &&
      Number.isFinite(
        converted.getTime(),
      )
    ) {
      return converted;
    }

    return null;
  }

  if (
    value instanceof Date &&
    Number.isFinite(
      value.getTime(),
    )
  ) {
    return value;
  }

  return null;
}

/**
 * Convert timestamp-like values directly
 * into milliseconds for sorting.
 */
function toTimestampMs(
  value: unknown,
): number {
  const date =
    toDateOrNull(
      value,
    );

  if (!date) {
    return 0;
  }

  return date.getTime();
}

/**
 * Safely convert unknown values
 * into finite numbers.
 */
function toFiniteNumber(
  value: unknown,
): number | null {
  const number =
    Number(
      value,
    );

  return Number.isFinite(
    number,
  )
    ? number
    : null;
}

/* ============================================================
   MAP DEAL
============================================================ */

/**
 * Validate and map one Firestore deal.
 *
 * `sortTimestamp` is used only to resolve
 * legacy duplicate active deals.
 *
 * Priority:
 *
 * 1. updatedAt
 * 2. createdAt
 * 3. startsAt
 * 4. expiresAt
 */
function mapDeal(
  document: QueryDocumentSnapshot<DocumentData>,
): MappedActiveProductDeal | null {
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
   * Ignore deals that have
   * not started yet.
   */
  if (
    startsAt &&
    startsAt.getTime() >
      now
  ) {
    return null;
  }

  /*
   * Ignore expired deals.
   */
  if (
    expiresAt &&
    expiresAt.getTime() <=
      now
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
    originalPrice ===
      null ||
    originalPrice <= 0
  ) {
    return null;
  }

  if (
    discountedPrice ===
      null ||
    discountedPrice <= 0 ||
    discountedPrice >=
      originalPrice
  ) {
    return null;
  }

  if (
    discountPercentage ===
      null ||
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    return null;
  }

  /* ----------------------------------------------------------
     SORT TIMESTAMP
  ---------------------------------------------------------- */

  const updatedAtMs =
    toTimestampMs(
      data.updatedAt,
    );

  const createdAtMs =
    toTimestampMs(
      data.createdAt,
    );

  const startsAtMs =
    startsAt?.getTime() ??
    0;

  const expiresAtMs =
    expiresAt?.getTime() ??
    0;

  const sortTimestamp =
    Math.max(
      updatedAtMs,
      createdAtMs,
      startsAtMs,
      expiresAtMs,
    );

  /* ----------------------------------------------------------
     RETURN
  ---------------------------------------------------------- */

  return {
    deal: {
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
    },

    sortTimestamp,
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
 * If legacy duplicate active deals exist,
 * the most recently updated valid deal wins.
 */
export default async function getActiveProductDeals(
  productIds: string[],
): Promise<
  Map<
    string,
    ActiveProductDeal
  >
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
            id =>
              id.trim(),
          )
          .filter(
            Boolean,
          ),
      ),
    );

  /* ----------------------------------------------------------
     RESULT MAPS
  ---------------------------------------------------------- */

  const dealsMap =
    new Map<
      string,
      ActiveProductDeal
    >();

  const dealSortMap =
    new Map<
      string,
      number
    >();

  /* ----------------------------------------------------------
     EMPTY INPUT
  ---------------------------------------------------------- */

  if (
    normalizedIds.length ===
    0
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
      chunk.length ===
      0
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
      const mapped =
        mapDeal(
          document,
        );

      if (!mapped) {
        continue;
      }

      const {
        deal,
        sortTimestamp,
      } = mapped;

      const existingDeal =
        dealsMap.get(
          deal.productId,
        );

      /*
       * First valid active deal
       * for this product.
       */
      if (!existingDeal) {
        dealsMap.set(
          deal.productId,
          deal,
        );

        dealSortMap.set(
          deal.productId,
          sortTimestamp,
        );

        continue;
      }

      /* ------------------------------------------------------
         DUPLICATE ACTIVE DEAL

         Prefer the most recently updated/
         created active deal.
      ------------------------------------------------------ */

      const existingSortTimestamp =
        dealSortMap.get(
          deal.productId,
        ) ??
        0;

      if (
        sortTimestamp >
        existingSortTimestamp
      ) {
        dealsMap.set(
          deal.productId,
          deal,
        );

        dealSortMap.set(
          deal.productId,
          sortTimestamp,
        );

        continue;
      }

      /*
       * Final deterministic fallback:
       * if timestamps are identical/missing,
       * prefer the deal with the later expiry.
       */
      if (
        sortTimestamp ===
          existingSortTimestamp
      ) {
        const existingExpiry =
          existingDeal.expiresAt
            ?.getTime() ??
          0;

        const candidateExpiry =
          deal.expiresAt
            ?.getTime() ??
          0;

        if (
          candidateExpiry >
          existingExpiry
        ) {
          dealsMap.set(
            deal.productId,
            deal,
          );

          dealSortMap.set(
            deal.productId,
            sortTimestamp,
          );
        }
      }
    }
  }

  return dealsMap;
}