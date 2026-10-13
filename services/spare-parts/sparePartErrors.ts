/* ==============================================================
   SPARE PART ERROR PRESENTATION
============================================================== */

export type SparePartErrorPresentation = {
  title: string;

  message: string;

  retryable: boolean;
};

/* ==============================================================
   REJECTION REASON
============================================================== */

export type SparePartRejectionReason =
  | "unclear_image"
  | "unclear_request"
  | "not_spare_part"
  | null;

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

function getErrorCode(
  error: unknown,
): string {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return "";
  }

  const code =
    (
      error as {
        code?: unknown;
      }
    ).code;

  return cleanString(
    code,
  ).toLowerCase();
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return cleanString(
      error.message,
    );
  }

  if (
    error &&
    typeof error ===
      "object"
  ) {
    const message =
      (
        error as {
          message?: unknown;
        }
      ).message;

    return cleanString(
      message,
    );
  }

  return "";
}

function codeIncludes(
  code: string,
  value: string,
): boolean {
  return (
    code === value ||
    code ===
      `functions/${value}` ||
    code.endsWith(
      `/${value}`,
    )
  );
}

/* ==============================================================
   AI REJECTION PRESENTATION
============================================================== */

export function getSparePartRejectionPresentation(
  reason:
    SparePartRejectionReason,
  serverMessage?: string,
): SparePartErrorPresentation {
  const message =
    cleanString(
      serverMessage,
    );

  /* ============================================================
     UNCLEAR IMAGE
  ============================================================ */

  if (
    reason ===
    "unclear_image"
  ) {
    return {
      title:
        "Photo isn't clear enough",

      message:
        message ||
        "Fixxam couldn't clearly identify the spare part from this photo. Try taking a clearer photo or describe the part.",

      retryable:
        true,
    };
  }

  /* ============================================================
     UNCLEAR DESCRIPTION
  ============================================================ */

  if (
    reason ===
    "unclear_request"
  ) {
    return {
      title:
        "Add a little more detail",

      message:
        message ||
        "Fixxam needs more information to identify the spare part. Try adding a clearer description, photo, or equipment selection.",

      retryable:
        true,
    };
  }

  /* ============================================================
     NOT A SPARE PART
  ============================================================ */

  if (
    reason ===
    "not_spare_part"
  ) {
    return {
      title:
        "No spare part identified",

      message:
        message ||
        "This doesn't appear to be a spare-part request. Try another photo, description, or select your equipment.",

      retryable:
        true,
    };
  }

  /* ============================================================
     UNKNOWN REJECTION
  ============================================================ */

  return {
    title:
      "We couldn't identify the part",

    message:
      message ||
      "Fixxam couldn't identify the spare part. Please try again with another photo, description, or equipment selection.",

    retryable:
      true,
  };
}

/* ==============================================================
   PUBLIC ERROR PRESENTATION
============================================================== */

export function getSparePartErrorPresentation(
  error: unknown,
): SparePartErrorPresentation {
  const code =
    getErrorCode(
      error,
    );

  const message =
    getErrorMessage(
      error,
    );

  const normalizedMessage =
    message.toLowerCase();

  /* ============================================================
     AUTH
  ============================================================ */

  if (
    codeIncludes(
      code,
      "unauthenticated",
    )
  ) {
    return {
      title:
        "Sign in required",

      message:
        "Please sign in before using Fixxam spare-part search.",

      retryable:
        false,
    };
  }

  /* ============================================================
     PERMISSION
  ============================================================ */

  if (
    codeIncludes(
      code,
      "permission-denied",
    )
  ) {
    return {
      title:
        "Search unavailable",

      message:
        "Fixxam can't access the spare-part search service for this account right now.",

      retryable:
        false,
    };
  }

  /* ============================================================
     INVALID INPUT
  ============================================================ */

  if (
    codeIncludes(
      code,
      "invalid-argument",
    )
  ) {
    return {
      title:
        "Check your search",

      message:
        message ||
        "Please check your photo, description, or equipment selection and try again.",

      retryable:
        true,
    };
  }

  /* ============================================================
     AI QUOTA / CREDIT / RATE LIMIT
  ============================================================ */

  if (
    codeIncludes(
      code,
      "resource-exhausted",
    ) ||
    normalizedMessage.includes(
      "quota",
    ) ||
    normalizedMessage.includes(
      "rate limit",
    ) ||
    normalizedMessage.includes(
      "prepay credits",
    ) ||
    normalizedMessage.includes(
      "resource exhausted",
    ) ||
    normalizedMessage.includes(
      "resource_exhausted",
    )
  ) {
    return {
      title:
        "Fixxam AI is busy",

      message:
        "Spare-part identification is temporarily unavailable. Please try again shortly.",

      retryable:
        true,
    };
  }

  /* ============================================================
     TIMEOUT
  ============================================================ */

  if (
    codeIncludes(
      code,
      "deadline-exceeded",
    ) ||
    normalizedMessage.includes(
      "timed out",
    ) ||
    normalizedMessage.includes(
      "timeout",
    )
  ) {
    return {
      title:
        "Search took too long",

      message:
        "Fixxam couldn't finish the spare-part search in time. Please try again.",

      retryable:
        true,
    };
  }

  /* ============================================================
     NETWORK / SERVICE
  ============================================================ */

  if (
    codeIncludes(
      code,
      "unavailable",
    ) ||
    normalizedMessage.includes(
      "network",
    ) ||
    normalizedMessage.includes(
      "failed to fetch",
    ) ||
    normalizedMessage.includes(
      "connection",
    ) ||
    normalizedMessage.includes(
      "service unavailable",
    )
  ) {
    return {
      title:
        "Connection problem",

      message:
        "Fixxam couldn't reach the spare-part search service. Check your internet connection and try again.",

      retryable:
        true,
    };
  }

  /* ============================================================
     IMAGE NOT FOUND
  ============================================================ */

  if (
    normalizedMessage.includes(
      "image could not be found",
    ) ||
    normalizedMessage.includes(
      "selected image could not be found",
    ) ||
    normalizedMessage.includes(
      "photo could not be found",
    )
  ) {
    return {
      title:
        "Photo not available",

      message:
        "Fixxam couldn't access this photo. Please choose the photo again and retry.",

      retryable:
        true,
    };
  }

  /* ============================================================
     IMAGE TOO LARGE
  ============================================================ */

  if (
    normalizedMessage.includes(
      "photo is too large",
    ) ||
    normalizedMessage.includes(
      "image is too large",
    ) ||
    normalizedMessage.includes(
      "still too large",
    ) ||
    normalizedMessage.includes(
      "choose a smaller",
    )
  ) {
    return {
      title:
        "Photo is too large",

      message:
        "This photo is too large to process. Please take another photo or choose a smaller image.",

      retryable:
        true,
    };
  }

  /* ============================================================
     IMAGE PROCESSING
  ============================================================ */

  if (
    normalizedMessage.includes(
      "unable to prepare",
    ) ||
    normalizedMessage.includes(
      "unable to process",
    ) ||
    normalizedMessage.includes(
      "image processing",
    )
  ) {
    return {
      title:
        "Photo problem",

      message:
        "Fixxam couldn't prepare this photo. Please choose another photo and try again.",

      retryable:
        true,
    };
  }

  /* ============================================================
     FAILED PRECONDITION
  ============================================================ */

  if (
    codeIncludes(
      code,
      "failed-precondition",
    )
  ) {
    return {
      title:
        "Search not ready",

      message:
        message ||
        "Fixxam can't continue this spare-part search right now. Please check your information and try again.",

      retryable:
        true,
    };
  }

  /* ============================================================
     CANCELLED
  ============================================================ */

  if (
    codeIncludes(
      code,
      "cancelled",
    )
  ) {
    return {
      title:
        "Search cancelled",

      message:
        "The spare-part search was cancelled. You can try again.",

      retryable:
        true,
    };
  }

  /* ============================================================
     INTERNAL

     Never expose backend implementation
     details to the customer.
  ============================================================ */

  if (
    codeIncludes(
      code,
      "internal",
    )
  ) {
    return {
      title:
        "Something went wrong",

      message:
        "Fixxam couldn't complete your spare-part search. Please try again.",

      retryable:
        true,
    };
  }

  /* ============================================================
     SAFE LOCAL PHOTO ERRORS
  ============================================================ */

  if (
    message &&
    (
      normalizedMessage.includes(
        "please take another photo",
      ) ||
      normalizedMessage.includes(
        "please choose another photo",
      ) ||
      normalizedMessage.includes(
        "selected photo",
      ) ||
      normalizedMessage.includes(
        "selected image",
      )
    )
  ) {
    return {
      title:
        "Check your photo",

      message,

      retryable:
        true,
    };
  }

  /* ============================================================
     FALLBACK
  ============================================================ */

  return {
    title:
      "Something went wrong",

    message:
      "Fixxam couldn't complete your spare-part search. Please try again.",

    retryable:
      true,
  };
}