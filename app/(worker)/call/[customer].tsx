import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  BackHandler,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  AppScreen,
} from "@/components/ui";

import InAppCallScreen from "@/components/call/InAppCallScreen";

import {
  auth,
} from "@/firebase/config";

import {
  endCall,
  getCallSession,
  subscribeToCall,
  type FixxamCallSession,
  type FixxamCallStatus,
} from "@/services/calls/callSession";

import {
  prefetchLiveKitCallCredentials,
} from "@/services/calls/liveKitCall";

import type {
  CallParticipant,
  CallStatus,
} from "@/types/call";

/* ============================================================
   TYPES
============================================================ */

type OutgoingCallParams = {
  callId?:
    | string
    | string[];

  customerName?:
    | string
    | string[];
};

type ScreenStatus =
  | "loading"
  | FixxamCallStatus;

/* ============================================================
   HELPERS
============================================================ */

function getParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

/* ============================================================
   CUSTOMER DISPLAY NAME
============================================================ */

function getCustomerName(
  call: FixxamCallSession | null,
  fallback: string,
): string {
  const snapshotName =
    call?.calleeSnapshot
      ?.name
      ?.trim();

  if (
    snapshotName
  ) {
    return snapshotName;
  }

  return (
    fallback.trim() ||
    "Customer"
  );
}

/* ============================================================
   FIRESTORE STATUS -> UI STATUS
============================================================ */

function toUiStatus(
  status: ScreenStatus,
): CallStatus {
  switch (
    status
  ) {
    case "loading":
      return "connecting";

    case "ringing":
      return "ringing";

    case "accepted":
      return "connecting";

    case "connected":
      return "connected";

    case "declined":
    case "missed":
    case "ended":
      return "ended";

    case "failed":
      return "failed";

    default:
      return "connecting";
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerOutgoingCallScreen() {
  const params =
    useLocalSearchParams<OutgoingCallParams>();

  /* ==========================================================
     ROUTE PARAMS
  ========================================================== */

  const callId =
    useMemo(
      () =>
        getParam(
          params.callId,
        ),
      [
        params.callId,
      ],
    );

  const customerNameParam =
    useMemo(
      () =>
        getParam(
          params.customerName,
        ),
      [
        params.customerName,
      ],
    );

  /* ==========================================================
     AUTH
  ========================================================== */

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  const [
    workerId,
    setWorkerId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ==========================================================
     CALL STATE
  ========================================================== */

  const [
    call,
    setCall,
  ] =
    useState<
      FixxamCallSession | null
    >(
      null,
    );

  const [
    status,
    setStatus,
  ] =
    useState<ScreenStatus>(
      "loading",
    );

  /* ==========================================================
     REFS
  ========================================================== */

  const navigatingRef =
    useRef(false);

  const endingRef =
    useRef(false);

  const terminalHandledRef =
    useRef(false);

  /* ==========================================================
     AUTH LISTENER
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        user => {
          setWorkerId(
            user?.uid
              ?.trim() ||
            null,
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     INITIAL CALL VALIDATION
  ========================================================== */

  useEffect(() => {
    if (
      !authReady
    ) {
      return;
    }

    let active =
      true;

    const loadCall =
      async () => {
        if (
          !workerId ||
          !callId
        ) {
          setStatus(
            "failed",
          );

          return;
        }

        try {
          setStatus(
            "loading",
          );

          const nextCall =
            await getCallSession(
              callId,
            );

          if (
            !active
          ) {
            return;
          }

          if (
            !nextCall
          ) {
            setStatus(
              "failed",
            );

            return;
          }

          /* ==================================================
             WORKER AUTHORIZATION
          ================================================== */

          if (
            nextCall.callerId !==
              workerId ||
            nextCall.callerRole !==
              "worker" ||
            nextCall.calleeRole !==
              "customer"
          ) {
            console.error(
              "FIXXAM_WORKER_OUTGOING_CALL_UNAUTHORIZED:",
              {
                callId,

                workerId,

                callerId:
                  nextCall.callerId,

                callerRole:
                  nextCall.callerRole,

                calleeRole:
                  nextCall.calleeRole,
              },
            );

            setStatus(
              "failed",
            );

            return;
          }

          setCall(
            nextCall,
          );

          setStatus(
            nextCall.status,
          );

          /* ==================================================
             FAST CALL MODE
          ================================================== */

          if (
            (
              nextCall.status ===
                "ringing" ||
              nextCall.status ===
                "accepted" ||
              nextCall.status ===
                "connected"
            ) &&
            !navigatingRef.current
          ) {
            /*
             * Worker is the caller.
             *
             * During ringing, prepare LiveKit
             * credentials immediately before
             * entering the shared voice screen.
             */
            if (
              nextCall.status ===
              "ringing"
            ) {
              prefetchLiveKitCallCredentials(
                callId,
              );
            }

            navigatingRef.current =
              true;

            router.replace({
              pathname:
                "/voice-call/[callId]",

              params: {
                callId,
              },
            } as never);

            return;
          }
        } catch (
          loadError
        ) {
          console.error(
            "FIXXAM_WORKER_OUTGOING_CALL_LOAD_ERROR:",
            loadError,
          );

          if (
            !active
          ) {
            return;
          }

          setStatus(
            "failed",
          );
        }
      };

    void loadCall();

    return () => {
      active =
        false;
    };
  }, [
    authReady,
    callId,
    workerId,
  ]);

  /* ==========================================================
     REALTIME CALL LISTENER
  ========================================================== */

  useEffect(() => {
    if (
      !callId ||
      !workerId ||
      status ===
        "failed"
    ) {
      return;
    }

    let active =
      true;

    const unsubscribe =
      subscribeToCall(
        callId,

        nextCall => {
          if (
            !active
          ) {
            return;
          }

          /* ==================================================
             PARTICIPANT SECURITY CHECK
          ================================================== */

          if (
            nextCall.callerId !==
              workerId ||
            nextCall.callerRole !==
              "worker" ||
            nextCall.calleeRole !==
              "customer"
          ) {
            console.error(
              "FIXXAM_WORKER_OUTGOING_CALL_INVALID_PARTICIPANT:",
              {
                callId,

                workerId,
              },
            );

            setStatus(
              "failed",
            );

            return;
          }

          setCall(
            nextCall,
          );

          setStatus(
            nextCall.status,
          );

          /* ==================================================
             FAST SHARED CALL OPEN
          ================================================== */

          if (
            (
              nextCall.status ===
                "ringing" ||
              nextCall.status ===
                "accepted" ||
              nextCall.status ===
                "connected"
            ) &&
            !navigatingRef.current
          ) {
            if (
              nextCall.status ===
              "ringing"
            ) {
              prefetchLiveKitCallCredentials(
                callId,
              );
            }

            navigatingRef.current =
              true;

            router.replace({
              pathname:
                "/voice-call/[callId]",

              params: {
                callId,
              },
            } as never);

            return;
          }

          /* ==================================================
             TERMINAL STATES
          ================================================== */

          if (
            (
              nextCall.status ===
                "declined" ||
              nextCall.status ===
                "missed" ||
              nextCall.status ===
                "ended" ||
              nextCall.status ===
                "failed"
            ) &&
            !terminalHandledRef.current &&
            !endingRef.current
          ) {
            terminalHandledRef.current =
              true;

            const displayName =
              getCustomerName(
                nextCall,
                customerNameParam,
              );

            if (
              nextCall.status ===
              "declined"
            ) {
              Toast.show({
                type:
                  "info",

                text1:
                  "Call declined",

                text2:
                  `${displayName} declined the call.`,
              });
            }

            if (
              nextCall.status ===
              "missed"
            ) {
              Toast.show({
                type:
                  "info",

                text1:
                  "No answer",

                text2:
                  `${displayName} did not answer.`,
              });
            }

            if (
              nextCall.status ===
              "failed"
            ) {
              Toast.show({
                type:
                  "error",

                text1:
                  "Call failed",

                text2:
                  "The Fixxam Voice call could not be completed.",
              });
            }

            if (
              router.canGoBack()
            ) {
              router.back();

              return;
            }

            router.replace(
              "/" as never,
            );
          }
        },

        listenerError => {
          console.error(
            "FIXXAM_WORKER_OUTGOING_CALL_LISTENER_ERROR:",
            listenerError,
          );

          if (
            !active ||
            navigatingRef.current
          ) {
            return;
          }

          setStatus(
            "failed",
          );
        },
      );

    return () => {
      active =
        false;

      unsubscribe();
    };
  }, [
    callId,
    customerNameParam,
    status,
    workerId,
  ]);

  /* ==========================================================
     END CALL
  ========================================================== */

  const handleEndCall =
    useCallback(
      async () => {
        if (
          endingRef.current
        ) {
          return;
        }

        endingRef.current =
          true;

        terminalHandledRef.current =
          true;

        try {
          if (
            callId &&
            workerId
          ) {
            await endCall(
              callId,
              workerId,
            );
          }
        } catch (
          endError
        ) {
          console.error(
            "FIXXAM_WORKER_OUTGOING_CALL_END_ERROR:",
            endError,
          );

          Toast.show({
            type:
              "error",

            text1:
              "Unable to end call",

            text2:
              "The call may already have ended.",
          });
        } finally {
          if (
            router.canGoBack()
          ) {
            router.back();

            return;
          }

          router.replace(
            "/" as never,
          );
        }
      },
      [
        callId,
        workerId,
      ],
    );

  /* ==========================================================
     ANDROID HARDWARE BACK
  ========================================================== */

  useEffect(() => {
    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (
            status ===
              "ended" ||
            status ===
              "failed"
          ) {
            void handleEndCall();

            return true;
          }

          Alert.alert(
            "End call?",
            "Do you want to end this Fixxam voice call?",
            [
              {
                text:
                  "Stay",

                style:
                  "cancel",
              },

              {
                text:
                  "End Call",

                style:
                  "destructive",

                onPress:
                  () => {
                    void handleEndCall();
                  },
              },
            ],
          );

          return true;
        },
      );

    return () => {
      subscription.remove();
    };
  }, [
    handleEndCall,
    status,
  ]);

  /* ==========================================================
     PARTICIPANT
  ========================================================== */

  const displayCustomerName =
    getCustomerName(
      call,
      customerNameParam,
    );

  const participant =
    useMemo<CallParticipant>(
      () => ({
        id:
          call?.calleeId ||
          "customer",

        name:
          displayCustomerName,

        service:
          call?.calleeSnapshot
            ?.service
            ?.trim() ||
          "Market Order",

        image:
          call?.calleeSnapshot
            ?.image
            ?.trim() ||
          "",
      }),
      [
        call,
        displayCustomerName,
      ],
    );

  /* ==========================================================
     UI STATUS
  ========================================================== */

  const uiStatus =
    toUiStatus(
      status,
    );

  const connectedAt =
    call?.connectedAt
      ?.getTime() ??
    null;

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppScreen
      role="worker"
      padded={false}
    >
      <InAppCallScreen
        participant={
          participant
        }
        status={
          uiStatus
        }
        connectedAt={
          connectedAt
        }
        onEndCall={
          handleEndCall
        }
      />
    </AppScreen>
  );
}