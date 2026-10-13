import type {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import type {
  AiSearchMode,
  Product,
} from "./types";

/* ==============================================================
   STRING
============================================================== */

export function normalizeString(
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
   ROUTE PARAM
============================================================== */

export function normalizeParam(
  value: unknown,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return normalizeString(
      value[0],
    );
  }

  return normalizeString(
    value,
  );
}

/* ==============================================================
   NUMBER
============================================================== */

export function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value.replace(
          /,/g,
          "",
        ),
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return fallback;
}

/* ==============================================================
   STATUS
============================================================== */

export function normalizeStatus(
  value: unknown,
  stock: number,
):
  | "active"
  | "out_of_stock" {
  if (
    value ===
    "out_of_stock"
  ) {
    return "out_of_stock";
  }

  if (
    stock <= 0
  ) {
    return "out_of_stock";
  }

  return "active";
}

/* ==============================================================
   SEARCH TEXT
============================================================== */

export function normalizeSearch(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

/* ==============================================================
   STRING ARRAY
============================================================== */

export function normalizeStringArray(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  const values =
    new Set<string>();

  for (
    const item of value
  ) {
    const normalized =
      normalizeString(
        item,
      );

    if (
      normalized
    ) {
      values.add(
        normalized,
      );
    }
  }

  return Array.from(
    values,
  );
}

/* ==============================================================
   AI MODE
============================================================== */

export function normalizeAiMode(
  value: unknown,
): AiSearchMode {
  const mode =
    normalizeString(
      value,
    );

  if (
    mode === "photo" ||
    mode === "description" ||
    mode === "equipment" ||
    mode === "combined"
  ) {
    return mode;
  }

  return "";
}

/* ==============================================================
   AI KEYWORDS
============================================================== */

export function parseAiKeywords(
  value: unknown,
): string[] {
  const raw =
    normalizeParam(
      value,
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(
        raw,
      );

    return normalizeStringArray(
      parsed,
    ).slice(
      0,
      8,
    );
  } catch {
    return [];
  }
}

/* ==============================================================
   PRICE
============================================================== */

const NGN_FORMATTER =
  new Intl.NumberFormat(
    "en-NG",
    {
      maximumFractionDigits:
        2,
    },
  );

export function formatPrice(
  value: number,
): string {
  return `₦${NGN_FORMATTER.format(
    value,
  )}`;
}

/* ==============================================================
   RATING
============================================================== */

export function normalizeRating(
  value: unknown,
): number {
  return Math.min(
    5,
    Math.max(
      0,
      normalizeNumber(
        value,
        0,
      ),
    ),
  );
}

/* ==============================================================
   COUNT
============================================================== */

export function normalizeCount(
  value: unknown,
): number {
  return Math.max(
    0,
    Math.floor(
      normalizeNumber(
        value,
        0,
      ),
    ),
  );
}

/* ==============================================================
   PRODUCT SEARCHABLE TEXT
============================================================== */

export function getProductSearchableText(
  product: Product,
): string {
  return normalizeSearch(
    [
      product.name,

      product.category,

      product.categoryId,

      product.brandId,

      product.brandName,

      product.equipmentId,

      product.equipmentName,

      product.serviceId,

      ...(product.serviceIds ??
        []),

      ...(product.equipmentIds ??
        []),

      ...(product.equipmentNames ??
        []),

      ...(product.keywords ??
        []),

      ...(product.tags ??
        []),
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      ),
  );
}

/* ==============================================================
   TOKENS
============================================================== */

export function getTokens(
  value: string,
): string[] {
  const normalized =
    normalizeSearch(
      value,
    );

  if (!normalized) {
    return [];
  }

  return Array.from(
    new Set(
      normalized
        .split(" ")
        .filter(
          (token) =>
            token.length >
            1,
        ),
    ),
  );
}

/* ==============================================================
   TOKEN MATCH
============================================================== */

export function countTokenMatches(
  searchableText: string,
  value: string,
): number {
  const tokens =
    getTokens(
      value,
    );

  let matches =
    0;

  for (
    const token of tokens
  ) {
    if (
      searchableText.includes(
        token,
      )
    ) {
      matches +=
        1;
    }
  }

  return matches;
}

/* ==============================================================
   MANUAL SEARCH
============================================================== */

export function matchesManualSearch(
  product: Product,
  search: string,
): boolean {
  const normalized =
    normalizeSearch(
      search,
    );

  if (!normalized) {
    return true;
  }

  const searchableText =
    getProductSearchableText(
      product,
    );

  if (
    searchableText.includes(
      normalized,
    )
  ) {
    return true;
  }

  const tokens =
    getTokens(
      normalized,
    );

  if (
    tokens.length ===
    0
  ) {
    return true;
  }

  return tokens.every(
    (token) =>
      searchableText.includes(
        token,
      ),
  );
}

/* ==============================================================
   EQUIPMENT IDS
============================================================== */

export function getEquipmentIds(
  product: Product,
): string[] {
  return [
    product.equipmentId,

    ...(product.equipmentIds ??
      []),
  ]
    .map(
      (value) =>
        normalizeSearch(
          value ?? "",
        ),
    )
    .filter(
      Boolean,
    );
}

/* ==============================================================
   BRAND IDS
============================================================== */

export function getBrandIds(
  product: Product,
): string[] {
  return [
    product.brandId,
  ]
    .map(
      (value) =>
        normalizeSearch(
          value ?? "",
        ),
    )
    .filter(
      Boolean,
    );
}

/* ==============================================================
   AI MATCH
============================================================== */

type CalculateAiMatchScoreParams = {
  product: Product;

  aiPartName: string;

  aiCategory: string;

  aiSearchQuery: string;

  aiKeywords: string[];

  equipmentId: string;

  equipmentName: string;

  brandId: string;

  brandName: string;
};

export function calculateAiMatchScore({
  product,
  aiPartName,
  aiCategory,
  aiSearchQuery,
  aiKeywords,
  equipmentId,
  equipmentName,
  brandId,
  brandName,
}: CalculateAiMatchScoreParams): number {
  const searchableText =
    getProductSearchableText(
      product,
    );

  const normalizedName =
    normalizeSearch(
      product.name,
    );

  let score =
    0;

  /* ============================================================
     TRUSTED EQUIPMENT ID
  ============================================================ */

  const normalizedEquipmentId =
    normalizeSearch(
      equipmentId,
    );

  if (
    normalizedEquipmentId
  ) {
    const productEquipmentIds =
      getEquipmentIds(
        product,
      );

    if (
      productEquipmentIds.length >
      0
    ) {
      if (
        productEquipmentIds.includes(
          normalizedEquipmentId,
        )
      ) {
        score +=
          120;
      } else {
        return -1;
      }
    }
  }

  /* ============================================================
     TRUSTED BRAND ID
  ============================================================ */

  const normalizedBrandId =
    normalizeSearch(
      brandId,
    );

  if (
    normalizedBrandId
  ) {
    const productBrandIds =
      getBrandIds(
        product,
      );

    if (
      productBrandIds.length >
      0
    ) {
      if (
        productBrandIds.includes(
          normalizedBrandId,
        )
      ) {
        score +=
          80;
      } else {
        return -1;
      }
    }
  }

  /* ============================================================
     PART NAME
  ============================================================ */

  const normalizedPartName =
    normalizeSearch(
      aiPartName,
    );

  if (
    normalizedPartName
  ) {
    if (
      normalizedName ===
      normalizedPartName
    ) {
      score +=
        100;
    } else if (
      normalizedName.includes(
        normalizedPartName,
      )
    ) {
      score +=
        75;
    } else if (
      searchableText.includes(
        normalizedPartName,
      )
    ) {
      score +=
        55;
    }

    score +=
      countTokenMatches(
        searchableText,
        aiPartName,
      ) *
      12;
  }

  /* ============================================================
     AI SEARCH QUERY
  ============================================================ */

  const normalizedAiQuery =
    normalizeSearch(
      aiSearchQuery,
    );

  if (
    normalizedAiQuery
  ) {
    if (
      searchableText.includes(
        normalizedAiQuery,
      )
    ) {
      score +=
        50;
    }

    score +=
      countTokenMatches(
        searchableText,
        aiSearchQuery,
      ) *
      8;
  }

  /* ============================================================
     EQUIPMENT NAME
  ============================================================ */

  const normalizedEquipmentName =
    normalizeSearch(
      equipmentName,
    );

  if (
    normalizedEquipmentName
  ) {
    if (
      searchableText.includes(
        normalizedEquipmentName,
      )
    ) {
      score +=
        45;
    }

    score +=
      countTokenMatches(
        searchableText,
        equipmentName,
      ) *
      7;
  }

  /* ============================================================
     BRAND NAME
  ============================================================ */

  const normalizedBrandName =
    normalizeSearch(
      brandName,
    );

  if (
    normalizedBrandName &&
    searchableText.includes(
      normalizedBrandName,
    )
  ) {
    score +=
      35;
  }

  /* ============================================================
     CATEGORY
  ============================================================ */

  const normalizedCategory =
    normalizeSearch(
      aiCategory,
    );

  if (
    normalizedCategory
  ) {
    const productCategory =
      normalizeSearch(
        [
          product.category,
          product.categoryId,
        ]
          .filter(
            Boolean,
          )
          .join(
            " ",
          ),
      );

    if (
      productCategory &&
      (
        productCategory.includes(
          normalizedCategory,
        ) ||
        normalizedCategory.includes(
          productCategory,
        )
      )
    ) {
      score +=
        25;
    }
  }

  /* ============================================================
     AI KEYWORDS
  ============================================================ */

  for (
    const keyword of
      aiKeywords
  ) {
    const normalizedKeyword =
      normalizeSearch(
        keyword,
      );

    if (
      !normalizedKeyword
    ) {
      continue;
    }

    if (
      normalizedName.includes(
        normalizedKeyword,
      )
    ) {
      score +=
        20;

      continue;
    }

    if (
      searchableText.includes(
        normalizedKeyword,
      )
    ) {
      score +=
        12;

      continue;
    }

    score +=
      countTokenMatches(
        searchableText,
        normalizedKeyword,
      ) *
      4;
  }

  return score;
}

/* ==============================================================
   VALID DEAL
============================================================== */

export function getValidDeal(
  product: Product,
  deal:
    | ActiveProductDeal
    | null,
): ActiveProductDeal | null {
  if (
    !deal
  ) {
    return null;
  }

  const originalPrice =
    normalizeNumber(
      product.price,
    );

  const discountedPrice =
    normalizeNumber(
      deal.discountedPrice,
    );

  const discountPercentage =
    normalizeNumber(
      deal.discountPercentage,
    );

  if (
    originalPrice <=
      0 ||
    discountedPrice <=
      0 ||
    discountedPrice >=
      originalPrice
  ) {
    return null;
  }

  if (
    discountPercentage <=
      0 ||
    discountPercentage >=
      100
  ) {
    return null;
  }

  return deal;
}