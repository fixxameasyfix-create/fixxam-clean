import {
  httpsCallable,
} from "firebase/functions";

import {
  auth,
  functions,
} from "@/firebase/config";

import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ==============================================================
   REQUEST
============================================================== */

export type AiBookingResolveRequest = {
  description?: string;

  imageBase64?: string;

  mimeType?: string;

  latitude?: number;

  longitude?: number;

  address?: string;
};

/* ==============================================================
   REASON
============================================================== */

export type AiBookingReason =
  | "unclear_request"
  | "unsupported_service"
  | "unclear_image"
  | "no_worker"
  | null;

/* ==============================================================
   SERVICE
============================================================== */

export type AiBookingResolveService = {
  id: string;

  name: string;

  confidence: number;

  fulfillmentMode:
    ServiceFulfillmentMode;
};

/* ==============================================================
   WORKER
============================================================== */

export type AiBookingResolveWorker = {
  id: string;

  name: string;

  photoUrl: string;

  rating: number;

  completedJobs: number;

  verified: boolean;

  distanceKm: number | null;
};

/* ==============================================================
   BOOKING
============================================================== */

export type AiBookingResolveBooking = {
  serviceId: string;

  serviceName: string;

  workerId: string;

  workerName: string;

  workerPhoto: string;

  description: string;

  photos: string[];

  address: string;

  latitude: number | null;

  longitude: number | null;

  bookingDate: string;

  bookingTime: string;

  amount: number;

  urgent: boolean;

  urgentFee: number;

  aiGenerated: boolean;

  aiConfidence: number;

  estimatePending?: boolean;
};

/* ==============================================================
   RESPONSE
============================================================== */

export type AiBookingResolveResponse = {
  success: boolean;

  completed: boolean;

  rejected: boolean;

  message: string;

  reason: AiBookingReason;

  customerDescription?: string;

  service:
    | AiBookingResolveService
    | null;

  worker:
    | AiBookingResolveWorker
    | null;

  booking:
    | AiBookingResolveBooking
    | null;
};

/* ==============================================================
   LOCAL ERROR
============================================================== */

class AiBookingRequestError extends Error {
  readonly code: string;

  constructor(
    code: string,
    message: string,
  ) {
    super(message);

    this.name =
      "AiBookingRequestError";

    this.code =
      code;
  }
}

/* ==============================================================
   FIREBASE CALLABLE
============================================================== */

const resolveAiBooking =
  httpsCallable<
    AiBookingResolveRequest,
    AiBookingResolveResponse
  >(
    functions,
    "aiBookingResolve",
    {
      timeout: 120_000,
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

function isValidLatitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value >= -180 &&
    value <= 180
  );
}

function isAiBookingReason(
  value: unknown,
): value is AiBookingReason {
  return (
    value === null ||
    value ===
      "unclear_request" ||
    value ===
      "unsupported_service" ||
    value ===
      "unclear_image" ||
    value ===
      "no_worker"
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

export async function resolveAiBookingRequest(
  request: AiBookingResolveRequest,
): Promise<AiBookingResolveResponse> {
  /* ============================================================
     NORMALIZE
  ============================================================ */

  const description =
    normalizeString(
      request.description,
    );

  const imageBase64 =
    normalizeString(
      request.imageBase64,
    );

  const mimeType =
    normalizeString(
      request.mimeType,
    );

  const address =
    normalizeString(
      request.address,
    );

  /* ============================================================
     CONTENT VALIDATION
  ============================================================ */

  if (
    !description &&
    !imageBase64
  ) {
    throw new AiBookingRequestError(
      "functions/invalid-argument",
      "Please describe the problem or provide a photo.",
    );
  }

  if (
    description.length >
    4000
  ) {
    throw new AiBookingRequestError(
      "functions/invalid-argument",
      "Your description is too long. Please keep it under 4000 characters.",
    );
  }

  /* ============================================================
     IMAGE VALIDATION
  ============================================================ */

  if (
    imageBase64 &&
    !mimeType
  ) {
    throw new AiBookingRequestError(
      "functions/invalid-argument",
      "The selected photo format could not be identified.",
    );
  }

  if (
    imageBase64 &&
    !mimeType.startsWith(
      "image/",
    )
  ) {
    throw new AiBookingRequestError(
      "functions/invalid-argument",
      "The selected file is not a supported image.",
    );
  }

  if (
    imageBase64.length >
    8_000_000
  ) {
    throw new AiBookingRequestError(
      "functions/invalid-argument",
      "The selected photo is too large. Please choose a smaller photo.",
    );
  }

  /* ============================================================
     LOCATION VALIDATION
  ============================================================ */

  const latitude =
    isValidLatitude(
      request.latitude,
    )
      ? request.latitude
      : undefined;

  const longitude =
    isValidLongitude(
      request.longitude,
    )
      ? request.longitude
      : undefined;

  if (
    (latitude === undefined) !==
    (longitude === undefined)
  ) {
    throw new AiBookingRequestError(
      "functions/invalid-argument",
      "A valid location is required for automatic booking.",
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
    throw new AiBookingRequestError(
      "functions/unauthenticated",
      "Please sign in before using automatic booking.",
    );
  }

  try {
    /* ==========================================================
       AUTH TOKEN
    ========================================================== */

    await currentUser.getIdToken();

    /* ==========================================================
       SAFE DEV LOG
    ========================================================== */

    if (__DEV__) {
      console.log(
        "[AI_BOOKING] Calling aiBookingResolve",
        {
          hasDescription:
            Boolean(
              description,
            ),

          hasImage:
            Boolean(
              imageBase64,
            ),

          mimeType:
            mimeType ||
            null,

          hasLocation:
            latitude !==
              undefined &&
            longitude !==
              undefined,

          hasAddress:
            Boolean(
              address,
            ),
        },
      );
    }

    /* ==========================================================
       CALL FUNCTION
    ========================================================== */

    const response =
      await resolveAiBooking({
        description:
          description ||
          undefined,

        imageBase64:
          imageBase64 ||
          undefined,

        mimeType:
          mimeType ||
          undefined,

        latitude,

        longitude,

        address:
          address ||
          undefined,
      });

    /* ==========================================================
       RESPONSE
    ========================================================== */

    const data =
      response.data;

    if (
      !data ||
      typeof data !==
        "object"
    ) {
      throw new AiBookingRequestError(
        "functions/internal",
        "The automatic booking service returned an invalid response.",
      );
    }

    /* ==========================================================
       BASE RESPONSE VALIDATION
    ========================================================== */

    if (
      typeof data.success !==
      "boolean"
    ) {
      throw new AiBookingRequestError(
        "functions/internal",
        "The automatic booking response is incomplete.",
      );
    }

    if (
      typeof data.completed !==
      "boolean"
    ) {
      throw new AiBookingRequestError(
        "functions/internal",
        "The automatic booking response is incomplete.",
      );
    }

    if (
      typeof data.rejected !==
      "boolean"
    ) {
      throw new AiBookingRequestError(
        "functions/internal",
        "The automatic booking response is incomplete.",
      );
    }

    if (
      typeof data.message !==
      "string"
    ) {
      throw new AiBookingRequestError(
        "functions/internal",
        "The automatic booking response is incomplete.",
      );
    }

    if (
      !isAiBookingReason(
        data.reason,
      )
    ) {
      throw new AiBookingRequestError(
        "functions/internal",
        "The automatic booking response contains an invalid reason.",
      );
    }

    /* ==========================================================
       COMPLETED RESPONSE VALIDATION
    ========================================================== */

    if (
      data.completed &&
      !data.rejected
    ) {
      /* ========================================================
         SERVICE
      ======================================================== */

      if (
        !data.service ||
        typeof data.service.id !==
          "string" ||
        !data.service.id.trim() ||
        typeof data.service.name !==
          "string" ||
        !data.service.name.trim() ||
        !isServiceFulfillmentMode(
          data.service
            .fulfillmentMode,
        )
      ) {
        throw new AiBookingRequestError(
          "functions/internal",
          "The automatic booking service did not return a valid service.",
        );
      }

      /* ========================================================
         WORKER
      ======================================================== */

      if (
        data.worker &&
        (
          typeof data.worker.id !==
            "string" ||
          !data.worker.id.trim()
        )
      ) {
        throw new AiBookingRequestError(
          "functions/internal",
          "The automatic booking service returned an invalid worker.",
        );
      }

      /* ========================================================
         BOOKING PREVIEW
      ======================================================== */

      if (
        data.booking &&
        typeof data.booking.description !==
          "string"
      ) {
        throw new AiBookingRequestError(
          "functions/internal",
          "The automatic booking preview is invalid.",
        );
      }
    }

    /* ==========================================================
       DEV RESPONSE LOG
    ========================================================== */

    if (__DEV__) {
      console.log(
        "[AI_BOOKING] Function response",
        {
          success:
            data.success,

          completed:
            data.completed,

          rejected:
            data.rejected,

          reason:
            data.reason,

          serviceId:
            data.service
              ?.id ??
            null,

          fulfillmentMode:
            data.service
              ?.fulfillmentMode ??
            null,

          workerId:
            data.worker
              ?.id ??
            null,

          hasBooking:
            Boolean(
              data.booking,
            ),

          hasCustomerDescription:
            Boolean(
              data.customerDescription
                ?.trim(),
            ),
        },
      );
    }

    return data;
  } catch (
    error: unknown
  ) {
    /* ==========================================================
       LOCAL STRUCTURED ERROR
    ========================================================== */

    if (
      error instanceof
      AiBookingRequestError
    ) {
      throw error;
    }

    /* ==========================================================
       FIREBASE CALLABLE ERROR

       IMPORTANT:
       Preserve the Firebase error object.
       AiBookingSearchScreen needs its
       original `code`.
    ========================================================== */

    if (
      isFirebaseCallableError(
        error,
      )
    ) {
      if (__DEV__) {
        console.warn(
          "[AI_BOOKING] Callable failed",
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
       NETWORK / UNKNOWN CLIENT ERROR
    ========================================================== */

    if (
      error instanceof Error
    ) {
      if (__DEV__) {
        console.warn(
          "[AI_BOOKING] Client error",
          {
            name:
              error.name,

            message:
              error.message,
          },
        );
      }

      const normalizedMessage =
        error.message.toLowerCase();

      if (
        normalizedMessage.includes(
          "network",
        ) ||
        normalizedMessage.includes(
          "failed to fetch",
        )
      ) {
        throw new AiBookingRequestError(
          "functions/unavailable",
          "Unable to reach the automatic booking service.",
        );
      }

      throw new AiBookingRequestError(
        "functions/internal",
        error.message ||
          "Unable to process your booking request.",
      );
    }

    throw new AiBookingRequestError(
      "functions/internal",
      "Unable to process your booking request.",
    );
  }
}