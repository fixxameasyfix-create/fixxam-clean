import { httpsCallable } from "firebase/functions";

import {
  auth,
  functions,
} from "@/firebase/config";

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
  distanceKm: number;
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

  service: AiBookingResolveService | null;

  worker: AiBookingResolveWorker | null;

  booking: AiBookingResolveBooking | null;
};

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
      timeout: 120000,
    },
  );

/* ==============================================================
   FIREBASE ERROR
============================================================== */

type FirebaseCallableError = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
};

function getFirebaseCallableError(
  error: unknown,
): FirebaseCallableError | null {
  if (
    !error ||
    typeof error !== "object"
  ) {
    return null;
  }

  return error as FirebaseCallableError;
}

/* ==============================================================
   PUBLIC REQUEST
============================================================== */

export async function resolveAiBookingRequest(
  request: AiBookingResolveRequest,
): Promise<AiBookingResolveResponse> {
  const description =
    typeof request.description === "string"
      ? request.description.trim()
      : "";

  const imageBase64 =
    typeof request.imageBase64 === "string"
      ? request.imageBase64.trim()
      : "";

  const mimeType =
    typeof request.mimeType === "string"
      ? request.mimeType.trim()
      : "";

  const address =
    typeof request.address === "string"
      ? request.address.trim()
      : "";

  /* ============================================================
     INPUT VALIDATION
  ============================================================ */

  if (
    !description &&
    !imageBase64
  ) {
    throw new Error(
      "Please describe the problem or provide a photo.",
    );
  }

  if (
    description.length > 4000
  ) {
    throw new Error(
      "Your description is too long. Please keep it under 4000 characters.",
    );
  }

  if (
    imageBase64 &&
    imageBase64.length > 15_000_000
  ) {
    throw new Error(
      "The selected photo is too large. Please choose a smaller photo.",
    );
  }

  /* ============================================================
     AUTHENTICATION
  ============================================================ */

  const currentUser =
    auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "Please sign in before using automatic booking.",
    );
  }

  try {
    /* ==========================================================
       REFRESH AUTH TOKEN
    ========================================================== */

    await currentUser.getIdToken(true);

    /* ==========================================================
       LOG REQUEST
    ========================================================== */

    console.log(
      "[AI_BOOKING] Calling aiBookingResolve",
      {
        uid:
          currentUser.uid,

        hasDescription:
          Boolean(description),

        hasImage:
          Boolean(imageBase64),

        mimeType:
          mimeType || null,

        hasLocation:
          typeof request.latitude ===
            "number" &&
          typeof request.longitude ===
            "number",

        hasAddress:
          Boolean(address),
      },
    );

    /* ==========================================================
       CALL CLOUD FUNCTION
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

        latitude:
          typeof request.latitude ===
          "number"
            ? request.latitude
            : undefined,

        longitude:
          typeof request.longitude ===
          "number"
            ? request.longitude
            : undefined,

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
      typeof data !== "object"
    ) {
      throw new Error(
        "Invalid AI booking response.",
      );
    }

    /* ==========================================================
       LOG RESPONSE
    ========================================================== */

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
          data.service?.id ??
          null,

        serviceName:
          data.service?.name ??
          null,

        workerId:
          data.worker?.id ??
          null,
      },
    );

    /* ==========================================================
       BASIC RESPONSE VALIDATION
    ========================================================== */

    if (
      typeof data.success !==
      "boolean"
    ) {
      throw new Error(
        "Invalid AI booking response: success is missing.",
      );
    }

    if (
      typeof data.completed !==
      "boolean"
    ) {
      throw new Error(
        "Invalid AI booking response: completed is missing.",
      );
    }

    if (
      typeof data.rejected !==
      "boolean"
    ) {
      throw new Error(
        "Invalid AI booking response: rejected is missing.",
      );
    }

    if (
      typeof data.message !==
      "string"
    ) {
      throw new Error(
        "Invalid AI booking response: message is missing.",
      );
    }

    /* ==========================================================
       RETURN
    ========================================================== */

    return data;
  } catch (error: unknown) {
    const firebaseError =
      getFirebaseCallableError(
        error,
      );

    const code =
      typeof firebaseError?.code ===
      "string"
        ? firebaseError.code
        : "";

    const message =
      typeof firebaseError?.message ===
      "string"
        ? firebaseError.message.trim()
        : "";

    const details =
      firebaseError?.details;

    console.error(
      "[AI_BOOKING] Firebase callable failed",
      {
        code,
        message,
        details,
        error,
      },
    );

    /* ==========================================================
       AUTH
    ========================================================== */

    if (
      code ===
        "functions/unauthenticated" ||
      code ===
        "auth/invalid-credential"
    ) {
      throw new Error(
        "Your Firebase sign-in session is invalid or expired. Please sign in again.",
      );
    }

    /* ==========================================================
       PERMISSION
    ========================================================== */

    if (
      code ===
      "functions/permission-denied"
    ) {
      throw new Error(
        "You do not have permission to use automatic booking.",
      );
    }

    /* ==========================================================
       INVALID ARGUMENT
    ========================================================== */

    if (
      code ===
      "functions/invalid-argument"
    ) {
      throw new Error(
        message ||
          "The automatic booking request is invalid.",
      );
    }

    /* ==========================================================
       NOT FOUND
    ========================================================== */

    if (
      code ===
      "functions/not-found"
    ) {
      throw new Error(
        "The AI booking service is not deployed or is unavailable.",
      );
    }

    /* ==========================================================
       TIMEOUT
    ========================================================== */

    if (
      code ===
      "functions/deadline-exceeded"
    ) {
      throw new Error(
        "The AI booking request took too long. Please try again.",
      );
    }

    /* ==========================================================
       UNAVAILABLE
    ========================================================== */

    if (
      code ===
        "functions/unavailable" ||
      code ===
        "functions/internal"
    ) {
      throw new Error(
        message ||
          "The AI booking service is temporarily unavailable. Please try again.",
      );
    }

    /* ==========================================================
       NETWORK / UNKNOWN ERROR
    ========================================================== */

    if (message) {
      throw new Error(
        message,
      );
    }

    if (
      error instanceof Error &&
      error.message.trim()
    ) {
      throw error;
    }

    throw new Error(
      "Unable to process your booking request.",
    );
  }
}