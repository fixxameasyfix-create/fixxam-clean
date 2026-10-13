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

type CustomerIncomingCallManagerProps = {
  customerId: string;
};

type ActionState =
  | "accepting"
  | "declining"
  | null;

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidCustomerIncomingCall(
  call: FixxamCallSession,
  customerId: string,
): boolean {
  return (
    call.calleeId === customerId &&
    call.calleeRole === "customer" &&
    call.callerRole === "worker" &&
    call.status === "ringing"
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function CustomerIncomingCallManager({
  customerId,
}: CustomerIncomingCallManagerProps) {
  const [incomingCall, setIncomingCall] =
    useState<FixxamCallSession | null>(null);

  const [action, setAction] =
    useState<ActionState>(null);

  /*
   * Prevent duplicate Accept / Decline operations.
   */
  const actionRef =
    useRef(false);

  /*
   * Tracks the currently displayed call.
   */
  const incomingCallIdRef =
    useRef("");

  /*
   * Prevent state updates after unmount.
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
     NORMALIZE CUSTOMER ID
  ========================================================== */

  const normalizedCustomerId =
    cleanString(customerId);

  /* ==========================================================
     INCOMING CALL LISTENER
  ========================================================== */

  useEffect(() => {
    if (!normalizedCustomerId) {
      setIncomingCall(null);
      incomingCallIdRef.current = "";
      actionRef.current = false;

      return;
    }

    /*
     * Clear stale state when the active customer
     * changes.
     */
    setIncomingCall(null);
    incomingCallIdRef.current = "";
    actionRef.current = false;

    const unsubscribe =
      subscribeToIncomingCalls({
        userId: normalizedCustomerId,

        role: "customer",

        onIncomingCall: (call) => {
          if (!mountedRef.current) {
            return;
          }

          /*
           * Customer should only receive:
           *
           * Worker → Customer
           */
          if (
            !isValidCustomerIncomingCall(
              call,
              normalizedCustomerId,
            )
          ) {
            return;
          }

          /*
           * Never replace the current call while
           * Accept / Decline is being processed.
           */
          if (actionRef.current) {
            return;
          }

          /*
           * Ignore duplicate Firestore snapshots
           * for the same call.
           */
          if (
            incomingCallIdRef.current ===
            call.id
          ) {
            return;
          }

          /*
           * Keep the currently displayed incoming
           * call stable if another snapshot arrives.
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
           * Do not clear the modal while an
           * Accept / Decline operation is active.
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
              "FIXXAM_CUSTOMER_INCOMING_CALL_LISTENER_ERROR:",
              error,
            );
          }
        },
      });

    return () => {
      unsubscribe();

      incomingCallIdRef.current = "";
    };
  }, [normalizedCustomerId]);

  /* ==========================================================
     ACCEPT CALL
  ========================================================== */

  const handleAccept =
    useCallback(async () => {
      const call = incomingCall;

      if (
        !call ||
        !normalizedCustomerId ||
        actionRef.current
      ) {
        return;
      }

      /*
       * Validate the call again immediately before
       * performing the Firestore mutation.
       */
      if (
        !isValidCustomerIncomingCall(
          call,
          normalizedCustomerId,
        )
      ) {
        return;
      }

      actionRef.current = true;

      setAction("accepting");

      try {
        /*
         * Firestore is the source of truth.
         */
        await acceptIncomingCall(
          call.id,
          normalizedCustomerId,
        );

        /*
         * Warm the LiveKit credential request.
         *
         * The call screen remains responsible for
         * obtaining credentials if this prefetch fails.
         */
       prefetchLiveKitCallCredentials(
  call.id,
);

        if (!mountedRef.current) {
          return;
        }

        /*
         * Clear local incoming-call state before
         * navigating to the call screen.
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
            "FIXXAM_CUSTOMER_ACCEPT_CALL_ERROR:",
            {
              callId: call.id,
              customerId:
                normalizedCustomerId,
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
      normalizedCustomerId,
    ]);

  /* ==========================================================
     DECLINE CALL
  ========================================================== */

  const handleDecline =
    useCallback(async () => {
      const call = incomingCall;

      if (
        !call ||
        !normalizedCustomerId ||
        actionRef.current
      ) {
        return;
      }

      /*
       * Validate again before changing the call state.
       */
      if (
        !isValidCustomerIncomingCall(
          call,
          normalizedCustomerId,
        )
      ) {
        return;
      }

      actionRef.current = true;

      setAction("declining");

      try {
        await declineIncomingCall(
          call.id,
          normalizedCustomerId,
        );

        if (!mountedRef.current) {
          return;
        }

        /*
         * Remove the incoming-call modal.
         */
        setIncomingCall(null);
        incomingCallIdRef.current = "";
      } catch (error) {
        if (__DEV__) {
          console.error(
            "FIXXAM_CUSTOMER_DECLINE_CALL_ERROR:",
            {
              callId: call.id,
              customerId:
                normalizedCustomerId,
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
      normalizedCustomerId,
    ]);

  /* ==========================================================
     CALLER DISPLAY DATA
  ========================================================== */

  const callerName =
    cleanString(
      incomingCall
        ?.callerSnapshot
        ?.name,
    ) || "Fixxam Worker";

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

  if (!normalizedCustomerId) {
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
  CustomerIncomingCallManager,
);