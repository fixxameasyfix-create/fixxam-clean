import type {
  QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  buildServiceSearchDictionary,
} from "@/firebase/search/serviceSearchDictionary";

import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ==============================================================
   TYPES
============================================================== */

export type ServiceCardData = {
  id: string;

  name: string;
  description: string;

  categoryId: string;
  subcategoryId: string;

  /*
   * Controls where the service is performed.
   *
   * Optional because existing Firestore
   * services may not have this field yet.
   */
  fulfillmentMode?: ServiceFulfillmentMode;

  /*
   * Ionicons name stored for this service.
   */
  icon: string;

  color: string;
  backgroundColor: string;

  /*
   * Service starting/base price.
   */
  price: number;

  aliases: string[];

  keywords: string[];

  tags: string[];

  searchText: string;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_SERVICE_ICON =
  "construct-outline";

const DEFAULT_SERVICE_COLOR =
  "#2563EB";

const DEFAULT_SERVICE_BACKGROUND =
  "#EFF6FF";

/* ==============================================================
   SEARCH NORMALIZATION
============================================================== */

function normalizeSearchText(
  value: unknown,
): string {
  if (typeof value === "string") {
    return value
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(
        /[^\p{L}\p{N}\s]/gu,
        " ",
      )
      .replace(/\s+/g, " ");
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
      .trim()
      .toLowerCase();
  }

  return "";
}

/* ==============================================================
   STRING ARRAY NORMALIZATION
============================================================== */

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map(normalizeSearchText)
        .filter(Boolean),
    ),
  );
}

/* ==============================================================
   NUMBER NORMALIZATION
============================================================== */

function normalizePrice(
  value: unknown,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? Math.max(0, value)
      : 0;
  }

  if (typeof value === "string") {
    const cleaned =
      value.replace(
        /[^\d.-]/g,
        "",
      );

    const parsed =
      Number(cleaned);

    if (
      Number.isFinite(parsed)
    ) {
      return Math.max(0, parsed);
    }
  }

  return 0;
}

/* ==============================================================
   SERVICE MAPPER
============================================================== */

export function serviceMapper(
  doc: QueryDocumentSnapshot,
): ServiceCardData {
  const data = doc.data();

  /* ============================================================
     BASIC SERVICE DATA
  ============================================================ */

  const name =
    typeof data.name === "string"
      ? data.name.trim()
      : "";

  const description =
    typeof data.description ===
    "string"
      ? data.description.trim()
      : "";

  const categoryId =
    typeof data.categoryId ===
    "string"
      ? data.categoryId.trim()
      : "";

  const subcategoryId =
    typeof data.subcategoryId ===
    "string"
      ? data.subcategoryId.trim()
      : "";

  /* ============================================================
     SERVICE FULFILLMENT
  ============================================================ */

  /*
   * Service-level fulfillment is optional.
   *
   * Later, when this value is missing,
   * Fixxam can inherit the mode from:
   *
   * Service
   *   ↓
   * Subcategory
   *   ↓
   * Category
   *   ↓
   * needs_review
   */

  const fulfillmentMode =
    isServiceFulfillmentMode(
      data.fulfillmentMode,
    )
      ? data.fulfillmentMode
      : undefined;

  /* ============================================================
     SERVICE ICON
  ============================================================ */

  /*
   * The icon belongs to the SERVICE.
   *
   * Example Firestore:
   *
   * icon: "hammer-outline"
   */

  const icon =
    typeof data.icon === "string"
      ? data.icon.trim()
      : "";

  const resolvedIcon =
    icon || DEFAULT_SERVICE_ICON;

  /* ============================================================
     SERVICE PRICE
  ============================================================ */

  /*
   * Supports:
   *
   * price: 5000
   *
   * or
   *
   * price: "5000"
   *
   * or
   *
   * price: "₦5,000"
   */

  const price =
    normalizePrice(
      data.price,
    );

  /* ============================================================
     COLORS
  ============================================================ */

  const color =
    typeof data.color === "string" &&
    data.color.trim()
      ? data.color.trim()
      : DEFAULT_SERVICE_COLOR;

  const backgroundColor =
    typeof data.backgroundColor ===
      "string" &&
    data.backgroundColor.trim()
      ? data.backgroundColor.trim()
      : DEFAULT_SERVICE_BACKGROUND;

  /* ============================================================
     FIRESTORE SEARCH DATA
  ============================================================ */

  const firestoreAliases =
    normalizeStringArray(
      data.aliases,
    );

  const firestoreKeywords =
    normalizeStringArray(
      data.keywords,
    );

  const firestoreTags =
    normalizeStringArray(
      data.tags,
    );

  /* ============================================================
     GENERATED SEARCH DATA
  ============================================================ */

  const generated =
    buildServiceSearchDictionary({
      name,
      description,
      categoryId,
      subcategoryId,
    });

  /* ============================================================
     MERGE SEARCH TERMS
  ============================================================ */

  const aliases =
    Array.from(
      new Set([
        ...firestoreAliases,
        ...generated.aliases,
      ]),
    );

  const keywords =
    Array.from(
      new Set([
        ...firestoreKeywords,
        ...generated.terms,
      ]),
    );

  const tags =
    firestoreTags;

  /* ============================================================
     SEARCH TEXT
  ============================================================ */

  const searchText =
    Array.from(
      new Set(
        [
          name,
          description,
          categoryId,
          subcategoryId,

          normalizeSearchText(
            doc.id,
          ),

          ...aliases,
          ...keywords,
          ...tags,
        ]
          .map(
            normalizeSearchText,
          )
          .filter(Boolean),
      ),
    ).join(" ");

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    id: doc.id,

    name,

    description,

    categoryId,

    subcategoryId,

    /*
     * SERVICE FULFILLMENT
     */
    fulfillmentMode,

    /*
     * SERVICE ICON
     */
    icon: resolvedIcon,

    /*
     * SERVICE COLORS
     */
    color,

    backgroundColor,

    /*
     * SERVICE PRICE
     */
    price,

    aliases,

    keywords,

    tags,

    searchText,
  };
}