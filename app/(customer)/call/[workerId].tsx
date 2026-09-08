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
  subscribeToCallSession,
  type CallSessionStatus,
} from "@/services/calls/customerCallSession";

import {
  addRecentlyContactedWorker,
} from "@/services/storage/recentlyContactedWorkers";

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
   RATING
============================================================ */

function parseRating(
  value: string,
): number {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      parsed,
    ),
  );
}

/* ============================================================
   CALL STATUS -> UI STATUS
============================================================ */

function toUiStatus(
  status: CallSessionStatus,
): CallStatus {
  switch (
    status
  ) {
    case "ringing":
      return "ringing";

    /*
     * Worker has accepted the call,
     * but real audio has not connected yet.
     *
     * LiveKit will later transition:
     *
     * accepted -> connected
     */
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

export default function CustomerCallScreen() {
  const params =
    useLocalSearchParams<CallRouteParams>();

  /* ==========================================================
     ROUTE PARAMS
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

  const routeWorkerRating =
    parseRating(
      getParam(
        params.rating,
      ),
    );

  /* ==========================================================
     FRESH PUBLIC WORKER PROFILE
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

  const [
    workerProfileReady,
    setWorkerProfileReady,
  ] =
    useState(
      false,
    );

  /*
   * Keep latest worker profile available
   * inside long-lived Firestore callbacks.
   */
  const freshWorkerRef =
    useRef<
      WorkerCallPublicProfile | null
    >(
      null,
    );

  /* ==========================================================
     CALL SESSION
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

  const recentSavedRef =
    useRef(
      false,
    );

  /* ==========================================================
     KEEP FRESH WORKER REF UPDATED
  ========================================================== */

  useEffect(() => {
    freshWorkerRef.current =
      freshWorker;
  }, [
    freshWorker,
  ]);

  /* ==========================================================
     LOAD FRESH WORKER PUBLIC PROFILE
  ========================================================== */

  useEffect(() => {
    if (
      !workerId
    ) {
      setWorkerProfileReady(
        true,
      );

      return;
    }

    let active =
      true;

    setWorkerProfileReady(
      false,
    );

    const loadWorkerProfile =
      async () => {
        try {
          const profile =
            await getPublicWorkerCallProfile(
              workerId,
            );

          if (
            !active
          ) {
            return;
          }

          if (
            profile
          ) {
            freshWorkerRef.current =
              profile;

            setFreshWorker(
              profile,
            );

            if (
              __DEV__
            ) {
              console.log(
                "CALL_WORKER_PROFILE_LOADED:",
                {
                  workerId:
                    profile.id,

                  name:
                    profile.name,

                  service:
                    profile.service,

                  rating:
                    profile.rating,

                  hasPhoto:
                    Boolean(
                      profile.photoUrl,
                    ),

                  photoUrl:
                    profile.photoUrl,
                },
              );
            }
          }
        } catch (
          profileError
        ) {
          /*
           * Route metadata remains the fallback.
           *
           * Failure to refresh a public profile
           * must not prevent the customer
           * from starting the call.
           */
          console.error(
            "LOAD_CALL_WORKER_PROFILE_ERROR:",
            {
              workerId,

              error:
                profileError,
            },
          );
        } finally {
          if (
            active
          ) {
            setWorkerProfileReady(
              true,
            );
          }
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
     PARTICIPANT DISPLAY
  ========================================================== */

  const participant =
    useMemo<
      CallParticipant
    >(
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
     START CALL SESSION
  ========================================================== */

  useEffect(() => {
    /*
     * Wait until public worker metadata
     * has either loaded or failed.
     *
     * This gives the Firestore call document
     * the best available worker snapshot.
     */
    if (
      !workerProfileReady
    ) {
      return;
    }

    if (
      startedRef.current
    ) {
      return;
    }

    const user =
      getAuth()
        .currentUser;

    if (
      !user
    ) {
      setStatus(
        "failed",
      );

      return;
    }

    if (
      !workerId
    ) {
      setStatus(
        "failed",
      );

      return;
    }

    startedRef.current =
      true;

    let unsubscribe:
      | (() => void)
      | undefined;

    let cancelled =
      false;

    const startCall =
      async () => {
        try {
          const latestWorker =
            freshWorkerRef.current;

          /* ==================================================
             CUSTOMER SNAPSHOT
          ================================================== */

          const customerName =
            user.displayName
              ?.trim() ||
            "Fixxam Customer";

          const customerImage =
            user.photoURL
              ?.trim() ||
            "";

          /* ==================================================
             WORKER SNAPSHOT
          ================================================== */

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
             CREATE UNIFIED FIRESTORE CALL
          ================================================== */

          const nextCallId =
            await createCustomerCallSession(
              {
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
              },
            );

          if (
            cancelled
          ) {
            return;
          }

          setCallId(
            nextCallId,
          );

          if (
            __DEV__
          ) {
            console.log(
              "CUSTOMER_CALL_CREATED:",
              {
                callId:
                  nextCallId,

                customerId:
                  user.uid,

                workerId,

                workerName,

                workerHasPhoto:
                  Boolean(
                    workerImage,
                  ),
              },
            );
          }

          /* ==================================================
             LISTEN TO CALL SESSION
          ================================================== */

          unsubscribe =
            subscribeToCallSession(
              nextCallId,

              (
                session,
              ) => {
                if (
                  cancelled
                ) {
                  return;
                }

                const nextStatus =
                  toUiStatus(
                    session.status,
                  );

                setStatus(
                  nextStatus,
                );

                /* ============================================
                   RINGING
                ============================================ */

                if (
                  session.status ===
                  "ringing"
                ) {
                  setConnectedAt(
                    null,
                  );

                  return;
                }

                /* ============================================
                   ACCEPTED
                ============================================ */

                if (
                  session.status ===
                  "accepted"
                ) {
                  /*
                   * Worker accepted.
                   *
                   * Do NOT start timer yet.
                   *
                   * LiveKit must connect first.
                   */
                  setConnectedAt(
                    null,
                  );

                  return;
                }

                /* ============================================
                   CONNECTED
                ============================================ */

                if (
                  session.status ===
                  "connected"
                ) {
                  const connectedTime =
                    session.connectedAt
                      ?.getTime() ??
                    Date.now();

                  setConnectedAt(
                    connectedTime,
                  );

                  /*
                   * Recently Called is written only
                   * after the call has genuinely
                   * reached connected state.
                   */
                  if (
                    !recentSavedRef.current
                  ) {
                    recentSavedRef.current =
                      true;

                    const latestProfile =
                      freshWorkerRef.current;

                    void addRecentlyContactedWorker(
                      user.uid,
                      {
                        id:
                          workerId,

                        name:
                          latestProfile
                            ?.name ||
                          routeWorkerName,

                        service:
                          latestProfile
                            ?.service ||
                          routeWorkerService,

                        rating:
                          latestProfile
                            ?.rating ??
                          routeWorkerRating,

                        image:
                          latestProfile
                            ?.photoUrl ||
                          routeWorkerImage,
                      },
                    ).catch(
                      (
                        storageError,
                      ) => {
                        recentSavedRef.current =
                          false;

                        console.error(
                          "SAVE_CONNECTED_CALL_RECENT_ERROR:",
                          storageError,
                        );
                      },
                    );
                  }

                  return;
                }

                /* ============================================
                   TERMINAL STATES
                ============================================ */

                if (
                  session.status ===
                    "declined" ||
                  session.status ===
                    "missed" ||
                  session.status ===
                    "ended" ||
                  session.status ===
                    "failed"
                ) {
                  setConnectedAt(
                    null,
                  );
                }
              },

              (
                subscriptionError,
              ) => {
                if (
                  cancelled
                ) {
                  return;
                }

                console.error(
                  "CALL_SESSION_SUBSCRIPTION_ERROR:",
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
        } catch (
          startError
        ) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "START_CUSTOMER_CALL_ERROR:",
            startError,
          );

          setConnectedAt(
            null,
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

      unsubscribe?.();
    };
  }, [
    routeWorkerImage,
    routeWorkerName,
    routeWorkerRating,
    routeWorkerService,
    workerId,
    workerProfileReady,
  ]);

  /* ==========================================================
     END CALL
  ========================================================== */

  const handleEndCall =
    useCallback(async () => {
      if (
        ending
      ) {
        return;
      }

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
          "END_CUSTOMER_CALL_ERROR:",
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
          "/(customer)" as never,
        );
      }
    }, [
      callId,
      ending,
    ]);

  /* ==========================================================
     ANDROID HARDWARE BACK
  ========================================================== */

  useEffect(() => {
    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          /*
           * If the call has already ended,
           * simply leave the screen.
           */
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
          connectedAt
        }
        onEndCall={
          handleEndCall
        }
      />
    </AppScreen>
  );
}