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
} from "firebase/auth";

import {
  AppScreen,
} from "@/components/ui";

import InAppCallScreen from "@/components/call/InAppCallScreen";

import {
  getPublicWorkerCallProfile,
  type WorkerCallPublicProfile,
} from "@/firebase/queries/workerPublicProfiles";

import {
  createCustomerCallSession,
  endCustomerCallSession,
} from "@/services/calls/customerCallSession";

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

type CallRouteParams = {
  workerId?:
    | string
    | string[];

  name?:
    | string
    | string[];

  image?:
    | string
    | string[];

  service?:
    | string
    | string[];

  rating?:
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
   SCREEN
============================================================ */

export default function CustomerCallScreen() {
  const params =
    useLocalSearchParams<CallRouteParams>();

  /* ==========================================================
     ROUTE DATA
  ========================================================== */

  const workerId =
    getParam(
      params.workerId,
    );

  const routeWorkerName =
    getParam(
      params.name,
    ) ||
    "Worker";

  const routeWorkerImage =
    getParam(
      params.image,
    );

  const routeWorkerService =
    getParam(
      params.service,
    ) ||
    "Service Provider";

  /* ==========================================================
     WORKER PROFILE
  ========================================================== */

  const [
    freshWorker,
    setFreshWorker,
  ] =
    useState<
      WorkerCallPublicProfile | null
    >(
      null,
    );

  const freshWorkerRef =
    useRef<
      WorkerCallPublicProfile | null
    >(
      null,
    );

  /* ==========================================================
     CALL STATE
  ========================================================== */

  const [
    callId,
    setCallId,
  ] =
    useState<
      string | null
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
    ending,
    setEnding,
  ] =
    useState(
      false,
    );

  /* ==========================================================
     REFS
  ========================================================== */

  const startedRef =
    useRef(
      false,
    );

  const sharedCallOpenedRef =
    useRef(
      false,
    );

  const leavingRef =
    useRef(
      false,
    );

  /* ==========================================================
     KEEP PROFILE REF UPDATED
  ========================================================== */

  useEffect(() => {
    freshWorkerRef.current =
      freshWorker;
  }, [
    freshWorker,
  ]);

  /* ==========================================================
     LOAD PUBLIC PROFILE
  ========================================================== */

  useEffect(() => {
    if (
      !workerId
    ) {
      return;
    }

    let active =
      true;

    const loadWorkerProfile =
      async () => {
        try {
          const profile =
            await getPublicWorkerCallProfile(
              workerId,
            );

          if (
            !active ||
            !profile
          ) {
            return;
          }

          freshWorkerRef.current =
            profile;

          setFreshWorker(
            profile,
          );

          if (
            __DEV__
          ) {
            console.info(
              "FIXXAM_CALL_WORKER_PROFILE_READY:",
              {
                workerId:
                  profile.id,

                name:
                  profile.name,

                service:
                  profile.service,
              },
            );
          }
        } catch (
          profileError
        ) {
          /*
           * Do not delay or fail the voice call
           * because profile refresh failed.
           *
           * Route metadata remains the fallback.
           */
          console.error(
            "FIXXAM_CALL_WORKER_PROFILE_ERROR:",
            {
              workerId,

              error:
                profileError,
            },
          );
        }
      };

    void loadWorkerProfile();

    return () => {
      active =
        false;
    };
  }, [
    workerId,
  ]);

  /* ==========================================================
     PARTICIPANT
  ========================================================== */

  const participant =
    useMemo<CallParticipant>(
      () => ({
        id:
          workerId,

        name:
          freshWorker
            ?.name ||
          routeWorkerName,

        service:
          freshWorker
            ?.service ||
          routeWorkerService,

        image:
          freshWorker
            ?.photoUrl ||
          routeWorkerImage,
      }),
      [
        freshWorker,
        routeWorkerImage,
        routeWorkerName,
        routeWorkerService,
        workerId,
      ],
    );

  /* ==========================================================
     START CALL IMMEDIATELY
  ========================================================== */

  useEffect(() => {
    if (
      startedRef.current
    ) {
      return;
    }

    const user =
      getAuth()
        .currentUser;

    if (
      !user ||
      !workerId
    ) {
      setStatus(
        "failed",
      );

      return;
    }

    startedRef.current =
      true;

    let cancelled =
      false;

    const startCall =
      async () => {
        try {
          /*
           * Do NOT wait for another worker-profile
           * network request before creating the call.
           *
           * Fast calling is more important here.
           * Fresh profile data is used when already available.
           */
          const latestWorker =
            freshWorkerRef.current;

          const customerName =
            user.displayName
              ?.trim() ||
            "Fixxam Customer";

          const customerImage =
            user.photoURL
              ?.trim() ||
            "";

          const workerName =
            latestWorker
              ?.name ||
            routeWorkerName;

          const workerImage =
            latestWorker
              ?.photoUrl ||
            routeWorkerImage;

          const workerService =
            latestWorker
              ?.service ||
            routeWorkerService;

          /* ==================================================
             CREATE FIRESTORE CALL
          ================================================== */

          const nextCallId =
            await createCustomerCallSession({
              customerId:
                user.uid,

              workerId,

              customerSnapshot: {
                name:
                  customerName,

                image:
                  customerImage,

                service:
                  "Customer",
              },

              workerSnapshot: {
                name:
                  workerName,

                image:
                  workerImage,

                service:
                  workerService,
              },
            });

          /*
           * User may have left while the Firestore
           * call document was being created.
           *
           * End the new call instead of leaving an
           * orphaned ringing session.
           */
          if (
            cancelled ||
            leavingRef.current
          ) {
            try {
              await endCustomerCallSession(
                nextCallId,
                user.uid,
              );
            } catch (
              cleanupError
            ) {
              console.error(
                "FIXXAM_CANCEL_CREATED_CALL_CLEANUP_ERROR:",
                cleanupError,
              );
            }

            return;
          }

          setCallId(
            nextCallId,
          );

          setStatus(
            "ringing",
          );

          /* ==================================================
             FAST TOKEN PREFETCH
          ================================================== */

          /*
           * Fire-and-forget intentionally.
           *
           * Shared voice screen will request the
           * same credentials. liveKitCall.ts will
           * reuse the cached/in-flight request.
           */
          prefetchLiveKitCallCredentials(
            nextCallId,
          );

          /* ==================================================
             OPEN SHARED SCREEN WHILE RINGING
          ================================================== */

          if (
            sharedCallOpenedRef.current
          ) {
            return;
          }

          sharedCallOpenedRef.current =
            true;

          if (
            __DEV__
          ) {
            console.info(
              "FIXXAM_CUSTOMER_FAST_CALL_OPEN:",
              {
                callId:
                  nextCallId,

                workerId,
              },
            );
          }

          router.replace({
            pathname:
              "/voice-call/[callId]",

            params: {
              callId:
                nextCallId,
            },
          } as never);
        } catch (
          startError
        ) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "FIXXAM_CUSTOMER_CALL_START_ERROR:",
            {
              workerId,

              error:
                startError,
            },
          );

          setStatus(
            "failed",
          );
        }
      };

    void startCall();

    return () => {
      cancelled =
        true;
    };
  }, [
    routeWorkerImage,
    routeWorkerName,
    routeWorkerService,
    workerId,
  ]);

  /* ==========================================================
     END / CANCEL CALL
  ========================================================== */

  const handleEndCall =
    useCallback(
      async () => {
        if (
          ending
        ) {
          return;
        }

        leavingRef.current =
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
            await endCustomerCallSession(
              callId,
              user.uid,
            );
          }
        } catch (
          endError
        ) {
          console.error(
            "FIXXAM_CUSTOMER_CALL_END_ERROR:",
            {
              callId,

              error:
                endError,
            },
          );
        } finally {
          router.replace(
            "/(customer)" as never,
          );
        }
      },
      [
        callId,
        ending,
      ],
    );

  /* ==========================================================
     ANDROID BACK
  ========================================================== */

  useEffect(() => {
    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (
            status ===
              "failed" ||
            status ===
              "ended"
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
      role="customer"
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
          null
        }
        onEndCall={
          handleEndCall
        }
      />
    </AppScreen>
  );
}