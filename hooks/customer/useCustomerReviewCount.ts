import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_REVIEWS =
  50;

/* ============================================================
   HELPERS
============================================================ */

function normalizeRating(
  value: unknown,
): number {
  let rating = 0;

  if (
    typeof value === "number"
  ) {
    rating = value;
  } else if (
    typeof value === "string"
  ) {
    rating =
      Number(value);
  }

  if (
    !Number.isFinite(
      rating,
    )
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      rating,
    ),
  );
}

function isValidTargetType(
  value: unknown,
): boolean {
  return (
    value === "worker" ||
    value === "product" ||
    value === "seller" ||
    value === undefined ||
    value === null ||
    value === ""
  );
}

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerReviewCount() {
  const [
    count,
    setCount,
  ] =
    useState(0);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    const userId =
      auth.currentUser?.uid ??
      "";

    if (!userId) {
      setCount(0);
      setLoading(false);

      return;
    }

    setLoading(true);

    const reviewsQuery =
      query(
        collection(
          db,
          "reviews",
        ),

        where(
          "customerId",
          "==",
          userId,
        ),

        limit(
          MAX_REVIEWS,
        ),
      );

    const unsubscribe =
      onSnapshot(
        reviewsQuery,

        snapshot => {
          const nextCount =
            snapshot.docs.filter(
              document => {
                const data =
                  document.data();

                const customerId =
                  typeof data.customerId ===
                  "string"
                    ? data.customerId.trim()
                    : "";

                return (
                  customerId ===
                    userId &&
                  normalizeRating(
                    data.rating,
                  ) >
                    0 &&
                  isValidTargetType(
                    data.targetType,
                  )
                );
              },
            ).length;

          setCount(
            nextCount,
          );

          setLoading(
            false,
          );
        },

        error => {
          console.error(
            "CUSTOMER_REVIEW_COUNT_LISTENER_ERROR:",
            error,
          );

          setCount(0);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  return {
    count,
    loading,
  };
}