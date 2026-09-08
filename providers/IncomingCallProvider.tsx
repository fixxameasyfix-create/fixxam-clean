import React, {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  router,
} from "expo-router";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import IncomingCallModal from "@/components/call/IncomingCallModal";

import {
  acceptIncomingCall,
  declineIncomingCall,
  subscribeToIncomingCalls,
  type FixxamCallRole,
  type FixxamCallSession,
} from "@/services/calls/callSession";

/* ============================================================
   TYPES
============================================================ */

type CallerSnapshot = {
  name?: string;

  image?: string;

  service?: string;
};

type CallWithSnapshot =
  FixxamCallSession & {
    callerSnapshot?:
      | CallerSnapshot
      | null;
  };

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ============================================================
   GET CREATED TIME
============================================================ */

function getCallCreatedTime(
  call:
    | FixxamCallSession
    | null,
): number {
  return (
    call
      ?.createdAt
      ?.getTime() ??
    0
  );
}

/* ============================================================
   PICK LATEST CALL
============================================================ */

function getLatestIncomingCall(
  customerCall:
    | FixxamCallSession
    | null,

  workerCall:
    | FixxamCallSession
    | null,
): FixxamCallSession | null {
  if (
    customerCall &&
    !workerCall
  ) {
    return customerCall;
  }

  if (
    workerCall &&
    !customerCall
  ) {
    return workerCall;
  }

  if (
    !customerCall ||
    !workerCall
  ) {
    return null;
  }

  return (
    getCallCreatedTime(
      customerCall,
    ) >=
    getCallCreatedTime(
      workerCall,
    )
      ? customerCall
      : workerCall
  );
}

/* ============================================================
   PROVIDER
============================================================ */

export default function IncomingCallProvider({
  children,
}: PropsWithChildren) {
  /* ==========================================================
     STATE
  ========================================================== */

  const [
    incomingCall,
    setIncomingCall,
  ] =
    useState<
      FixxamCallSession | null
    >(
      null,
    );

  const [
    accepting,
    setAccepting,
  ] =
    useState(
      false,
    );

  const [
    declining,
    setDeclining,
  ] =
    useState(
      false,
    );

  /* ==========================================================
     REFS
  ========================================================== */

  const mountedRef =
    useRef(
      true,
    );

  const customerIncomingRef =
    useRef<
      FixxamCallSession | null
    >(
      null,
    );

  const workerIncomingRef =
    useRef<
      FixxamCallSession | null
    >(
      null,
    );

  /* ==========================================================
     MOUNT STATE
  ========================================================== */

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  /* ==========================================================
     SYNC LATEST INCOMING CALL
  ========================================================== */

  const syncIncomingCall =
    useCallback(() => {
      if (
        !mountedRef.current
      ) {
        return;
      }

      const latestCall =
        getLatestIncomingCall(
          customerIncomingRef.current,
          workerIncomingRef.current,
        );

      setIncomingCall(
        latestCall,
      );
    }, []);

  /* ==========================================================
     SUBSCRIBE FOR ROLE
  ========================================================== */

  const subscribeForRole =
    useCallback(
      (
        userId: string,
        role: FixxamCallRole,
      ) => {
        return subscribeToIncomingCalls({
          userId,

          role,

          onIncomingCall: (
            call,
          ) => {
            if (
              !mountedRef.current
            ) {
              return;
            }

            if (
              role ===
              "customer"
            ) {
              customerIncomingRef.current =
                call;
            } else {
              workerIncomingRef.current =
                call;
            }

            syncIncomingCall();
          },

          onNoIncomingCall:
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              if (
                role ===
                "customer"
              ) {
                customerIncomingRef.current =
                  null;
              } else {
                workerIncomingRef.current =
                  null;
              }

              syncIncomingCall();
            },

          onError: (
            error,
          ) => {
            console.error(
              "FIXXAM_INCOMING_CALL_LISTENER_ERROR:",
              {
                role,
                error,
              },
            );
          },
        });
      },
      [
        syncIncomingCall,
      ],
    );

  /* ==========================================================
     AUTH + INCOMING CALL LISTENERS
  ========================================================== */

  useEffect(() => {
    const auth =
      getAuth();

    let unsubscribeCustomer:
      | (() => void)
      | undefined;

    let unsubscribeWorker:
      | (() => void)
      | undefined;

    const cleanupCallListeners =
      () => {
        unsubscribeCustomer?.();

        unsubscribeWorker?.();

        unsubscribeCustomer =
          undefined;

        unsubscribeWorker =
          undefined;
      };

    const clearIncomingCalls =
      () => {
        customerIncomingRef.current =
          null;

        workerIncomingRef.current =
          null;

        if (
          mountedRef.current
        ) {
          setIncomingCall(
            null,
          );
        }
      };

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (
          user,
        ) => {
          cleanupCallListeners();

          clearIncomingCalls();

          if (
            !user
          ) {
            return;
          }

          /*
           * We listen to both roles because one Firebase
           * account may be operating in the customer or
           * worker side of Fixxam.
           *
           * Firestore query still verifies:
           *
           * calleeId === authenticated user ID
           * calleeRole === role
           * status === ringing
           */

          try {
            unsubscribeCustomer =
              subscribeForRole(
                user.uid,
                "customer",
              );

            unsubscribeWorker =
              subscribeForRole(
                user.uid,
                "worker",
              );
          } catch (
            error
          ) {
            console.error(
              "FIXXAM_INCOMING_CALL_SETUP_ERROR:",
              error,
            );
          }
        },
      );

    return () => {
      cleanupCallListeners();

      unsubscribeAuth();
    };
  }, [
    subscribeForRole,
  ]);

  /* ==========================================================
     ACCEPT CALL
  ========================================================== */

  const handleAccept =
    useCallback(async () => {
      const call =
        incomingCall;

      const user =
        getAuth()
          .currentUser;

      if (
        !call ||
        !user ||
        accepting ||
        declining
      ) {
        return;
      }

      setAccepting(
        true,
      );

      try {
        /* ====================================================
           ACCEPT IN FIRESTORE
        ==================================================== */

        await acceptIncomingCall(
          call.id,
          user.uid,
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        /* ====================================================
           CLEAR LOCAL MODAL
        ==================================================== */

        if (
          customerIncomingRef
            .current
            ?.id ===
          call.id
        ) {
          customerIncomingRef.current =
            null;
        }

        if (
          workerIncomingRef
            .current
            ?.id ===
          call.id
        ) {
          workerIncomingRef.current =
            null;
        }

        setIncomingCall(
          null,
        );

        /* ====================================================
           OPEN SHARED CALL ROOM
        ==================================================== */

        router.replace({
          pathname:
            "/voice-call/[callId]",

          params: {
            callId:
              call.id,
          },
        } as never);
      } catch (
        error
      ) {
        console.error(
          "FIXXAM_ACCEPT_INCOMING_CALL_ERROR:",
          {
            callId:
              call.id,

            error,
          },
        );
      } finally {
        if (
          mountedRef.current
        ) {
          setAccepting(
            false,
          );
        }
      }
    }, [
      accepting,
      declining,
      incomingCall,
    ]);

  /* ==========================================================
     DECLINE CALL
  ========================================================== */

  const handleDecline =
    useCallback(async () => {
      const call =
        incomingCall;

      const user =
        getAuth()
          .currentUser;

      if (
        !call ||
        !user ||
        accepting ||
        declining
      ) {
        return;
      }

      setDeclining(
        true,
      );

      try {
        /* ====================================================
           DECLINE IN FIRESTORE
        ==================================================== */

        await declineIncomingCall(
          call.id,
          user.uid,
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        /* ====================================================
           CLEAR LOCAL STATE
        ==================================================== */

        if (
          customerIncomingRef
            .current
            ?.id ===
          call.id
        ) {
          customerIncomingRef.current =
            null;
        }

        if (
          workerIncomingRef
            .current
            ?.id ===
          call.id
        ) {
          workerIncomingRef.current =
            null;
        }

        syncIncomingCall();
      } catch (
        error
      ) {
        console.error(
          "FIXXAM_DECLINE_INCOMING_CALL_ERROR:",
          {
            callId:
              call.id,

            error,
          },
        );
      } finally {
        if (
          mountedRef.current
        ) {
          setDeclining(
            false,
          );
        }
      }
    }, [
      accepting,
      declining,
      incomingCall,
      syncIncomingCall,
    ]);

  /* ==========================================================
     CALLER DISPLAY DATA
  ========================================================== */

  const callWithSnapshot =
    incomingCall as
      | CallWithSnapshot
      | null;

  const callerSnapshot =
    callWithSnapshot
      ?.callerSnapshot;

  const callerName =
    cleanString(
      callerSnapshot?.name,
    ) ||
    (
      incomingCall
        ?.callerRole ===
      "worker"
        ? "Fixxam Worker"
        : "Fixxam Customer"
    );

  const rawCallerImage =
    cleanString(
      callerSnapshot?.image,
    );

  const callerImage =
    rawCallerImage.startsWith(
      "https://",
    )
      ? rawCallerImage
      : "";

  const callerService =
    cleanString(
      callerSnapshot?.service,
    );

  const callerSubtitle =
    callerService ||
    (
      incomingCall
        ?.callerRole ===
      "worker"
        ? "Worker calling via Fixxam Voice"
        : "Customer calling via Fixxam Voice"
    );

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <>
      {children}

      <IncomingCallModal
        visible={
          Boolean(
            incomingCall,
          )
        }
        callerName={
          callerName
        }
        callerImage={
          callerImage
        }
        callerSubtitle={
          callerSubtitle
        }
        accepting={
          accepting
        }
        declining={
          declining
        }
        onAccept={
          handleAccept
        }
        onDecline={
          handleDecline
        }
      />
    </>
  );
}