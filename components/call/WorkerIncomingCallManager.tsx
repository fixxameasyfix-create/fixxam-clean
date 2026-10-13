import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { router } from "expo-router";

import Toast from "react-native-toast-message";

import IncomingCallModal from "@/components/call/IncomingCallModal";

import {
  acceptIncomingCall,
  declineIncomingCall,
  subscribeToIncomingCalls,
  type FixxamCallSession,
} from "@/services/calls/callSession";

import {
  prefetchLiveKitCallCredentials,
} from "@/services/calls/liveKitCall";

/* ============================================================
   TYPES
============================================================ */

type WorkerIncomingCallManagerProps = {
  workerId: string;
};

type ActionState =
  | "accepting"
  | "declining"
  | null;

/* ============================================================
   HELPERS
============================================================ */

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidWorkerIncomingCall(
  call: FixxamCallSession,
  workerId: string,
): boolean {
  return (
    call.calleeId === workerId &&
    call.calleeRole === "worker" &&
    call.callerRole === "customer" &&
    call.status === "ringing"
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerIncomingCallManager({
  workerId,
}: WorkerIncomingCallManagerProps) {
  const [incomingCall, setIncomingCall] =
    useState<FixxamCallSession | null>(null);

  const [action, setAction] =
    useState<ActionState>(null);

  /*
   * Prevent duplicate accept/decline operations.
   */
  const actionRef =
    useRef(false);

  /*
   * Tracks the currently displayed call.
   */
  const incomingCallIdRef =
    useRef("");

  /*
   * Prevents state updates after unmount.
   */
  const mountedRef =
    useRef(false);

  /* ==========================================================
     MOUNT STATE
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ==========================================================
     NORMALIZE WORKER ID
  ========================================================== */

  const normalizedWorkerId =
    cleanString(workerId);

  /* ==========================================================
     INCOMING CALL LISTENER
  ========================================================== */

  useEffect(() => {
    if (!normalizedWorkerId) {
      setIncomingCall(null);
      incomingCallIdRef.current = "";
      actionRef.current = false;

      return;
    }

    /*
     * Reset stale state whenever the active worker changes.
     */
    setIncomingCall(null);
    incomingCallIdRef.current = "";
    actionRef.current = false;

    const unsubscribe =
      subscribeToIncomingCalls({
        userId: normalizedWorkerId,

        role: "worker",

        onIncomingCall: (call) => {
          if (!mountedRef.current) {
            return;
          }

          /*
           * Worker must only receive:
           *
           * Customer → Worker
           */
          if (
            !isValidWorkerIncomingCall(
              call,
              normalizedWorkerId,
            )
          ) {
            return;
          }

          /*
           * Never replace a call while the user is
           * currently accepting or declining it.
           */
          if (actionRef.current) {
            return;
          }

          /*
           * If this exact call is already displayed,
           * ignore duplicate Firestore snapshots.
           */
          if (
            incomingCallIdRef.current ===
            call.id
          ) {
            return;
          }

          /*
           * If another incoming call is already displayed,
           * keep the current one stable.
           */
          if (
            incomingCallIdRef.current
          ) {
            return;
          }

          incomingCallIdRef.current =
            call.id;

          setAction(null);
          setIncomingCall(call);
        },

        onNoIncomingCall: () => {
          if (!mountedRef.current) {
            return;
          }

          /*
           * Do not clear the modal while an action
           * is being processed.
           */
          if (actionRef.current) {
            return;
          }

          setIncomingCall(null);
          incomingCallIdRef.current = "";
        },

        onError: (error) => {
          if (__DEV__) {
            console.error(
              "FIXXAM_WORKER_INCOMING_CALL_LISTENER_ERROR:",
              error,
            );
          }
        },
      });

    return () => {
      unsubscribe();

      incomingCallIdRef.current = "";
    };
  }, [normalizedWorkerId]);

  /* ==========================================================
     ACCEPT CALL
  ========================================================== */

  const handleAccept =
    useCallback(async () => {
      const call = incomingCall;

      if (
        !call ||
        !normalizedWorkerId ||
        actionRef.current
      ) {
        return;
      }

      /*
       * Validate the call again immediately before
       * performing the privileged Firestore operation.
       */
      if (
        !isValidWorkerIncomingCall(
          call,
          normalizedWorkerId,
        )
      ) {
        return;
      }

      actionRef.current = true;

      setAction("accepting");

      try {
        /*
         * Firestore remains the source of truth.
         *
         * If the caller has already ended/declined the call,
         * this operation should fail safely according to
         * the Firestore transaction/rules implementation.
         */
        await acceptIncomingCall(
          call.id,
          normalizedWorkerId,
        );

        /*
         * Warm up LiveKit credentials without blocking
         * navigation to the call screen.
         */
        prefetchLiveKitCallCredentials(
  call.id,
);

        if (!mountedRef.current) {
          return;
        }

        /*
         * Clear local incoming-call state before navigation.
         */
        setIncomingCall(null);
        incomingCallIdRef.current = "";

        /*
         * Open the shared voice-call screen.
         */
        router.push({
          pathname:
            "/voice-call/[callId]",

          params: {
            callId: call.id,
          },
        } as never);
      } catch (error) {
        if (__DEV__) {
          console.error(
            "FIXXAM_WORKER_ACCEPT_CALL_ERROR:",
            {
              callId: call.id,
              workerId: normalizedWorkerId,
              error,
            },
          );
        }

        if (mountedRef.current) {
          Toast.show({
            type: "error",
            text1: "Unable to answer",
            text2:
              error instanceof Error &&
              error.message
                ? error.message
                : "The call could not be answered.",
          });
        }
      } finally {
        actionRef.current = false;

        if (mountedRef.current) {
          setAction(null);
        }
      }
    }, [
      incomingCall,
      normalizedWorkerId,
    ]);

  /* ==========================================================
     DECLINE CALL
  ========================================================== */

  const handleDecline =
    useCallback(async () => {
      const call = incomingCall;

      if (
        !call ||
        !normalizedWorkerId ||
        actionRef.current
      ) {
        return;
      }

      /*
       * Validate again before changing the call state.
       */
      if (
        !isValidWorkerIncomingCall(
          call,
          normalizedWorkerId,
        )
      ) {
        return;
      }

      actionRef.current = true;

      setAction("declining");

      try {
        await declineIncomingCall(
          call.id,
          normalizedWorkerId,
        );

        if (!mountedRef.current) {
          return;
        }

        /*
         * Clear the displayed call immediately.
         */
        setIncomingCall(null);
        incomingCallIdRef.current = "";
      } catch (error) {
        if (__DEV__) {
          console.error(
            "FIXXAM_WORKER_DECLINE_CALL_ERROR:",
            {
              callId: call.id,
              workerId: normalizedWorkerId,
              error,
            },
          );
        }

        if (mountedRef.current) {
          Toast.show({
            type: "error",
            text1: "Unable to decline",
            text2:
              error instanceof Error &&
              error.message
                ? error.message
                : "The call may already have ended.",
          });
        }
      } finally {
        actionRef.current = false;

        if (mountedRef.current) {
          setAction(null);
        }
      }
    }, [
      incomingCall,
      normalizedWorkerId,
    ]);

  /* ==========================================================
     CALLER DISPLAY DATA
  ========================================================== */

  const callerName =
    cleanString(
      incomingCall
        ?.callerSnapshot
        ?.name,
    ) || "Fixxam Customer";

  const callerImage =
    cleanString(
      incomingCall
        ?.callerSnapshot
        ?.image,
    );

  const callerSubtitle =
    cleanString(
      incomingCall
        ?.callerSnapshot
        ?.service,
    ) || "Fixxam Voice Call";

  /* ==========================================================
     UI
  ========================================================== */

  if (!normalizedWorkerId) {
    return null;
  }

  return (
    <IncomingCallModal
      visible={
        Boolean(incomingCall)
      }
      callerName={callerName}
      callerImage={callerImage}
      callerSubtitle={callerSubtitle}
      accepting={
        action === "accepting"
      }
      declining={
        action === "declining"
      }
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  WorkerIncomingCallManager,
);