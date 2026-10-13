import {
  getApp,
} from "firebase/app";

import {
  getFunctions,
  httpsCallable,
} from "firebase/functions";

/* ==============================================================
   TYPES
============================================================== */

type CreateWorkerBookingCallRequest = {
  bookingId: string;
};

type CreateWorkerBookingCallResponse = {
  callId: string;
};

/* ==============================================================
   FIREBASE FUNCTIONS
============================================================== */

const functions =
  getFunctions(
    getApp(),
  );

const createWorkerBookingCallCallable =
  httpsCallable<
    CreateWorkerBookingCallRequest,
    CreateWorkerBookingCallResponse
  >(
    functions,
    "createWorkerBookingCall",
  );

/* ==============================================================
   CREATE CALL
============================================================== */

export async function createWorkerBookingCall(
  bookingId: string,
): Promise<string> {
  const normalizedBookingId =
    bookingId.trim();

  if (
    !normalizedBookingId ||
    normalizedBookingId.length > 128 ||
    normalizedBookingId.includes("/")
  ) {
    throw new Error(
      "A valid bookingId is required.",
    );
  }

  const result =
    await createWorkerBookingCallCallable({
      bookingId:
        normalizedBookingId,
    });

  const callId =
    typeof result.data?.callId ===
      "string"
      ? result.data.callId.trim()
      : "";

  if (!callId) {
    throw new Error(
      "The call session could not be created.",
    );
  }

  return callId;
}