import {
  generateAiBookingResponse,
} from "./gemini";

import {
  matchCustomerService,
} from "../ai/customer-ai/service-matcher";

import {
  findNearestWorker,
} from "./nearest-worker";

import type {
  CustomerAiDiagnosis,
} from "../ai/customer-ai/types";

import type {
  AiBookingRequest,
  AiBookingResponse,
} from "./types";

/* ==============================================================
   TYPES
============================================================== */

type AiBookingReason =
  | "unclear_request"
  | "unsupported_service"
  | "unclear_image"
  | "no_worker"
  | null;

type RawAiResult = {
  serviceName?: unknown;
  confidence?: unknown;
  isServiceProblem?: unknown;
  needsMoreInformation?: unknown;
  reason?: unknown;
  suggestedNote?: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
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
    Math.min(1, value),
  );
}

function cleanBoolean(
  value: unknown,
): boolean {
  return value === true;
}

function parseResponse(
  raw: string,
): RawAiResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "Invalid AI booking response.",
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "Invalid AI booking response.",
    );
  }

  return parsed as RawAiResult;
}

function getCoordinate(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

function getUnclearReason(
  description: string,
  imageBase64: string,
): AiBookingReason {
  if (
    imageBase64 &&
    !description
  ) {
    return "unclear_image";
  }

  return "unclear_request";
}

/* ==============================================================
   RESOLVE AI BOOKING
============================================================== */

export async function resolveAiBooking(
  request: AiBookingRequest,
): Promise<AiBookingResponse> {
  /* ============================================================
     INPUT
  ============================================================ */

  const description =
    cleanString(
      request.description,
    );

  const imageBase64 =
    cleanString(
      request.imageBase64,
    );

  const address =
    cleanString(
      request.address,
    );

  if (
    !description &&
    !imageBase64
  ) {
    throw new Error(
      "Description or image is required.",
    );
  }

  /* ============================================================
     GEMINI
  ============================================================ */

  const rawResponse =
    await generateAiBookingResponse(
      request,
    );

  const aiResult =
    parseResponse(
      rawResponse,
    );

  /* ============================================================
     NORMALIZE AI
  ============================================================ */

  const serviceName =
    cleanString(
      aiResult.serviceName,
    );

  const confidence =
    cleanConfidence(
      aiResult.confidence,
    );

  const isServiceProblem =
    cleanBoolean(
      aiResult.isServiceProblem,
    );

  const needsMoreInformation =
    cleanBoolean(
      aiResult.needsMoreInformation,
    );

  const suggestedNote =
    cleanString(
      aiResult.suggestedNote,
    );

  const aiReasonMessage =
    cleanString(
      aiResult.reason,
    );

  const customerDescription =
    (
      suggestedNote ||
      description
    ).trim();

  /* ============================================================
     INVALID / NON-SERVICE
  ============================================================ */

  if (
    !isServiceProblem ||
    !serviceName
  ) {
    return {
      success: true,

      completed: false,

      rejected: true,

      message:
        aiReasonMessage ||
        "We could not identify a professional service from your request.",

      reason:
        getUnclearReason(
          description,
          imageBase64,
        ),

      customerDescription,

      service: null,

      worker: null,

      booking: null,
    };
  }

  /* ============================================================
     TRUSTED SERVICE MATCH
  ============================================================ */

  const diagnosis: CustomerAiDiagnosis = {
    response: "",

    matchedServiceId: "",

    matchedService:
      serviceName,

    confidence,

    causes: [],

    steps: [],

    estimatedCost: {
      min: 0,
      max: 0,
      currency: "NGN",
    },

    estimatedTime: "",

    safety: "",

    professionalRequired: true,

    emergency: false,
  };

  const serviceMatch =
    await matchCustomerService(
      diagnosis,
    );

  /* ============================================================
     SERVICE NOT FOUND
  ============================================================ */

  if (
    !serviceMatch.matchedServiceId
  ) {
    return {
      success: true,

      completed: false,

      rejected: true,

      message:
        "We could not match your request to a Fixxam service.",

      reason:
        "unsupported_service",

      customerDescription,

      service: null,

      worker: null,

      booking: null,
    };
  }

  /* ============================================================
     LOCATION
  ============================================================ */

  const latitude =
    getCoordinate(
      request.latitude,
    );

  const longitude =
    getCoordinate(
      request.longitude,
    );

  if (
    latitude === null ||
    longitude === null
  ) {
    return {
      success: true,

      completed: false,

      rejected: true,

      message:
        "Please allow Fixxam to access your location so we can find a nearby professional.",

      reason:
        "unclear_request",

      customerDescription,

      service: {
        id:
          serviceMatch.matchedServiceId,

        name:
          serviceMatch.matchedService,

        confidence,
      },

      worker: null,

      booking: null,
    };
  }

  /* ============================================================
     FIND NEAREST WORKER
  ============================================================ */

  const nearestWorker =
    await findNearestWorker({
      serviceId:
        serviceMatch.matchedServiceId,

      latitude,

      longitude,
    });

  /* ============================================================
     NO WORKER
  ============================================================ */

  if (!nearestWorker) {
    return {
      success: true,

      completed: false,

      rejected: true,

      message:
        `We found the ${serviceMatch.matchedService} service, but no available professional was found nearby right now.`,

      reason:
        "no_worker",

      customerDescription,

      service: {
        id:
          serviceMatch.matchedServiceId,

        name:
          serviceMatch.matchedService,

        confidence,
      },

      worker: null,

      booking: null,
    };
  }

  /* ============================================================
     BOOKING PREVIEW
  ============================================================ */

  const booking = {
    serviceId:
      serviceMatch.matchedServiceId,

    serviceName:
      serviceMatch.matchedService,

    workerId:
      nearestWorker.id,

    workerName:
      nearestWorker.name,

    workerPhoto:
      nearestWorker.photoUrl,

    description:
      customerDescription,

    /*
     * The actual local photo URI is preserved
     * by the customer app.
     *
     * Backend does not store base64 here.
     */
    photos: [],

    address,

    latitude,

    longitude,

    /*
     * AI does not schedule unless the customer
     * explicitly asks for a date/time.
     *
     * Current flow defaults to ASAP.
     */
    bookingDate: null,

    bookingTime: null,

    /*
     * Price is intentionally not decided by AI.
     */
    amount: 0,

    urgent: true,

    urgentFee: 0,

    aiGenerated: true,

    aiConfidence: confidence,
  };

  /* ============================================================
     SUCCESS
  ============================================================ */

  return {
    success: true,

    completed: true,

    rejected: false,

    message:
      "Your request is ready for review.",

    reason: null,

    customerDescription,

    service: {
      id:
        serviceMatch.matchedServiceId,

      name:
        serviceMatch.matchedService,

      confidence,
    },

    worker:
      nearestWorker,

    booking,
  };
}