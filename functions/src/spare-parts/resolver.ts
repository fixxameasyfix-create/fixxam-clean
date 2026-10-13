import {
  generateSparePartAnalysis,
} from "./gemini";

import type {
  SparePartIdentifyReason,
  SparePartIdentifyRequest,
  SparePartIdentifyResponse,
  SparePartSearchMode,
} from "./types";

/* ==============================================================
   CONFIG
============================================================== */

const MIN_CONFIDENCE =
  0.6;

const MAX_KEYWORDS =
  8;

/* ==============================================================
   RAW AI
============================================================== */

type RawResult = {
  identified?: unknown;
  rejected?: unknown;

  reason?: unknown;
  message?: unknown;

  partName?: unknown;

  equipmentName?: unknown;
  brandName?: unknown;

  category?: unknown;

  searchQuery?: unknown;

  keywords?: unknown;

  confidence?: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function cleanConfidence(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function cleanReason(
  value: unknown,
): SparePartIdentifyReason {
  if (
    value === "unclear_image" ||
    value === "unclear_request" ||
    value === "not_spare_part"
  ) {
    return value;
  }

  return null;
}

function parseResult(
  raw: string,
): RawResult {
  let parsed: unknown;

  try {
    parsed =
      JSON.parse(
        raw,
      );
  } catch {
    throw new Error(
      "Invalid spare-part AI response.",
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "Invalid spare-part AI response.",
    );
  }

  return parsed as RawResult;
}

/* ==============================================================
   SEARCH MODE
============================================================== */

function getSearchMode({
  hasImage,
  hasDescription,
  hasEquipment,
}: {
  hasImage: boolean;
  hasDescription: boolean;
  hasEquipment: boolean;
}): SparePartSearchMode {
  const count =
    [
      hasImage,
      hasDescription,
      hasEquipment,
    ].filter(Boolean).length;

  if (count > 1) {
    return "combined";
  }

  if (hasImage) {
    return "photo";
  }

  if (hasDescription) {
    return "description";
  }

  return "equipment";
}

/* ==============================================================
   KEYWORDS
============================================================== */

function buildKeywords(
  values: unknown[],
): string[] {
  const seen =
    new Set<string>();

  const result: string[] =
    [];

  for (
    const value of values
  ) {
    if (
      Array.isArray(value)
    ) {
      for (
        const nestedValue of value
      ) {
        const keyword =
          cleanString(
            nestedValue,
          );

        if (!keyword) {
          continue;
        }

        const normalized =
          keyword.toLowerCase();

        if (
          seen.has(
            normalized,
          )
        ) {
          continue;
        }

        seen.add(
          normalized,
        );

        result.push(
          keyword,
        );

        if (
          result.length >=
          MAX_KEYWORDS
        ) {
          return result;
        }
      }

      continue;
    }

    const keyword =
      cleanString(
        value,
      );

    if (!keyword) {
      continue;
    }

    const normalized =
      keyword.toLowerCase();

    if (
      seen.has(
        normalized,
      )
    ) {
      continue;
    }

    seen.add(
      normalized,
    );

    result.push(
      keyword,
    );

    if (
      result.length >=
      MAX_KEYWORDS
    ) {
      break;
    }
  }

  return result;
}

/* ==============================================================
   EQUIPMENT SEARCH
============================================================== */

function buildEquipmentSearchQuery(
  brandName: string,
  equipmentName: string,
): string {
  return [
    brandName,
    equipmentName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/* ==============================================================
   RESOLVER
============================================================== */

export async function resolveSparePart(
  request: SparePartIdentifyRequest,
): Promise<
  SparePartIdentifyResponse
> {
  /* ============================================================
     INPUT
  ============================================================ */

  const imageBase64 =
    cleanString(
      request.imageBase64,
    );

  const description =
    cleanString(
      request.description,
    );

  const equipmentId =
    cleanString(
      request.equipmentId,
    );

  const suppliedEquipmentName =
    cleanString(
      request.equipmentName,
    );

  const brandId =
    cleanString(
      request.brandId,
    );

  const suppliedBrandName =
    cleanString(
      request.brandName,
    );

  const hasImage =
    Boolean(
      imageBase64,
    );

  const hasDescription =
    Boolean(
      description,
    );

  const hasEquipment =
    Boolean(
      equipmentId ||
      suppliedEquipmentName ||
      brandId ||
      suppliedBrandName,
    );

  const mode =
    getSearchMode({
      hasImage,
      hasDescription,
      hasEquipment,
    });

  /* ============================================================
     EQUIPMENT-ONLY

     No Gemini call is needed.

     The user's selection is already trusted data.
  ============================================================ */

  if (
    hasEquipment &&
    !hasImage &&
    !hasDescription
  ) {
    const searchQuery =
      buildEquipmentSearchQuery(
        suppliedBrandName,
        suppliedEquipmentName,
      );

    const keywords =
      buildKeywords([
        suppliedEquipmentName,
        suppliedBrandName,
        searchQuery,
      ]);

    return {
      success: true,

      completed: true,

      identified: false,

      rejected: false,

      mode,

      reason: null,

      message:
        suppliedEquipmentName
          ? `Finding parts for ${suppliedEquipmentName}.`
          : "Finding compatible spare parts.",

      partName: "",

      equipmentId,

      equipmentName:
        suppliedEquipmentName,

      brandId,

      brandName:
        suppliedBrandName,

      category: "",

      searchQuery,

      keywords,

      /*
       * This represents confidence in the
       * selected context, not AI diagnosis.
       */
      confidence: 1,
    };
  }

  /* ============================================================
     AI ANALYSIS

     Required for photo / description / combined flows.
  ============================================================ */

  const raw =
    await generateSparePartAnalysis(
      request,
    );

  const parsed =
    parseResult(
      raw,
    );

  const aiIdentified =
    parsed.identified ===
    true;

  const aiRejected =
    parsed.rejected ===
    true;

  const confidence =
    cleanConfidence(
      parsed.confidence,
    );

  const partName =
    cleanString(
      parsed.partName,
    );

  /*
   * User-selected equipment and brand
   * always override AI inference.
   */
  const equipmentName =
    suppliedEquipmentName ||
    cleanString(
      parsed.equipmentName,
    );

  const brandName =
    suppliedBrandName ||
    cleanString(
      parsed.brandName,
    );

  const category =
    cleanString(
      parsed.category,
    );

  const reason =
    cleanReason(
      parsed.reason,
    );

  const message =
    cleanString(
      parsed.message,
    );

  /* ============================================================
     AI COULD NOT IDENTIFY PART

     If equipment was selected, continue safely
     with equipment search instead of blocking user.
  ============================================================ */

  if (
    aiRejected ||
    !aiIdentified ||
    !partName ||
    confidence <
      MIN_CONFIDENCE
  ) {
    if (hasEquipment) {
      const searchQuery =
        buildEquipmentSearchQuery(
          suppliedBrandName,
          suppliedEquipmentName,
        );

      return {
        success: true,

        completed: true,

        identified: false,

        rejected: false,

        mode,

        reason: null,

        message:
          suppliedEquipmentName
            ? `We couldn't identify the exact part, so we're showing parts for ${suppliedEquipmentName}.`
            : "We couldn't identify the exact part, so we're showing parts for your selected equipment.",

        partName: "",

        equipmentId,

        equipmentName:
          suppliedEquipmentName,

        brandId,

        brandName:
          suppliedBrandName,

        category: "",

        searchQuery,

        keywords:
          buildKeywords([
            suppliedBrandName,
            suppliedEquipmentName,
            searchQuery,
          ]),

        confidence,
      };
    }

    const fallbackReason:
      Exclude<
        SparePartIdentifyReason,
        null
      > =
      hasImage &&
      !hasDescription
        ? "unclear_image"
        : "unclear_request";

    return {
      success: true,

      completed: false,

      identified: false,

      rejected: true,

      mode,

      reason:
        reason ??
        fallbackReason,

      message:
        message ||
        (
          fallbackReason ===
          "unclear_image"
            ? "We couldn't identify the spare part clearly. Please take a clearer photo or describe the part."
            : "We couldn't identify the spare part. Please provide more information."
        ),

      partName: "",

      equipmentId: "",

      equipmentName: "",

      brandId: "",

      brandName: "",

      category: "",

      searchQuery: "",

      keywords: [],

      confidence,
    };
  }

  /* ============================================================
     SEARCH QUERY
  ============================================================ */

  const aiSearchQuery =
    cleanString(
      parsed.searchQuery,
    );

  /*
   * When equipment is selected, build the query
   * from trusted selection + identified part.
   *
   * This prevents Gemini from inserting a
   * conflicting brand or equipment model.
   */
  const trustedSearchQuery =
    [
      brandName,
      equipmentName,
      partName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  const searchQuery =
    hasEquipment
      ? trustedSearchQuery
      : (
          aiSearchQuery ||
          trustedSearchQuery ||
          partName
        );

  /* ============================================================
     KEYWORDS
  ============================================================ */

  const keywords =
    buildKeywords([
      parsed.keywords,

      partName,

      brandName,

      equipmentName,

      category,

      searchQuery,
    ]);

  /* ============================================================
     SUCCESS
  ============================================================ */

  return {
    success: true,

    completed: true,

    identified: true,

    rejected: false,

    mode,

    reason: null,

    message:
      message ||
      `We identified ${partName}.`,

    partName,

    /*
     * IDs come ONLY from trusted
     * Fixxam selection.
     */
    equipmentId,

    equipmentName,

    brandId,

    brandName,

    category,

    searchQuery,

    keywords,

    confidence,
  };
}