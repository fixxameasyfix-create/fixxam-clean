import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

const db =
  getFirestore();

/* ==============================================================
   TYPES
============================================================== */

type CreateWorkerBookingCallRequest = {
  bookingId?: unknown;
};

type CallRole =
  | "customer"
  | "worker";

type CallSnapshot = {
  name: string;
  image: string;
  service: string;
};

type BookingData = {
  workerId?: unknown;
  customerId?: unknown;

  workerName?: unknown;
  workerPhoto?: unknown;

  customerName?: unknown;
  customerPhotoURL?: unknown;

  serviceName?: unknown;

  status?: unknown;
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

function firstString(
  ...values: unknown[]
): string {
  for (const value of values) {
    const normalized =
      cleanString(value);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeImage(
  value: unknown,
): string {
  const image =
    cleanString(value);

  if (
    !image ||
    !image.startsWith("https://")
  ) {
    return "";
  }

  return image.slice(
    0,
    2048,
  );
}

function normalizeCallSnapshot(
  value: {
    name?: unknown;
    image?: unknown;
    service?: unknown;
  },
  fallbackName: string,
  fallbackService: string,
): CallSnapshot {
  const name =
    firstString(
      value.name,
      fallbackName,
    ).slice(0, 120);

  const image =
    normalizeImage(
      value.image,
    );

  const service =
    cleanString(
      value.service,
    )
      .slice(0, 160);

  return {
    name:
      name ||
      "Fixxam User",

    image,

    service,
  };
}

/* ==============================================================
   CREATE WORKER → CUSTOMER BOOKING CALL
============================================================== */

export const createWorkerBookingCall =
  onCall(
    {
      timeoutSeconds: 15,
      memory: "256MiB",
      minInstances: 1,
      cpu: 1,
      concurrency: 80,
    },
    async request => {
      /* ========================================================
         AUTH
      ======================================================== */

      const workerId =
        cleanString(
          request.auth?.uid,
        );

      if (!workerId) {
        throw new HttpsError(
          "unauthenticated",
          "You must be signed in as a worker.",
        );
      }

      /* ========================================================
         INPUT
      ======================================================== */

      const data =
        request.data as
          | CreateWorkerBookingCallRequest
          | null
          | undefined;

      const bookingId =
        cleanString(
          data?.bookingId,
        );

      if (
        !bookingId ||
        bookingId.length > 128 ||
        bookingId.includes("/")
      ) {
        throw new HttpsError(
          "invalid-argument",
          "A valid bookingId is required.",
        );
      }

      /* ========================================================
         LOAD BOOKING
      ======================================================== */

      const bookingRef =
        db
          .collection("bookings")
          .doc(bookingId);

      const bookingSnapshot =
        await bookingRef.get();

      if (
        !bookingSnapshot.exists
      ) {
        throw new HttpsError(
          "not-found",
          "This request no longer exists.",
        );
      }

      const booking =
        bookingSnapshot.data() as BookingData;

      /* ========================================================
         PARTICIPANTS
      ======================================================== */

      const bookingWorkerId =
        cleanString(
          booking.workerId,
        );

      const customerId =
        cleanString(
          booking.customerId,
        );

      if (
        !bookingWorkerId ||
        !customerId
      ) {
        throw new HttpsError(
          "failed-precondition",
          "This request does not have valid call participants.",
        );
      }

      if (
        bookingWorkerId !==
        workerId
      ) {
        throw new HttpsError(
          "permission-denied",
          "You do not have access to call this customer.",
        );
      }

      if (
        customerId ===
        workerId
      ) {
        throw new HttpsError(
          "failed-precondition",
          "You cannot call yourself.",
        );
      }

      /* ========================================================
         BOOKING STATUS
      ======================================================== */

      const status =
        cleanString(
          booking.status,
        );

      const allowedStatuses =
        new Set([
          "pending",
          "accepted",
          "in-progress",
          "in_progress",
        ]);

      if (
        !allowedStatuses.has(
          status,
        )
      ) {
        throw new HttpsError(
          "failed-precondition",
          "This request is no longer available for calling.",
        );
      }

      /* ========================================================
         SNAPSHOTS
      ======================================================== */

      const serviceName =
        firstString(
          booking.serviceName,
        ).slice(0, 160);

      const workerSnapshot =
        normalizeCallSnapshot(
          {
            name:
              booking.workerName,

            image:
              booking.workerPhoto,

            service:
              serviceName,
          },
          "Fixxam Worker",
          serviceName,
        );

      const customerSnapshot =
        normalizeCallSnapshot(
          {
            name:
              booking.customerName,

            image:
              booking.customerPhotoURL,

            service:
              serviceName,
          },
          "Fixxam Customer",
          serviceName,
        );

      /* ========================================================
         CREATE CALL
      ======================================================== */

      const callRef =
        await db
          .collection("calls")
          .add({
            callerId:
              workerId,

            callerRole:
              "worker" as CallRole,

            calleeId:
              customerId,

            calleeRole:
              "customer" as CallRole,

            orderId:
              bookingId,

            shopRequestId:
              null,

            callerSnapshot:
              workerSnapshot,

            calleeSnapshot:
              customerSnapshot,

            status:
              "ringing",

            createdAt:
              FieldValue.serverTimestamp(),

            acceptedAt:
              null,

            connectedAt:
              null,

            endedAt:
              null,

            endedBy:
              null,
          });

      console.log(
        "FIXXAM_WORKER_BOOKING_CALL_CREATED",
        {
          callId:
            callRef.id,

          bookingId,

          workerId,

          customerId,
        },
      );

      return {
        callId:
          callRef.id,
      };
    },
  );