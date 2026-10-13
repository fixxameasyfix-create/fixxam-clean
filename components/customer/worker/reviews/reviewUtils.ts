import {
  Timestamp,
} from "firebase/firestore";

/* ==============================================================
   CONSTANTS
============================================================== */

export const MAX_VISIBLE_REVIEWS =
  3;

export const STAR_COUNT =
  5;

export const MAX_COMMENT_LENGTH =
  500;

export const MIN_COMMENT_LENGTH =
  3;

/* ==============================================================
   TYPES
============================================================== */

export type WorkerReview = {
  id: string;

  customerId: string;

  customerName: string;

  workerId: string;

  workerName: string;

  rating: number;

  comment: string;

  createdAt: Timestamp | null;
};

export type ReviewEligibility =
  | "checking"
  | "eligible"
  | "already-reviewed"
  | "ineligible";

/* ==============================================================
   STRING
============================================================== */

export function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   RATING
============================================================== */

export function normalizeRating(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

/* ==============================================================
   COUNT
============================================================== */

export function normalizeCount(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value,
    ),
  );
}

/* ==============================================================
   RATING LABEL
============================================================== */

export function getRatingLabel(
  rating: number,
): string {
  if (
    rating >= 4.5
  ) {
    return "Excellent";
  }

  if (
    rating >= 4
  ) {
    return "Very Good";
  }

  if (
    rating >= 3
  ) {
    return "Good";
  }

  if (
    rating >= 2
  ) {
    return "Fair";
  }

  if (
    rating > 0
  ) {
    return "Needs Improvement";
  }

  return "New";
}

/* ==============================================================
   SELECTED RATING LABEL
============================================================== */

export function getSelectedRatingLabel(
  rating: number,
): string {
  switch (
    rating
  ) {
    case 1:
      return "Poor";

    case 2:
      return "Fair";

    case 3:
      return "Good";

    case 4:
      return "Very Good";

    case 5:
      return "Excellent";

    default:
      return "";
  }
}

/* ==============================================================
   CUSTOMER INITIAL
============================================================== */

export function getInitial(
  name: string,
): string {
  const cleanName =
    cleanString(
      name,
    );

  if (
    !cleanName
  ) {
    return "C";
  }

  return cleanName
    .charAt(0)
    .toUpperCase();
}

/* ==============================================================
   REVIEW DATE
============================================================== */

export function formatReviewDate(
  timestamp: Timestamp | null,
): string {
  if (
    !timestamp
  ) {
    return "";
  }

  try {
    return timestamp
      .toDate()
      .toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );
  } catch {
    return "";
  }
}

/* ==============================================================
   FIRESTORE ERROR CODE
============================================================== */

export function getFirestoreCode(
  error: unknown,
): string {
  if (
    error &&
    typeof error ===
      "object" &&
    "code" in error &&
    typeof (
      error as {
        code?: unknown;
      }
    ).code ===
      "string"
  ) {
    return (
      error as {
        code: string;
      }
    ).code;
  }

  return "";
}