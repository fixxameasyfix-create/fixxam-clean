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

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import {
  AppScreen,
} from "@/components/ui";

import InAppCallScreen from "@/components/call/InAppCallScreen";

import {
  endCall,
  getCallSession,
  subscribeToCall,
  type FixxamCallSession,
  type FixxamCallStatus,
} from "@/services/calls/callSession";

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
      value[0]?.trim() ??
      ""
    );
  }

  return (
    value?.trim() ??
    ""
  );
}

/* ============================================================
   CALL STATUS -> UI STATUS
============================================================ */

function toUiStatus(
  status: FixxamCallStatus,
): CallStatus {
  switch (
    status
  ) {
    case "ringing":
      return "ringing";

    case "accepted":
      return "connecting";

    case "connected":
      return "connected";

    case "ended":
    case "declined":
    case "missed":
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

  const routeCustomerName =
    useMemo(
      () =>
        getParam(
          params.customerName,
        ) ||
        "Customer",
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
     CALL
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
    useState<CallStatus>(
      "connecting",
    );

  const [
    connectedAt,
    setConnectedAt,
  ] =
    useState<
      number | null
    >(
      null,
    );

  const [
    ending,
    setEnding,
  ] =
    useState(false);

  /* ==========================================================
     REFS
  ========================================================== */

  const openedSharedCallRef =
    useRef(false);

  const endingRef =
    useRef(false);

  /* ==========================================================
     AUTH LISTENER
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        getAuth(),
        user => {
          setWorkerId(
            user?.uid?.trim() ||
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
     PARTICIPANT
  ========================================================== */

  const participant =
    useMemo<
      CallParticipant
    >(
      () => {
        const customerSnapshot =
          call?.calleeSnapshot;

        return {
          id:
            call?.calleeId ||
            "",

          name:
            customerSnapshot
              ?.name?.trim() ||
            routeCustomerName,

          service:
            customerSnapshot
              ?.service?.trim() ||
            "Market Order",

          image:
            customerSnapshot
              ?.image?.trim() ||
            "",
        };
      },
      [
        call,
        routeCustomerName,
      ],
    );

  /* ==========================================================
     OPEN SHARED LIVEKIT CALL
  ========================================================== */

  const openSharedCall =
    useCallback(
      (
        sourceStatus:
          | "accepted"
          | "connected",
      ) => {
        if (
          !callId ||
          openedSharedCallRef.current
        ) {
          return;
        }

        openedSharedCallRef.current =
          true;

        if (
          __DEV__
        ) {
          console.info(
            "FIXXAM_WORKER_OPEN_SHARED_CALL:",
            {
              callId,

              status:
                sourceStatus,
            },
          );
        }

        router.replace({
          pathname:
            "/voice-call/[callId]",

          params: {
            callId,
          },
        } as never);
      },
      [
        callId,
      ],
    );

  /* ==========================================================
     INITIAL CALL LOAD
  ========================================================== */

  useEffect(() => {
    if (
      !authReady
    ) {
      return;
    }

    if (
      !workerId ||
      !callId
    ) {
      setStatus(
        "failed",
      );

      return;
    }

    let active =
      true;

    const loadCall =
      async () => {
        try {
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
             SECURITY CHECK
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
            toUiStatus(
              nextCall.status,
            ),
          );

          if (
            nextCall.status ===
            "connected"
          ) {
            setConnectedAt(
              nextCall.connectedAt
                ?.getTime() ??
              Date.now(),
            );
          } else {
            setConnectedAt(
              null,
            );
          }

          if (
            nextCall.status ===
            "accepted"
          ) {
            openSharedCall(
              "accepted",
            );

            return;
          }

          if (
            nextCall.status ===
            "connected"
          ) {
            openSharedCall(
              "connected",
            );
          }
        } catch (
          loadError
        ) {
          if (
            !active
          ) {
            return;
          }

          console.error(
            "FIXXAM_WORKER_OUTGOING_CALL_LOAD_ERROR:",
            loadError,
          );

          setConnectedAt(
            null,
          );

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
    openSharedCall,
    workerId,
  ]);

  /* ==========================================================
     REALTIME CALL LISTENER
  ========================================================== */

  useEffect(() => {
    if (
      !authReady ||
      !workerId ||
      !callId
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
             PARTICIPANT VALIDATION
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
              "FIXXAM_WORKER_CALL_PARTICIPANT_MISMATCH:",
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
            toUiStatus(
              nextCall.status,
            ),
          );

          /* ==================================================
             RINGING
          ================================================== */

          if (
            nextCall.status ===
            "ringing"
          ) {
            setConnectedAt(
              null,
            );

            return;
          }

          /* ==================================================
             ACCEPTED
          ================================================== */

          if (
            nextCall.status ===
            "accepted"
          ) {
            setConnectedAt(
              null,
            );

            openSharedCall(
              "accepted",
            );

            return;
          }

          /* ==================================================
             CONNECTED
          ================================================== */

          if (
            nextCall.status ===
            "connected"
          ) {
            setConnectedAt(
              nextCall.connectedAt
                ?.getTime() ??
              Date.now(),
            );

            openSharedCall(
              "connected",
            );

            return;
          }

          /* ==================================================
             TERMINAL
          ================================================== */

          if (
            nextCall.status ===
              "declined" ||
            nextCall.status ===
              "missed" ||
            nextCall.status ===
              "ended" ||
            nextCall.status ===
              "failed"
          ) {
            setConnectedAt(
              null,
            );
          }
        },

        subscriptionError => {
          if (
            !active
          ) {
            return;
          }

          console.error(
            "FIXXAM_WORKER_OUTGOING_CALL_SUBSCRIPTION_ERROR:",
            subscriptionError,
          );

          setConnectedAt(
            null,
          );

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
    authReady,
    callId,
    openSharedCall,
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

        setEnding(
          true,
        );

        const user =
          getAuth()
            .currentUser;

        try {
          if (
            callId &&
            user
          ) {
            await endCall(
              callId,
              user.uid,
            );
          }
        } catch (
          endError
        ) {
          console.error(
            "FIXXAM_WORKER_OUTGOING_END_ERROR:",
            endError,
          );
        } finally {
          setConnectedAt(
            null,
          );

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
          status
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