/* ==============================================================
   TYPES
============================================================== */

export type AiBookingErrorCode =
  | "location-unavailable"
  | "image-processing"
  | "booking-preview"
  | "invalid-response"
  | "unauthenticated"
  | "permission-denied"
  | "invalid-request"
  | "rate-limited"
  | "network"
  | "timeout"
  | "service-unavailable"
  | "unknown";

export type AiBookingErrorAction =
  | "retry"
  | "login"
  | "back";

export type AiBookingErrorState = {
  code: AiBookingErrorCode;

  title: string;

  message: string;

  action: AiBookingErrorAction;
};

/* ==============================================================
   FLOW ERROR
============================================================== */

export class AiBookingFlowError extends Error {
  readonly code: AiBookingErrorCode;

  constructor(
    code: AiBookingErrorCode,
    message?: string,
  ) {
    super(
      message ??
        code,
    );

    this.name =
      "AiBookingFlowError";

    this.code =
      code;
  }
}

/* ==============================================================
   FIREBASE CODE
============================================================== */

function getFirebaseCode(
  error: unknown,
): string {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return "";
  }

  const value =
    (
      error as {
        code?: unknown;
      }
    ).code;

  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(
      /^functions\//,
      "",
    );
}

/* ==============================================================
   ERROR MESSAGE
============================================================== */

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return (
      error.message ??
      ""
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

    if (
      typeof message ===
      "string"
    ) {
      return message;
    }
  }

  return "";
}

/* ==============================================================
   FLOW ERROR STATE
============================================================== */

function getFlowErrorState(
  error: AiBookingFlowError,
): AiBookingErrorState | null {
  switch (
    error.code
  ) {
    case "location-unavailable":
      return {
        code:
          "location-unavailable",

        title:
          "Location Required",

        message:
          "Fixxam couldn't get your location. Please turn on Location and allow Fixxam location access, then try again.",

        action:
          "back",
      };

    case "image-processing":
      return {
        code:
          "image-processing",

        title:
          "Photo Could Not Be Read",

        message:
          "We couldn't prepare that photo. Please go back and take another photo or choose a different image.",

        action:
          "back",
      };

    case "booking-preview":
      return {
        code:
          "booking-preview",

        title:
          "Booking Could Not Be Prepared",

        message:
          "Fixxam understood your request, but couldn't prepare the booking preview. Please try again.",

        action:
          "retry",
      };

    case "invalid-response":
      return {
        code:
          "invalid-response",

        title:
          "Booking Could Not Be Prepared",

        message:
          "Fixxam received an incomplete booking response. Please try again.",

        action:
          "retry",
      };

    default:
      return null;
  }
}

/* ==============================================================
   USER-FACING ERROR
============================================================== */

export function getAiBookingErrorState(
  error: unknown,
): AiBookingErrorState {
  if (
    error instanceof
    AiBookingFlowError
  ) {
    const flowState =
      getFlowErrorState(
        error,
      );

    if (flowState) {
      return flowState;
    }
  }

  const code =
    getFirebaseCode(
      error,
    );

  const message =
    getErrorMessage(
      error,
    ).toLowerCase();

  /* ============================================================
     AUTH
  ============================================================ */

  if (
    code ===
      "unauthenticated" ||
    message.includes(
      "authentication is required",
    ) ||
    message.includes(
      "login required",
    )
  ) {
    return {
      code:
        "unauthenticated",

      title:
        "Login Required",

      message:
        "Your session has expired or you're not signed in. Please login again to continue.",

      action:
        "login",
    };
  }

  /* ============================================================
     PERMISSION
  ============================================================ */

  if (
    code ===
    "permission-denied"
  ) {
    return {
      code:
        "permission-denied",

      title:
        "Request Not Allowed",

      message:
        "Fixxam couldn't complete this request with your current account permissions. Please login again and retry.",

      action:
        "login",
    };
  }

  /* ============================================================
     INVALID REQUEST
  ============================================================ */

  if (
    code ===
      "invalid-argument" ||
    code ===
      "failed-precondition" ||
    code ===
      "out-of-range"
  ) {
    return {
      code:
        "invalid-request",

      title:
        "Request Needs Attention",

      message:
        "Some information required for automatic booking is missing or invalid. Please go back and check your request.",

      action:
        "back",
    };
  }

  /* ============================================================
     RATE LIMIT / AI CREDIT
  ============================================================ */

  if (
    code ===
      "resource-exhausted" ||
    message.includes(
      "too many requests",
    ) ||
    message.includes(
      "resource exhausted",
    ) ||
    message.includes(
      "429",
    )
  ) {
    return {
      code:
        "rate-limited",

      title:
        "Service Temporarily Busy",

      message:
        "Fixxam AI is temporarily unavailable. Please wait a moment and try again.",

      action:
        "retry",
    };
  }

  /* ============================================================
     TIMEOUT
  ============================================================ */

  if (
    code ===
      "deadline-exceeded" ||
    message.includes(
      "timeout",
    ) ||
    message.includes(
      "timed out",
    )
  ) {
    return {
      code:
        "timeout",

      title:
        "Request Took Too Long",

      message:
        "The automatic booking request took longer than expected. Please try again.",

      action:
        "retry",
    };
  }

  /* ============================================================
     NETWORK
  ============================================================ */

  if (
    code ===
      "unavailable" ||
    code ===
      "network-request-failed" ||
    code ===
      "auth/network-request-failed" ||
    message.includes(
      "network request failed",
    ) ||
    message.includes(
      "network error",
    ) ||
    message.includes(
      "failed to fetch",
    )
  ) {
    return {
      code:
        "network",

      title:
        "Connection Problem",

      message:
        "Fixxam couldn't reach the service. Please check your internet connection and try again.",

      action:
        "retry",
    };
  }

  /* ============================================================
     TEMPORARY BACKEND FAILURE
  ============================================================ */

  if (
    code ===
      "internal" ||
    code ===
      "unknown" ||
    code ===
      "aborted" ||
    code ===
      "cancelled" ||
    code ===
      "not-found"
  ) {
    return {
      code:
        "service-unavailable",

      title:
        "Service Temporarily Unavailable",

      message:
        "Fixxam couldn't complete automatic booking right now. Please try again shortly.",

      action:
        "retry",
    };
  }

  /* ============================================================
     UNKNOWN
  ============================================================ */

  return {
    code:
      "unknown",

    title:
      "Something Went Wrong",

    message:
      "Fixxam couldn't complete automatic booking. Please try again.",

    action:
      "retry",
  };
}

/* ==============================================================
   SAFE DEBUG INFO
============================================================== */

export function getAiBookingErrorDebugInfo(
  error: unknown,
) {
  return {
    name:
      error instanceof Error
        ? error.name
        : "",

    code:
      getFirebaseCode(
        error,
      ),

    message:
      getErrorMessage(
        error,
      ),
  };
}