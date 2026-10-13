import {
  httpsCallable,
} from "firebase/functions";

import {
  auth,
  functions,
} from "@/firebase/config";

/* ==============================================================
   SEARCH MODE
============================================================== */

export type SparePartSearchMode =
  | "photo"
  | "description"
  | "equipment"
  | "combined";

/* ==============================================================
   REQUEST
============================================================== */

export type SparePartIdentifyRequest = {
  imageBase64?: string;

  mimeType?: string;

  description?: string;

  equipmentId?: string;

  equipmentName?: string;

  brandId?: string;

  brandName?: string;
};

/* ==============================================================
   REASON
============================================================== */

export type SparePartIdentifyReason =
  | "unclear_image"
  | "unclear_request"
  | "not_spare_part"
  | null;

/* ==============================================================
   RESPONSE
============================================================== */

export type SparePartIdentifyResponse = {
  success: boolean;

  completed: boolean;

  identified: boolean;

  rejected: boolean;

  mode: SparePartSearchMode;

  reason: SparePartIdentifyReason;

  message: string;

  partName: string;

  equipmentId: string;

  equipmentName: string;

  brandId: string;

  brandName: string;

  category: string;

  searchQuery: string;

  keywords: string[];

  confidence: number;
};

/* ==============================================================
   LOCAL ERROR
============================================================== */

export class SparePartRequestError
  extends Error {
  readonly code: string;

  constructor(
    code: string,
    message: string,
  ) {
    super(
      message,
    );

    this.name =
      "SparePartRequestError";

    this.code =
      code;
  }
}

/* ==============================================================
   CONFIG
============================================================== */

const MAX_IMAGE_BASE64_LENGTH =
  6_000_000;

const MAX_DESCRIPTION_LENGTH =
  1500;

const MAX_HINT_LENGTH =
  250;

const MAX_ID_LENGTH =
  200;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/* ==============================================================
   FIREBASE CALLABLE
============================================================== */

const identifySparePartCallable =
  httpsCallable<
    SparePartIdentifyRequest,
    SparePartIdentifyResponse
  >(
    functions,
    "identifySparePart",
    {
      timeout:
        60_000,
    },
  );

/* ==============================================================
   HELPERS
============================================================== */

function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function isSparePartSearchMode(
  value: unknown,
): value is SparePartSearchMode {
  return (
    value === "photo" ||
    value === "description" ||
    value === "equipment" ||
    value === "combined"
  );
}

function isSparePartReason(
  value: unknown,
): value is SparePartIdentifyReason {
  return (
    value === null ||
    value === "unclear_image" ||
    value === "unclear_request" ||
    value === "not_spare_part"
  );
}

function isFiniteConfidence(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= 0 &&
    value <= 1
  );
}

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(
      value,
    ) &&
    value.every(
      (item) =>
        typeof item ===
        "string",
    )
  );
}

function isFirebaseCallableError(
  error: unknown,
): error is {
  code: string;

  message?: string;

  details?: unknown;
} {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return false;
  }

  return (
    typeof (
      error as {
        code?: unknown;
      }
    ).code ===
    "string"
  );
}

/* ==============================================================
   PUBLIC REQUEST
============================================================== */

export async function identifySparePart(
  request:
    SparePartIdentifyRequest,
): Promise<
  SparePartIdentifyResponse
> {
  /* ============================================================
     NORMALIZE
  ============================================================ */

  const imageBase64 =
    normalizeString(
      request.imageBase64,
    );

  const mimeType =
    normalizeString(
      request.mimeType,
    ).toLowerCase();

  const description =
    normalizeString(
      request.description,
    );

  const equipmentId =
    normalizeString(
      request.equipmentId,
    );

  const equipmentName =
    normalizeString(
      request.equipmentName,
    );

  const brandId =
    normalizeString(
      request.brandId,
    );

  const brandName =
    normalizeString(
      request.brandName,
    );

  /* ============================================================
     SEARCH INPUT
  ============================================================ */

  const hasImage =
    Boolean(
      imageBase64,
    );

  const hasDescription =
    Boolean(
      description,
    );

  const hasEquipmentContext =
    Boolean(
      equipmentId ||
      equipmentName ||
      brandId ||
      brandName,
    );

  if (
    !hasImage &&
    !hasDescription &&
    !hasEquipmentContext
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "Please add a photo, describe the spare part, or select your equipment.",
    );
  }

  /* ============================================================
     DESCRIPTION VALIDATION
  ============================================================ */

  if (
    description.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      `Please keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`,
    );
  }

  /* ============================================================
     EQUIPMENT VALIDATION
  ============================================================ */

  if (
    equipmentId.length >
    MAX_ID_LENGTH
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "The selected equipment is invalid.",
    );
  }

  if (
    equipmentName.length >
    MAX_HINT_LENGTH
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "The selected equipment name is too long.",
    );
  }

  if (
    brandId.length >
    MAX_ID_LENGTH
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "The selected brand is invalid.",
    );
  }

  if (
    brandName.length >
    MAX_HINT_LENGTH
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "The selected brand name is too long.",
    );
  }

  /* ============================================================
     IMAGE VALIDATION
  ============================================================ */

  if (
    imageBase64.length >
    MAX_IMAGE_BASE64_LENGTH
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "The selected photo is too large. Please choose a smaller photo.",
    );
  }

  if (
    hasImage &&
    !mimeType
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "The selected photo format could not be identified.",
    );
  }

  if (
    hasImage &&
    !ALLOWED_IMAGE_TYPES.includes(
      mimeType as
        (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    throw new SparePartRequestError(
      "functions/invalid-argument",
      "Please use a JPEG, PNG, or WebP photo.",
    );
  }

  /* ============================================================
     AUTHENTICATION
  ============================================================ */

  const currentUser =
    auth.currentUser;

  if (
    !currentUser
  ) {
    throw new SparePartRequestError(
      "functions/unauthenticated",
      "Please sign in before using Fixxam spare-part search.",
    );
  }

  try {
    /* ==========================================================
       REFRESH AUTH TOKEN
    ========================================================== */

    await currentUser.getIdToken();

    /* ==========================================================
       PAYLOAD
    ========================================================== */

    const payload:
      SparePartIdentifyRequest =
      {
        imageBase64:
          imageBase64 ||
          undefined,

        mimeType:
          mimeType ||
          undefined,

        description:
          description ||
          undefined,

        equipmentId:
          equipmentId ||
          undefined,

        equipmentName:
          equipmentName ||
          undefined,

        brandId:
          brandId ||
          undefined,

        brandName:
          brandName ||
          undefined,
      };

    /* ==========================================================
       SAFE DEV LOG
    ========================================================== */

    if (__DEV__) {
      console.log(
        "[SPARE_PART_AI] Calling identifySparePart",
        {
          hasImage,

          hasDescription,

          hasEquipmentContext,

          equipmentId:
            equipmentId ||
            null,

          equipmentName:
            equipmentName ||
            null,

          brandId:
            brandId ||
            null,

          brandName:
            brandName ||
            null,
        },
      );
    }

    /* ==========================================================
       CALL FUNCTION
    ========================================================== */

    const response =
      await identifySparePartCallable(
        payload,
      );

    const data =
      response.data;

    /* ==========================================================
       RESPONSE OBJECT
    ========================================================== */

    if (
      !data ||
      typeof data !==
        "object"
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "Fixxam returned an invalid spare-part search response.",
      );
    }

    /* ==========================================================
       BASE VALIDATION
    ========================================================== */

    if (
      typeof data.success !==
        "boolean" ||
      typeof data.completed !==
        "boolean" ||
      typeof data.identified !==
        "boolean" ||
      typeof data.rejected !==
        "boolean"
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "The spare-part search response is incomplete.",
      );
    }

    if (
      !isSparePartSearchMode(
        data.mode,
      )
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "The spare-part search returned an invalid search mode.",
      );
    }

    if (
      !isSparePartReason(
        data.reason,
      )
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "The spare-part search returned an invalid reason.",
      );
    }

    if (
      typeof data.message !==
      "string"
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "The spare-part search response is missing a message.",
      );
    }

    if (
      typeof data.partName !==
        "string" ||
      typeof data.equipmentId !==
        "string" ||
      typeof data.equipmentName !==
        "string" ||
      typeof data.brandId !==
        "string" ||
      typeof data.brandName !==
        "string" ||
      typeof data.category !==
        "string" ||
      typeof data.searchQuery !==
        "string"
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "The spare-part search response contains invalid product information.",
      );
    }

    if (
      !isStringArray(
        data.keywords,
      )
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "The spare-part search returned invalid search keywords.",
      );
    }

    if (
      !isFiniteConfidence(
        data.confidence,
      )
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "The spare-part search returned an invalid confidence value.",
      );
    }

    /* ==========================================================
       COMPLETED VALIDATION
    ========================================================== */

    if (
      data.completed &&
      !data.rejected
    ) {
      const hasUsefulSearch =
        Boolean(
          data.searchQuery.trim() ||
          data.partName.trim() ||
          data.equipmentId.trim() ||
          data.equipmentName.trim() ||
          data.brandId.trim() ||
          data.brandName.trim(),
        );

      if (
        !hasUsefulSearch
      ) {
        throw new SparePartRequestError(
          "functions/internal",
          "Fixxam could not prepare useful spare-part search information.",
        );
      }
    }

    /* ==========================================================
       IDENTIFIED VALIDATION
    ========================================================== */

    if (
      data.identified &&
      !data.partName.trim()
    ) {
      throw new SparePartRequestError(
        "functions/internal",
        "Fixxam identified a spare part but did not return its name.",
      );
    }

    /* ==========================================================
       DEV RESPONSE
    ========================================================== */

    if (__DEV__) {
      console.log(
        "[SPARE_PART_AI] Response",
        {
          success:
            data.success,

          completed:
            data.completed,

          identified:
            data.identified,

          rejected:
            data.rejected,

          mode:
            data.mode,

          reason:
            data.reason,

          partName:
            data.partName ||
            null,

          equipmentId:
            data.equipmentId ||
            null,

          brandId:
            data.brandId ||
            null,

          searchQuery:
            data.searchQuery ||
            null,

          keywordCount:
            data.keywords.length,

          confidence:
            data.confidence,
        },
      );
    }

    return data;
  } catch (
    error: unknown
  ) {
    /* ==========================================================
       LOCAL ERROR
    ========================================================== */

    if (
      error instanceof
      SparePartRequestError
    ) {
      throw error;
    }

    /* ==========================================================
       FIREBASE CALLABLE ERROR

       Preserve code so screen can show
       the correct user-facing state.
    ========================================================== */

    if (
      isFirebaseCallableError(
        error,
      )
    ) {
      if (__DEV__) {
        console.warn(
          "[SPARE_PART_AI] Callable failed",
          {
            code:
              error.code,

            message:
              error.message ??
              "",
          },
        );
      }

      throw error;
    }

    /* ==========================================================
       NETWORK / UNKNOWN
    ========================================================== */

    if (
      error instanceof Error
    ) {
      if (__DEV__) {
        console.warn(
          "[SPARE_PART_AI] Client error",
          {
            name:
              error.name,

            message:
              error.message,
          },
        );
      }

      const normalizedMessage =
        error.message
          .toLowerCase();

      if (
        normalizedMessage.includes(
          "network",
        ) ||
        normalizedMessage.includes(
          "failed to fetch",
        )
      ) {
        throw new SparePartRequestError(
          "functions/unavailable",
          "Unable to reach Fixxam spare-part search. Please check your connection.",
        );
      }

      throw new SparePartRequestError(
        "functions/internal",
        error.message ||
          "Unable to process this spare-part search.",
      );
    }

    throw new SparePartRequestError(
      "functions/internal",
      "Unable to process this spare-part search.",
    );
  }
}