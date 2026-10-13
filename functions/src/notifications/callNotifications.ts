import {
  FieldValue,
  Timestamp,
  getFirestore,
  type DocumentReference,
} from "firebase-admin/firestore";

import {
  getFunctions,
} from "firebase-admin/functions";

import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

import {
  onTaskDispatched,
} from "firebase-functions/v2/tasks";

import {
  sendUserPushNotification,
  type NotificationRecipientRole,
} from "./sendCustomerPushNotification";

/* ============================================================
   CONFIG
============================================================ */

const REGION =
  "us-central1";

const MISSED_CALL_DELAY_SECONDS =
  30;

const TASK_DISPATCH_DEADLINE_SECONDS =
  60;

const TASK_SCHEDULE_CLAIM_LEASE_MS =
  2 * 60 * 1000;

/**
 * Must exactly match the exported
 * task function name.
 */
const EXPIRE_MISSED_CALL_TASK_NAME =
  "expireMissedCall";

/* ============================================================
   FIRESTORE
============================================================ */

const db =
  getFirestore();

/* ============================================================
   TYPES
============================================================ */

type CallRole =
  NotificationRecipientRole;

type CallStatus =
  | "ringing"
  | "accepted"
  | "connected"
  | "declined"
  | "missed"
  | "ended"
  | "failed";

type CallData =
  Record<string, unknown>;

type ValidatedCall = {
  callerId: string;

  callerRole: CallRole;

  calleeId: string;

  calleeRole: CallRole;

  status: CallStatus;

  callerName: string;

  calleeName: string;

  orderId: string;
};

type MissedCallTaskPayload = {
  callId?: unknown;
};

type MissedCallNotificationContext = {
  callId: string;

  callerId: string;

  callerRole: CallRole;

  calleeId: string;

  calleeRole: CallRole;

  callerName: string;

  orderId: string;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
  maxLength = 500,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      maxLength,
    );
}

function getCallRole(
  value: unknown,
): CallRole | null {
  if (
    value ===
      "customer" ||
    value ===
      "worker"
  ) {
    return value;
  }

  return null;
}

function getCallStatus(
  value: unknown,
): CallStatus | null {
  switch (
    value
  ) {
    case "ringing":
    case "accepted":
    case "connected":
    case "declined":
    case "missed":
    case "ended":
    case "failed":
      return value;

    default:
      return null;
  }
}

function getSnapshotName(
  value: unknown,
): string {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return "";
  }

  const snapshot =
    value as Record<
      string,
      unknown
    >;

  return cleanString(
    snapshot.name,
    120,
  );
}

function getFallbackName(
  role: CallRole,
): string {
  return role ===
    "worker"
    ? "Fixxam Worker"
    : "Fixxam Customer";
}

function getParticipantName(
  snapshot: unknown,
  role: CallRole,
): string {
  return (
    getSnapshotName(
      snapshot,
    ) ||
    getFallbackName(
      role,
    )
  );
}

/* ============================================================
   NOTIFICATION IDS
============================================================ */

function buildIncomingNotificationId(
  callId: string,
  recipientRole: CallRole,
): string {
  return [
    "call",
    callId,
    "incoming",
    recipientRole,
  ].join("_");
}

function buildMissedNotificationId(
  callId: string,
  recipientRole: CallRole,
): string {
  return [
    "call",
    callId,
    "missed",
    recipientRole,
  ].join("_");
}

function buildDeclinedNotificationId(
  callId: string,
  recipientRole: CallRole,
): string {
  return [
    "call",
    callId,
    "declined",
    recipientRole,
  ].join("_");
}

/* ============================================================
   ERROR MESSAGE
============================================================ */

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
      Error &&
    error.message
  ) {
    return error.message
      .trim()
      .slice(
        0,
        500,
      );
  }

  return "Unknown task scheduling error.";
}

/* ============================================================
   VALIDATE CALL
============================================================ */

function getValidatedCall(
  data: CallData,
): ValidatedCall | null {
  const callerId =
    cleanString(
      data.callerId,
      128,
    );

  const calleeId =
    cleanString(
      data.calleeId,
      128,
    );

  const callerRole =
    getCallRole(
      data.callerRole,
    );

  const calleeRole =
    getCallRole(
      data.calleeRole,
    );

  const status =
    getCallStatus(
      data.status,
    );

  if (
    !callerId ||
    !calleeId ||
    !callerRole ||
    !calleeRole ||
    !status
  ) {
    return null;
  }

  if (
    callerId.includes(
      "/",
    ) ||
    calleeId.includes(
      "/",
    )
  ) {
    return null;
  }

  /* ==========================================================
     SELF CALL PROTECTION
  ========================================================== */

  if (
    callerId ===
    calleeId
  ) {
    return null;
  }

  /* ==========================================================
     ROLE PROTECTION

     Current Fixxam Voice architecture:
     Customer <-> Worker only.
  ========================================================== */

  if (
    callerRole ===
    calleeRole
  ) {
    return null;
  }

  const callerName =
    getParticipantName(
      data.callerSnapshot,
      callerRole,
    );

  const calleeName =
    getParticipantName(
      data.calleeSnapshot,
      calleeRole,
    );

  return {
    callerId,

    callerRole,

    calleeId,

    calleeRole,

    status,

    callerName,

    calleeName,

    orderId:
      cleanString(
        data.orderId,
        128,
      ),
  };
}

/* ============================================================
   BASE CALL NOTIFICATION DATA
============================================================ */

function buildCallNotificationData(
  callId: string,
  call: ValidatedCall,
  action: string,
  recipientId: string,
  recipientRole: CallRole,
): Record<string, unknown> {
  const data: Record<
    string,
    unknown
  > = {
    action,

    callId,

    callerId:
      call.callerId,

    callerRole:
      call.callerRole,

    calleeId:
      call.calleeId,

    calleeRole:
      call.calleeRole,

    recipientId,

    recipientRole,
  };

  if (
    call.orderId
  ) {
    data.orderId =
      call.orderId;
  }

  return data;
}

/* ============================================================
   CLAIM MISSED CALL TASK
============================================================ */

async function claimMissedCallTaskSchedule(
  callRef: DocumentReference,
): Promise<boolean> {
  return db.runTransaction(
    async transaction => {
      const snapshot =
        await transaction.get(
          callRef,
        );

      if (
        !snapshot.exists
      ) {
        return false;
      }

      const data =
        snapshot.data() ??
        {};

      /* ======================================================
         ONLY RINGING CALLS
      ====================================================== */

      if (
        data.status !==
        "ringing"
      ) {
        return false;
      }

      /* ======================================================
         ALREADY SCHEDULED
      ====================================================== */

      if (
        data
          .missedCallTaskScheduledAt
          instanceof
          Timestamp
      ) {
        return false;
      }

      const claimedAt =
        data
          .missedCallTaskClaimedAt;

      /* ======================================================
         ANOTHER INVOCATION OWNS CLAIM
      ====================================================== */

      if (
        claimedAt instanceof
          Timestamp &&
        Date.now() -
          claimedAt.toMillis() <
          TASK_SCHEDULE_CLAIM_LEASE_MS
      ) {
        return false;
      }

      transaction.set(
        callRef,
        {
          missedCallTaskClaimedAt:
            Timestamp.now(),

          missedCallTaskScheduleAttempts:
            FieldValue.increment(
              1,
            ),

          missedCallTaskScheduleError:
            FieldValue.delete(),

          updatedAt:
            FieldValue
              .serverTimestamp(),
        },
        {
          merge:
            true,
        },
      );

      return true;
    },
  );
}

/* ============================================================
   RELEASE TASK CLAIM
============================================================ */

async function releaseMissedCallTaskScheduleClaim(
  callRef: DocumentReference,
  error: unknown,
): Promise<void> {
  try {
    await callRef.set(
      {
        missedCallTaskClaimedAt:
          FieldValue.delete(),

        missedCallTaskScheduleError:
          getErrorMessage(
            error,
          ),

        updatedAt:
          FieldValue
            .serverTimestamp(),
      },
      {
        merge:
          true,
      },
    );
  } catch (
    releaseError
  ) {
    console.error(
      "FIXXAM_CALL_TASK_CLAIM_RELEASE_ERROR:",
      releaseError,
    );
  }
}

/* ============================================================
   SCHEDULE MISSED CALL
============================================================ */

async function scheduleMissedCallTask(
  callRef: DocumentReference,
  callId: string,
): Promise<void> {
  const claimed =
    await claimMissedCallTaskSchedule(
      callRef,
    );

  if (
    !claimed
  ) {
    return;
  }

  try {
    const queue =
      getFunctions()
        .taskQueue(
          EXPIRE_MISSED_CALL_TASK_NAME,
        );

    await queue.enqueue(
      {
        callId,
      },
      {
        scheduleDelaySeconds:
          MISSED_CALL_DELAY_SECONDS,

        dispatchDeadlineSeconds:
          TASK_DISPATCH_DEADLINE_SECONDS,
      },
    );
  } catch (
    enqueueError
  ) {
    await releaseMissedCallTaskScheduleClaim(
      callRef,
      enqueueError,
    );

    throw enqueueError;
  }

  /*
   * Task has already been accepted by
   * Cloud Tasks at this point.
   *
   * Even if this metadata update fails,
   * expireMissedCall remains idempotent.
   */
  try {
    await callRef.set(
      {
        missedCallTaskScheduledAt:
          FieldValue
            .serverTimestamp(),

        missedCallTaskClaimedAt:
          FieldValue.delete(),

        missedCallTaskScheduleError:
          FieldValue.delete(),

        updatedAt:
          FieldValue
            .serverTimestamp(),
      },
      {
        merge:
          true,
      },
    );
  } catch (
    finalizeError
  ) {
    console.error(
      "FIXXAM_CALL_TASK_SCHEDULE_FINALIZE_ERROR:",
      {
        callId,

        error:
          finalizeError,
      },
    );
  }
}

/* ============================================================
   CALL CREATED
   INCOMING CALL → CALLEE
============================================================ */

export const incomingCallNotifications =
  onDocumentCreated(
    {
      document:
        "calls/{callId}",

      region:
        REGION,

      retry:
        true,

      memory:
        "256MiB",

      timeoutSeconds:
        60,
    },

    async event => {
      const snapshot =
        event.data;

      if (
        !snapshot
      ) {
        console.warn(
          "FIXXAM_CALL_CREATED_NO_SNAPSHOT",
        );

        return;
      }

      const callId =
        cleanString(
          event.params.callId,
          128,
        );

      if (
        !callId ||
        callId.includes(
          "/",
        )
      ) {
        console.warn(
          "FIXXAM_CALL_CREATED_INVALID_ID",
        );

        return;
      }

      const call =
        getValidatedCall(
          snapshot.data() ??
            {},
        );

      if (
        !call
      ) {
        console.warn(
          "FIXXAM_CALL_CREATED_INVALID_DATA",
          {
            callId,
          },
        );

        return;
      }

      /* ======================================================
         ONLY RINGING
      ====================================================== */

      if (
        call.status !==
        "ringing"
      ) {
        console.info(
          "FIXXAM_CALL_CREATED_NOT_RINGING_SKIPPED",
          {
            callId,

            status:
              call.status,
          },
        );

        return;
      }

      /* ======================================================
         INCOMING CALL BELL + PUSH
      ====================================================== */

      const notificationId =
        buildIncomingNotificationId(
          callId,
          call.calleeRole,
        );

      const notificationData =
        buildCallNotificationData(
          callId,
          call,
          "incoming_call",
          call.calleeId,
          call.calleeRole,
        );

      /*
       * Run push delivery and timeout
       * scheduling in parallel.
       *
       * Both operations are independently
       * protected against retries.
       */
      await Promise.all([
        sendUserPushNotification({
          userId:
            call.calleeId,

          recipientRole:
            call.calleeRole,

          type:
            "incoming_call",

          title:
            "Incoming call",

          message:
            `${call.callerName} is calling you on Fixxam Voice.`,

          notificationId,

          data:
            notificationData,
        }),

        scheduleMissedCallTask(
          snapshot.ref,
          callId,
        ),
      ]);

      console.info(
        "FIXXAM_INCOMING_CALL_PROCESSED",
        {
          callId,

          callerRole:
            call.callerRole,

          calleeRole:
            call.calleeRole,
        },
      );
    },
  );

/* ============================================================
   CALL STATUS UPDATED

   Currently Bell-worthy status:
   - declined

   We intentionally do not create bell items for:
   - accepted
   - connected
   - ended

   This avoids noisy call history notifications.
============================================================ */

export const callStatusNotifications =
  onDocumentUpdated(
    {
      document:
        "calls/{callId}",

      region:
        REGION,

      retry:
        true,

      memory:
        "256MiB",

      timeoutSeconds:
        60,
    },

    async event => {
      const beforeData =
        event.data
          ?.before
          .data();

      const afterData =
        event.data
          ?.after
          .data();

      if (
        !beforeData ||
        !afterData
      ) {
        return;
      }

      const callId =
        cleanString(
          event.params.callId,
          128,
        );

      if (
        !callId ||
        callId.includes(
          "/",
        )
      ) {
        return;
      }

      const before =
        getValidatedCall(
          beforeData,
        );

      const after =
        getValidatedCall(
          afterData,
        );

      if (
        !before ||
        !after
      ) {
        console.warn(
          "FIXXAM_CALL_STATUS_INVALID_DATA",
          {
            callId,
          },
        );

        return;
      }

      /* ======================================================
         NO STATUS CHANGE
      ====================================================== */

      if (
        before.status ===
        after.status
      ) {
        return;
      }

      console.info(
        "FIXXAM_CALL_STATUS_CHANGED",
        {
          callId,

          before:
            before.status,

          after:
            after.status,
        },
      );

      /* ======================================================
         CALL DECLINED

         Recipient:
         original caller

         Example:
         "Hassan declined your Fixxam Voice call."
      ====================================================== */

      if (
        after.status ===
        "declined"
      ) {
        const notificationId =
          buildDeclinedNotificationId(
            callId,
            after.callerRole,
          );

        await sendUserPushNotification({
          userId:
            after.callerId,

          recipientRole:
            after.callerRole,

          type:
            "call_update",

          title:
            "Call declined",

          message:
            `${after.calleeName} declined your Fixxam Voice call.`,

          notificationId,

          data:
            buildCallNotificationData(
              callId,
              after,
              "call_declined",
              after.callerId,
              after.callerRole,
            ),
        });

        console.info(
          "FIXXAM_CALL_DECLINED_NOTIFICATION_SENT",
          {
            callId,

            recipientRole:
              after.callerRole,
          },
        );

        return;
      }
    },
  );

/* ============================================================
   EXPIRE MISSED CALL TASK
============================================================ */

export const expireMissedCall =
  onTaskDispatched(
    {
      region:
        REGION,

      memory:
        "256MiB",

      timeoutSeconds:
        60,

      retryConfig: {
        maxAttempts:
          5,

        minBackoffSeconds:
          10,

        maxBackoffSeconds:
          60,

        maxDoublings:
          3,
      },

      rateLimits: {
        maxConcurrentDispatches:
          100,
      },
    },

    async request => {
      const payload =
        request.data as
          | MissedCallTaskPayload
          | undefined
          | null;

      const callId =
        cleanString(
          payload?.callId,
          128,
        );

      if (
        !callId ||
        callId.includes(
          "/",
        )
      ) {
        console.warn(
          "FIXXAM_MISSED_CALL_TASK_INVALID_CALL_ID",
        );

        return;
      }

      const callRef =
        db
          .collection(
            "calls",
          )
          .doc(
            callId,
          );

      /* ======================================================
         TRANSACTION

         ringing   -> missed

         accepted  -> no-op
         connected -> no-op
         declined  -> no-op
         ended     -> no-op
         failed    -> no-op
      ====================================================== */

      const missedContext =
        await db.runTransaction<
          MissedCallNotificationContext | null
        >(
          async transaction => {
            const snapshot =
              await transaction.get(
                callRef,
              );

            if (
              !snapshot.exists
            ) {
              return null;
            }

            const call =
              getValidatedCall(
                snapshot.data() ??
                  {},
              );

            if (
              !call
            ) {
              console.warn(
                "FIXXAM_MISSED_CALL_TASK_INVALID_CALL",
                {
                  callId,
                },
              );

              return null;
            }

            if (
              call.status !==
              "ringing"
            ) {
              console.info(
                "FIXXAM_MISSED_CALL_TASK_NOOP",
                {
                  callId,

                  status:
                    call.status,
                },
              );

              return null;
            }

            transaction.set(
              callRef,
              {
                status:
                  "missed",

                missedAt:
                  FieldValue
                    .serverTimestamp(),

                endedAt:
                  FieldValue
                    .serverTimestamp(),

                updatedAt:
                  FieldValue
                    .serverTimestamp(),
              },
              {
                merge:
                  true,
              },
            );

            return {
              callId,

              callerId:
                call.callerId,

              callerRole:
                call.callerRole,

              calleeId:
                call.calleeId,

              calleeRole:
                call.calleeRole,

              callerName:
                call.callerName,

              orderId:
                call.orderId,
            };
          },
        );

      if (
        !missedContext
      ) {
        return;
      }

      /* ======================================================
         MISSED CALL NOTIFICATION

         Recipient:
         original callee

         Example:
         "You have a missed call from Hassan."
      ====================================================== */

      const notificationData:
        Record<
          string,
          unknown
        > = {
          action:
            "missed_call",

          callId:
            missedContext.callId,

          callerId:
            missedContext.callerId,

          callerRole:
            missedContext.callerRole,

          calleeId:
            missedContext.calleeId,

          calleeRole:
            missedContext.calleeRole,

          recipientId:
            missedContext.calleeId,

          recipientRole:
            missedContext.calleeRole,
        };

      if (
        missedContext.orderId
      ) {
        notificationData.orderId =
          missedContext.orderId;
      }

      await sendUserPushNotification({
        userId:
          missedContext.calleeId,

        recipientRole:
          missedContext.calleeRole,

        type:
          "missed_call",

        title:
          "Missed call",

        message:
          `You have a missed call from ${missedContext.callerName}.`,

        notificationId:
          buildMissedNotificationId(
            callId,
            missedContext.calleeRole,
          ),

        data:
          notificationData,
      });

      console.info(
        "FIXXAM_CALL_MARKED_MISSED",
        {
          callId,

          callerRole:
            missedContext.callerRole,

          calleeRole:
            missedContext.calleeRole,
        },
      );
    },
  );