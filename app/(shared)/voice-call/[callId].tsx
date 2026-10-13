import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  getAuth,
} from "firebase/auth";

import {
  AndroidAudioTypePresets,
  AudioSession,
} from "@livekit/react-native";

import {
  Room,
  RoomEvent,
} from "livekit-client";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import InAppCallScreen from "@/components/call/InAppCallScreen";

import {
  addRecentlyContactedWorker,
} from "@/services/storage/recentlyContactedWorkers";

import {
  endCall,
  getCallSession,
  markCallConnected,
  subscribeToCall,
  type FixxamCallRole,
  type FixxamCallSession,
  type FixxamCallStatus,
} from "@/services/calls/callSession";

import {
  getLiveKitCallCredentials,
} from "@/services/calls/liveKitCall";

import type {
  CallParticipant,
  CallStatus,
} from "@/types/call";

/* ============================================================
TYPES
============================================================ */

type RouteParams = {
  callId?: string | string[];
};

/* ============================================================
HELPERS
============================================================ */

function getParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
CALL STATUS -> UI STATUS
============================================================ */

function toUiStatus(
  status: FixxamCallStatus,
): CallStatus {
  switch (status) {
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
ACTIVE CALL
============================================================ */

function isActiveCall(
  status: FixxamCallStatus,
): boolean {
  return (
    status === "ringing" ||
    status === "accepted" ||
    status === "connected"
  );
}

/* ============================================================
LIVEKIT PREPARATION
============================================================ */

function shouldPrepareLiveKit(
  status: FixxamCallStatus,
  currentUserIsCaller: boolean,
): boolean {
  return (
    status === "accepted" ||
    status === "connected" ||
    (status === "ringing" && currentUserIsCaller)
  );
}

function shouldPublishMicrophone(
  status: FixxamCallStatus,
): boolean {
  return (
    status === "accepted" ||
    status === "connected"
  );
}

/* ============================================================
SCREEN
============================================================ */

export default function SharedVoiceCallScreen() {
  const params =
    useLocalSearchParams<RouteParams>();

  const callId =
    getParam(params.callId);

  /* ==========================================================
  STATE
  ========================================================== */

  const [
    call,
    setCall,
  ] = useState<FixxamCallSession | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    ending,
    setEnding,
  ] = useState(false);

  const [
    liveKitJoining,
    setLiveKitJoining,
  ] = useState(false);

  const [
    liveKitReconnecting,
    setLiveKitReconnecting,
  ] = useState(false);

  const [
    mediaError,
    setMediaError,
  ] = useState<string | null>(null);

  /*
   * IMPORTANT:
   *
   * LiveKit media state is independent from Firestore
   * call.status.
   *
   * This prevents a Firestore synchronization failure
   * from making an already-working voice call look failed.
   */
  const [
    liveKitVoiceConnected,
    setLiveKitVoiceConnected,
  ] = useState(false);

  const [
    liveKitConnectedAt,
    setLiveKitConnectedAt,
  ] = useState<number | null>(null);

  /*
   * IMPORTANT:
   *
   * These are React states instead of refs because
   * refs do not trigger a render.
   *
   * The call UI therefore always receives the latest
   * audio-control readiness state.
   */
  const [
    audioSessionReady,
    setAudioSessionReady,
  ] = useState(false);

  const [
    microphoneReady,
    setMicrophoneReady,
  ] = useState(false);

  /* ==========================================================
  REFS
  ========================================================== */

  const mountedRef =
    useRef(true);

  const callRef =
    useRef<FixxamCallSession | null>(null);

  const roomRef =
    useRef<Room | null>(null);

  const roomCallIdRef =
    useRef("");

  const liveKitJoinInFlightRef =
    useRef(false);

  const liveKitGenerationRef =
    useRef(0);

  const audioSessionStartedRef =
    useRef(false);

  const localMicrophoneReadyRef =
    useRef(false);

  const microphoneEnableInFlightRef =
    useRef(false);

  const intentionalDisconnectRef =
    useRef(false);

  const markingConnectedRef =
    useRef(false);

  const connectedMarkedCallIdRef =
    useRef("");

  const recentlySavedCallIdRef =
    useRef("");

  const recentlySavingCallIdRef =
    useRef("");

  const participantImageRef =
    useRef("");

  const participantImageOwnerRef =
    useRef("");

  /*
   * Keeps the current LiveKit event cleanup function.
   *
   * This is important because Room listeners should be
   * explicitly removed before the room is discarded.
   */
  const removeRoomListenersRef =
    useRef<(() => void) | null>(null);

  /*
   * Refs prevent unnecessary callback dependency changes.
   */
  const liveKitVoiceConnectedRef =
    useRef(false);

  const liveKitConnectedAtRef =
    useRef<number | null>(null);

  /* ==========================================================
  CURRENT USER
  ========================================================== */

  const currentUserId =
    getAuth().currentUser?.uid ?? "";

  const currentCallStatus =
    call?.status ?? null;

  /* ==========================================================
  CURRENT USER ROLE
  ========================================================== */

  const currentUserRole =
    useMemo<FixxamCallRole | null>(
      () => {
        if (!call || !currentUserId) {
          return null;
        }

        if (
          call.callerId ===
          currentUserId
        ) {
          return call.callerRole;
        }

        if (
          call.calleeId ===
          currentUserId
        ) {
          return call.calleeRole;
        }

        return null;
      },
      [
        call,
        currentUserId,
      ],
    );

  /* ==========================================================
  REMOTE ROLE
  ========================================================== */

  const remoteRole =
    useMemo<FixxamCallRole | undefined>(
      () => {
        if (!call || !currentUserId) {
          return undefined;
        }

        if (
          call.callerId ===
          currentUserId
        ) {
          return call.calleeRole;
        }

        if (
          call.calleeId ===
          currentUserId
        ) {
          return call.callerRole;
        }

        return undefined;
      },
      [
        call,
        currentUserId,
      ],
    );

  /* ==========================================================
  REMOVE LIVEKIT LISTENERS
  ========================================================== */

  const removeRoomListeners =
    useCallback(() => {
      const cleanup =
        removeRoomListenersRef.current;

      if (!cleanup) {
        return;
      }

      try {
        cleanup();
      } catch (
        listenerCleanupError
      ) {
        console.error(
          "FIXXAM_LIVEKIT_LISTENER_CLEANUP_ERROR:",
          listenerCleanupError,
        );
      } finally {
        removeRoomListenersRef.current =
          null;
      }
    }, []);

  /* ==========================================================
  DISCONNECT LIVEKIT
  ========================================================== */

  const disconnectLiveKit =
    useCallback(
      async () => {
        liveKitGenerationRef.current += 1;

        intentionalDisconnectRef.current =
          true;

        localMicrophoneReadyRef.current =
          false;

        microphoneEnableInFlightRef.current =
          false;

        liveKitJoinInFlightRef.current =
          false;

        connectedMarkedCallIdRef.current =
          "";

        /*
         * Remove listeners before disconnecting the room.
         */
        removeRoomListeners();

        /*
         * Reset local LiveKit connection state.
         */
        liveKitVoiceConnectedRef.current =
          false;

        liveKitConnectedAtRef.current =
          null;

        if (mountedRef.current) {
          setLiveKitVoiceConnected(false);
          setLiveKitConnectedAt(null);

          setAudioSessionReady(false);
          setMicrophoneReady(false);
        }

        const room =
          roomRef.current;

        roomRef.current =
          null;

        roomCallIdRef.current =
          "";

        if (room) {
          try {
            await room.disconnect(true);
          } catch (
            disconnectError
          ) {
            console.error(
              "FIXXAM_LIVEKIT_DISCONNECT_ERROR:",
              disconnectError,
            );
          }
        }

        if (
          audioSessionStartedRef.current
        ) {
          try {
            await AudioSession.stopAudioSession();
          } catch (
            audioError
          ) {
            console.error(
              "FIXXAM_AUDIO_SESSION_STOP_ERROR:",
              audioError,
            );
          }

          audioSessionStartedRef.current =
            false;
        }

        if (mountedRef.current) {
          setLiveKitJoining(false);
          setLiveKitReconnecting(false);
        }

        intentionalDisconnectRef.current =
          false;
      },
      [
        removeRoomListeners,
      ],
    );

  /* ==========================================================
  MOUNT STATE
  ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      void disconnectLiveKit();
    };
  }, [
    disconnectLiveKit,
  ]);

  /* ==========================================================
  RESET CALL REFS
  ========================================================== */

  useEffect(() => {
    recentlySavedCallIdRef.current = "";
    recentlySavingCallIdRef.current = "";
    connectedMarkedCallIdRef.current = "";

    liveKitVoiceConnectedRef.current =
      false;

    liveKitConnectedAtRef.current =
      null;

    localMicrophoneReadyRef.current =
      false;

    setLiveKitVoiceConnected(false);
    setLiveKitConnectedAt(null);

    setAudioSessionReady(false);
    setMicrophoneReady(false);
  }, [
    callId,
  ]);

  /* ==========================================================
  KEEP CALL REF UPDATED
  ========================================================== */

  useEffect(() => {
    callRef.current = call;
  }, [
    call,
  ]);

  /* ==========================================================
  SAVE RECENTLY CONTACTED WORKER
  ========================================================== */

  useEffect(() => {
    if (
      !call ||
      !currentUserId ||
      call.status !== "connected"
    ) {
      return;
    }

    const currentUserIsCaller =
      call.callerId ===
      currentUserId;

    const userRole =
      currentUserIsCaller
        ? call.callerRole
        : call.calleeRole;

    if (
      userRole !== "customer"
    ) {
      return;
    }

    const workerId =
      currentUserIsCaller
        ? call.calleeId
        : call.callerId;

    const workerRole =
      currentUserIsCaller
        ? call.calleeRole
        : call.callerRole;

    const workerSnapshot =
      currentUserIsCaller
        ? call.calleeSnapshot
        : call.callerSnapshot;

    if (
      workerRole !== "worker" ||
      !workerId
    ) {
      return;
    }

    if (
      recentlySavedCallIdRef.current ===
        call.id ||
      recentlySavingCallIdRef.current ===
        call.id
    ) {
      return;
    }

    recentlySavingCallIdRef.current =
      call.id;

    const saveRecentlyCalled =
      async () => {
        try {
          await addRecentlyContactedWorker(
            currentUserId,
            {
              id: workerId,

              name:
                cleanString(
                  workerSnapshot?.name,
                ) ||
                "Fixxam Worker",

              service:
                cleanString(
                  workerSnapshot?.service,
                ) ||
                "Service Provider",

              rating: 0,

              image:
                cleanString(
                  workerSnapshot?.image,
                ),
            },
          );

          recentlySavedCallIdRef.current =
            call.id;

          if (__DEV__) {
            console.info(
              "FIXXAM_RECENT_CALL_SAVED:",
              {
                callId:
                  call.id,
                customerId:
                  currentUserId,
                workerId,
              },
            );
          }
        } catch (
          recentCallError
        ) {
          console.error(
            "FIXXAM_RECENT_CALL_SAVE_ERROR:",
            {
              callId:
                call.id,
              customerId:
                currentUserId,
              workerId,
              error:
                recentCallError,
            },
          );
        } finally {
          if (
            recentlySavingCallIdRef.current ===
            call.id
          ) {
            recentlySavingCallIdRef.current =
              "";
          }
        }
      };

    void saveRecentlyCalled();
  }, [
    call,
    currentUserId,
  ]);

  /* ==========================================================
  REALTIME CALL SNAPSHOT
  ========================================================== */

  useEffect(() => {
    if (!callId) {
      setLoading(false);

      setError(
        "Call information is missing.",
      );

      return;
    }

    const user =
      getAuth().currentUser;

    if (!user) {
      setLoading(false);

      setError(
        "Your session has expired. Please login again.",
      );

      return;
    }

    let cancelled = false;

    const unsubscribe =
      subscribeToCall(
        callId,

        nextCall => {
          if (
            cancelled ||
            !mountedRef.current
          ) {
            return;
          }

          const isParticipant =
            nextCall.callerId ===
              user.uid ||
            nextCall.calleeId ===
              user.uid;

          if (!isParticipant) {
            setCall(null);
            setLoading(false);

            setError(
              "You do not have access to this call.",
            );

            return;
          }

          callRef.current =
            nextCall;

          setCall(
            nextCall,
          );

          setLoading(false);
          setError(null);
        },

        subscriptionError => {
          if (
            cancelled ||
            !mountedRef.current
          ) {
            return;
          }

          console.error(
            "SHARED_CALL_SUBSCRIPTION_ERROR:",
            subscriptionError,
          );

          setLoading(false);

          setError(
            "The call connection was interrupted.",
          );
        },
      );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    callId,
  ]);

  /* ==========================================================
  MARK CALL CONNECTED
  ========================================================== */

  const markConnectedWhenReady =
    useCallback(
      async (
        room: Room,
        targetCallId: string,
        userId: string,
      ) => {
        if (
          !targetCallId ||
          !userId
        ) {
          return;
        }

        if (
          connectedMarkedCallIdRef.current ===
          targetCallId
        ) {
          return;
        }

        if (
          markingConnectedRef.current
        ) {
          return;
        }

        const latestCall =
          callRef.current;

        if (
          !latestCall ||
          latestCall.status ===
            "ringing"
        ) {
          return;
        }

        if (
          !localMicrophoneReadyRef.current
        ) {
          return;
        }

        if (
          room.remoteParticipants.size ===
          0
        ) {
          return;
        }

        const remoteAudioReady =
          Array.from(
            room.remoteParticipants.values(),
          ).some(
            remoteParticipant =>
              remoteParticipant
                .audioTrackPublications
                .size > 0,
          );

        if (!remoteAudioReady) {
          return;
        }

        /*
         * LiveKit has:
         *
         * 1. Local microphone ready
         * 2. Remote participant present
         * 3. Remote audio publication present
         *
         * Therefore the actual voice connection exists.
         */
        if (
          !liveKitVoiceConnectedRef.current
        ) {
          const connectedTimestamp =
            Date.now();

          liveKitVoiceConnectedRef.current =
            true;

          liveKitConnectedAtRef.current =
            connectedTimestamp;

          if (mountedRef.current) {
            setLiveKitVoiceConnected(true);

            setLiveKitConnectedAt(
              connectedTimestamp,
            );
          }
        }

        markingConnectedRef.current =
          true;

        try {
          await markCallConnected(
            targetCallId,
            userId,
          );

          connectedMarkedCallIdRef.current =
            targetCallId;

          if (mountedRef.current) {
            setMediaError(null);
          }
        } catch (
          markError
        ) {
          /*
           * Firestore synchronization failure must NOT
           * turn an already-working LiveKit call into
           * a media failure.
           */
          try {
            const latestServerCall =
              await getCallSession(
                targetCallId,
              );

            if (
              latestServerCall?.status ===
              "connected"
            ) {
              connectedMarkedCallIdRef.current =
                targetCallId;

              return;
            }
          } catch (
            verifyError
          ) {
            if (__DEV__) {
              console.warn(
                "FIXXAM_VERIFY_CONNECTED_CALL_PENDING:",
                {
                  callId:
                    targetCallId,
                  error:
                    verifyError,
                },
              );
            }
          }

          if (__DEV__) {
            console.warn(
              "FIXXAM_CALL_STATE_SYNC_PENDING:",
              {
                callId:
                  targetCallId,
                error:
                  markError,
              },
            );
          }

          /*
           * DO NOT call setMediaError here.
           *
           * LiveKit is connected.
           */
        } finally {
          markingConnectedRef.current =
            false;
        }
      },
      [],
    );

  /* ==========================================================
  ENABLE MICROPHONE AFTER ACCEPT
  ========================================================== */

  const ensureMicrophoneReady =
    useCallback(
      async (
        room: Room,
        targetCallId: string,
        userId: string,
      ) => {
        const latestCall =
          callRef.current;

        if (
          !latestCall ||
          !shouldPublishMicrophone(
            latestCall.status,
          )
        ) {
          return;
        }

        if (
          localMicrophoneReadyRef.current
        ) {
          if (mountedRef.current) {
            setMicrophoneReady(true);
          }

          await markConnectedWhenReady(
            room,
            targetCallId,
            userId,
          );

          return;
        }

        if (
          microphoneEnableInFlightRef.current
        ) {
          return;
        }

        microphoneEnableInFlightRef.current =
          true;

        try {
          const startedAt =
            Date.now();

          await room
            .localParticipant
            .setMicrophoneEnabled(
              true,
            );

          localMicrophoneReadyRef.current =
            true;

          if (mountedRef.current) {
            setMicrophoneReady(true);
            setMediaError(null);
          }

          if (__DEV__) {
            console.info(
              "FIXXAM_MICROPHONE_READY:",
              {
                callId:
                  targetCallId,
                durationMs:
                  Date.now() -
                  startedAt,
              },
            );
          }

          await markConnectedWhenReady(
            room,
            targetCallId,
            userId,
          );
        } catch (
          microphoneError
        ) {
          console.error(
            "FIXXAM_LIVEKIT_MICROPHONE_ENABLE_ERROR:",
            {
              callId:
                targetCallId,
              error:
                microphoneError,
            },
          );

          localMicrophoneReadyRef.current =
            false;

          if (mountedRef.current) {
            setMicrophoneReady(false);

            setMediaError(
              "Fixxam could not start the microphone.",
            );
          }

          throw microphoneError;
        } finally {
          microphoneEnableInFlightRef.current =
            false;
        }
      },
      [
        markConnectedWhenReady,
      ],
    );

  /* ==========================================================
  MICROPHONE CONTROL
  ========================================================== */

  const handleToggleMute =
    useCallback(
      async (
        muted: boolean,
      ) => {
        const room =
          roomRef.current;

        if (
          !room ||
          !audioSessionStartedRef.current ||
          !localMicrophoneReadyRef.current
        ) {
          throw new Error(
            "Voice controls are not ready yet.",
          );
        }

        try {
          await room
            .localParticipant
            .setMicrophoneEnabled(
              !muted,
            );
        } catch (
          muteError
        ) {
          console.error(
            "FIXXAM_LIVEKIT_MUTE_ERROR:",
            {
              callId,
              muted,
              error:
                muteError,
            },
          );

          throw muteError;
        }
      },
      [
        callId,
      ],
    );

  /* ==========================================================
  SPEAKER CONTROL
  ========================================================== */

  const handleToggleSpeaker =
    useCallback(
      async (
        enabled: boolean,
      ) => {
        if (
          !audioSessionStartedRef.current
        ) {
          throw new Error(
            "Audio session is not ready yet.",
          );
        }

        try {
          const outputs =
            await AudioSession.getAudioOutputs();

          if (
            Platform.OS === "ios"
          ) {
            const targetOutput =
              enabled
                ? "force_speaker"
                : "default";

            if (
              !outputs.includes(
                targetOutput,
              )
            ) {
              throw new Error(
                enabled
                  ? "Speaker output is unavailable."
                  : "Default audio output is unavailable.",
              );
            }

            await AudioSession.selectAudioOutput(
              targetOutput,
            );

            return;
          }

          if (
            Platform.OS === "android"
          ) {
            if (enabled) {
              if (
                !outputs.includes(
                  "speaker",
                )
              ) {
                throw new Error(
                  "Speaker output is unavailable.",
                );
              }

              await AudioSession.selectAudioOutput(
                "speaker",
              );

              return;
            }

            /*
             * Normal call audio should prefer:
             *
             * 1. Earpiece
             * 2. Wired headset
             * 3. Bluetooth
             *
             * This is more natural for a phone call than
             * automatically preferring Bluetooth.
             */
            const normalOutput =
              [
                "earpiece",
                "headset",
                "bluetooth",
              ].find(
                output =>
                  outputs.includes(
                    output,
                  ),
              );

            if (!normalOutput) {
              throw new Error(
                "No normal call audio output is available.",
              );
            }

            await AudioSession.selectAudioOutput(
              normalOutput,
            );
          }
        } catch (
          speakerError
        ) {
          console.error(
            "FIXXAM_LIVEKIT_SPEAKER_ERROR:",
            {
              callId,
              enabled,
              error:
                speakerError,
            },
          );

          throw speakerError;
        }
      },
      [
        callId,
      ],
    );

  /* ==========================================================
  LIVEKIT ROOM
  ========================================================== */

  useEffect(() => {
    if (
      !currentCallStatus ||
      !callId ||
      !currentUserId
    ) {
      return;
    }

    const latestCall =
      callRef.current;

    if (!latestCall) {
      return;
    }

    const currentUserIsCaller =
      latestCall.callerId ===
      currentUserId;

    if (
      !shouldPrepareLiveKit(
        currentCallStatus,
        currentUserIsCaller,
      )
    ) {
      if (
        !isActiveCall(
          currentCallStatus,
        )
      ) {
        void disconnectLiveKit();
      }

      return;
    }

    const existingRoom =
      roomRef.current;

    if (
      existingRoom &&
      roomCallIdRef.current ===
        callId
    ) {
      void ensureMicrophoneReady(
        existingRoom,
        callId,
        currentUserId,
      );

      return;
    }

    if (
      liveKitJoinInFlightRef.current
    ) {
      return;
    }

    liveKitJoinInFlightRef.current =
      true;

    setLiveKitJoining(true);
    setLiveKitReconnecting(false);
    setMediaError(null);

    const generation =
      liveKitGenerationRef.current + 1;

    liveKitGenerationRef.current =
      generation;

    const isCurrentAttempt =
      (): boolean => {
        if (
          !mountedRef.current
        ) {
          return false;
        }

        if (
          liveKitGenerationRef.current !==
          generation
        ) {
          return false;
        }

        const activeCall =
          callRef.current;

        if (
          !activeCall ||
          activeCall.id !==
            callId
        ) {
          return false;
        }

        const userIsCaller =
          activeCall.callerId ===
          currentUserId;

        return shouldPrepareLiveKit(
          activeCall.status,
          userIsCaller,
        );
      };

    const connectToLiveKit =
      async () => {
        let room:
          | Room
          | null =
          null;

        let audioPreparationPromise:
          | Promise<void>
          | null =
          null;

        const startedAt =
          Date.now();

        const currentCall =
          callRef.current;

        const localIdentity:
          | "caller"
          | "callee"
          | "unknown" =
          currentCall?.callerId ===
            currentUserId
            ? "caller"
            : currentCall?.calleeId ===
                currentUserId
              ? "callee"
              : "unknown";

        try {
          if (__DEV__) {
            console.info(
              "FIXXAM_LIVEKIT_JOIN_START:",
              {
                callId,
                identity:
                  localIdentity,
                status:
                  currentCall
                    ?.status ??
                  null,
                fastPreconnect:
                  currentCall
                    ?.status ===
                  "ringing",
              },
            );
          }

          const credentialsPromise =
            getLiveKitCallCredentials(
              callId,
            );

          audioPreparationPromise =
            (async () => {
              await AudioSession.configureAudio({
                android: {
                  audioTypeOptions:
                    AndroidAudioTypePresets
                      .communication,

                  preferredOutputList: [
                    "bluetooth",
                    "headset",
                    "earpiece",
                    "speaker",
                  ],
                },

                ios: {
                  defaultOutput:
                    "earpiece",
                },
              });

              if (
                !isCurrentAttempt()
              ) {
                return;
              }

              await AudioSession.startAudioSession();

              audioSessionStartedRef.current =
                true;

              if (mountedRef.current) {
                setAudioSessionReady(true);
              }
            })();

          const [
            credentials,
          ] =
            await Promise.all([
              credentialsPromise,
              audioPreparationPromise,
            ]);

          if (
            !isCurrentAttempt()
          ) {
            if (
              audioSessionStartedRef.current
            ) {
              try {
                await AudioSession.stopAudioSession();
              } catch (
                audioStopError
              ) {
                console.error(
                  "FIXXAM_STALE_AUDIO_SESSION_STOP_ERROR:",
                  audioStopError,
                );
              }

              audioSessionStartedRef.current =
                false;
            }

            if (mountedRef.current) {
              setAudioSessionReady(false);
            }

            return;
          }

          if (__DEV__) {
            console.info(
              "FIXXAM_LIVEKIT_FAST_PREP_READY:",
              {
                callId,
                identity:
                  localIdentity,
                durationMs:
                  Date.now() -
                  startedAt,
                participantRole:
                  credentials
                    .participantRole,
              },
            );
          }

          room =
            new Room();

          roomRef.current =
            room;

          roomCallIdRef.current =
            callId;

          connectedMarkedCallIdRef.current =
            "";

          localMicrophoneReadyRef.current =
            false;

          if (mountedRef.current) {
            setMicrophoneReady(false);
          }

          liveKitVoiceConnectedRef.current =
            false;

          liveKitConnectedAtRef.current =
            null;

          if (mountedRef.current) {
            setLiveKitVoiceConnected(false);
            setLiveKitConnectedAt(null);
          }

          const handleParticipantConnected =
            () => {
              const activeRoom =
                roomRef.current;

              if (!activeRoom) {
                return;
              }

              void ensureMicrophoneReady(
                activeRoom,
                callId,
                currentUserId,
              );

              void markConnectedWhenReady(
                activeRoom,
                callId,
                currentUserId,
              );
            };

          const handleTrackPublished =
            () => {
              const activeRoom =
                roomRef.current;

              if (!activeRoom) {
                return;
              }

              void ensureMicrophoneReady(
                activeRoom,
                callId,
                currentUserId,
              );

              void markConnectedWhenReady(
                activeRoom,
                callId,
                currentUserId,
              );
            };

          const handleReconnecting =
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              setLiveKitReconnecting(
                true,
              );

              setMediaError(null);
            };

          const handleReconnected =
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              setLiveKitReconnecting(
                false,
              );

              setMediaError(null);

              const activeRoom =
                roomRef.current;

              if (activeRoom) {
                void ensureMicrophoneReady(
                  activeRoom,
                  callId,
                  currentUserId,
                );

                void markConnectedWhenReady(
                  activeRoom,
                  callId,
                  currentUserId,
                );
              }
            };

          const handleDisconnected =
            () => {
              if (
                intentionalDisconnectRef.current ||
                !mountedRef.current
              ) {
                return;
              }

              const activeCall =
                callRef.current;

              /*
               * Real LiveKit disconnect is a media problem.
               *
               * Unlike Firestore sync errors, this SHOULD
               * be shown to the user.
               */
              liveKitVoiceConnectedRef.current =
                false;

              liveKitConnectedAtRef.current =
                null;

              localMicrophoneReadyRef.current =
                false;

              if (mountedRef.current) {
                setLiveKitVoiceConnected(false);
                setLiveKitConnectedAt(null);

                setMicrophoneReady(false);
              }

              if (
                activeCall &&
                isActiveCall(
                  activeCall.status,
                )
              ) {
                setLiveKitReconnecting(
                  false,
                );

                setMediaError(
                  "The secure voice connection was interrupted.",
                );
              }
            };

          const handleMediaDeviceError =
            (
              deviceError: Error,
            ) => {
              console.error(
                "FIXXAM_LIVEKIT_MEDIA_DEVICE_ERROR:",
                deviceError,
              );

              if (
                mountedRef.current
              ) {
                setMicrophoneReady(false);

                setMediaError(
                  "Fixxam could not access the microphone.",
                );
              }
            };

          room.on(
            RoomEvent.ParticipantConnected,
            handleParticipantConnected,
          );

          room.on(
            RoomEvent.TrackPublished,
            handleTrackPublished,
          );

          room.on(
            RoomEvent.Reconnecting,
            handleReconnecting,
          );

          room.on(
            RoomEvent.Reconnected,
            handleReconnected,
          );

          room.on(
            RoomEvent.Disconnected,
            handleDisconnected,
          );

          room.on(
            RoomEvent.MediaDevicesError,
            handleMediaDeviceError,
          );

          /*
           * Store explicit listener cleanup.
           */
          removeRoomListenersRef.current =
            () => {
              room?.off(
                RoomEvent.ParticipantConnected,
                handleParticipantConnected,
              );

              room?.off(
                RoomEvent.TrackPublished,
                handleTrackPublished,
              );

              room?.off(
                RoomEvent.Reconnecting,
                handleReconnecting,
              );

              room?.off(
                RoomEvent.Reconnected,
                handleReconnected,
              );

              room?.off(
                RoomEvent.Disconnected,
                handleDisconnected,
              );

              room?.off(
                RoomEvent.MediaDevicesError,
                handleMediaDeviceError,
              );
            };

          const roomConnectStartedAt =
            Date.now();

          if (__DEV__) {
            console.info(
              "FIXXAM_LIVEKIT_ROOM_CONNECT_START:",
              {
                callId,
                identity:
                  localIdentity,
              },
            );
          }

          await room.connect(
            credentials.url,
            credentials.token,
          );

          if (__DEV__) {
            console.info(
              "FIXXAM_LIVEKIT_ROOM_CONNECTED:",
              {
                callId,
                identity:
                  localIdentity,
                durationMs:
                  Date.now() -
                  roomConnectStartedAt,
                totalDurationMs:
                  Date.now() -
                  startedAt,
              },
            );
          }

          if (
            !isCurrentAttempt()
          ) {
            intentionalDisconnectRef.current =
              true;

            removeRoomListeners();

            try {
              await room.disconnect(
                true,
              );
            } finally {
              intentionalDisconnectRef.current =
                false;
            }

            if (
              roomRef.current ===
              room
            ) {
              roomRef.current =
                null;

              roomCallIdRef.current =
                "";
            }

            return;
          }

          await ensureMicrophoneReady(
            room,
            callId,
            currentUserId,
          );
        } catch (
          liveKitError
        ) {
          if (
            audioPreparationPromise
          ) {
            await Promise.allSettled([
              audioPreparationPromise,
            ]);
          }

          const attemptStillCurrent =
            liveKitGenerationRef.current ===
              generation &&
            mountedRef.current;

          if (
            attemptStillCurrent
          ) {
            console.error(
              "FIXXAM_LIVEKIT_CONNECT_ERROR:",
              {
                callId,
                identity:
                  localIdentity,
                error:
                  liveKitError,
              },
            );
          }

          localMicrophoneReadyRef.current =
            false;

          microphoneEnableInFlightRef.current =
            false;

          liveKitVoiceConnectedRef.current =
            false;

          liveKitConnectedAtRef.current =
            null;

          if (mountedRef.current) {
            setLiveKitVoiceConnected(false);
            setLiveKitConnectedAt(null);

            setMicrophoneReady(false);
          }

          /*
           * Explicitly remove listeners before room cleanup.
           */
          removeRoomListeners();

          if (room) {
            try {
              intentionalDisconnectRef.current =
                true;

              await room.disconnect(
                true,
              );
            } catch (
              disconnectError
            ) {
              console.error(
                "FIXXAM_LIVEKIT_CONNECT_CLEANUP_ERROR:",
                disconnectError,
              );
            } finally {
              intentionalDisconnectRef.current =
                false;
            }
          }

          if (
            roomRef.current ===
            room
          ) {
            roomRef.current =
              null;

            roomCallIdRef.current =
              "";
          }

          if (
            audioSessionStartedRef.current
          ) {
            try {
              await AudioSession.stopAudioSession();
            } catch (
              audioStopError
            ) {
              console.error(
                "FIXXAM_LIVEKIT_AUDIO_SESSION_CONNECT_CLEANUP_ERROR:",
                audioStopError,
              );
            }

            audioSessionStartedRef.current =
              false;
          }

          if (mountedRef.current) {
            setAudioSessionReady(false);
          }

          const activeCall =
            callRef.current;

          if (
            attemptStillCurrent &&
            activeCall &&
            activeCall.status !==
              "ringing"
          ) {
            setMediaError(
              "We couldn't establish the secure voice connection.",
            );
          }
        } finally {
          if (
            liveKitGenerationRef.current ===
            generation
          ) {
            liveKitJoinInFlightRef.current =
              false;

            if (
              mountedRef.current
            ) {
              setLiveKitJoining(
                false,
              );
            }
          }
        }
      };

    void connectToLiveKit();
  }, [
    callId,
    currentCallStatus,
    currentUserId,
    disconnectLiveKit,
    ensureMicrophoneReady,
    markConnectedWhenReady,
    removeRoomListeners,
  ]);

  /* ==========================================================
  PARTICIPANT
  ========================================================== */

  const participant =
    useMemo<CallParticipant>(
      () => {
        if (!call) {
          return {
            id: "",
            name: "Fixxam User",
            image: "",
            service: "Fixxam Voice",
          };
        }

        const currentUserIsCaller =
          call.callerId ===
          currentUserId;

        const otherId =
          currentUserIsCaller
            ? call.calleeId
            : call.callerId;

        const otherRole =
          currentUserIsCaller
            ? call.calleeRole
            : call.callerRole;

        const otherSnapshot =
          currentUserIsCaller
            ? call.calleeSnapshot
            : call.callerSnapshot;

        const snapshotName =
          cleanString(
            otherSnapshot?.name,
          );

        const snapshotImage =
          cleanString(
            otherSnapshot?.image,
          );

        const snapshotService =
          cleanString(
            otherSnapshot?.service,
          );

        const sameParticipant =
          participantImageOwnerRef.current ===
          otherId;

        const resolvedParticipantImage =
          snapshotImage ||
          (
            sameParticipant
              ? participantImageRef.current
              : ""
          );

        return {
          id: otherId,

          name:
            snapshotName ||
            (
              otherRole === "worker"
                ? "Fixxam Worker"
                : "Fixxam Customer"
            ),

          image:
            resolvedParticipantImage,

          service:
            snapshotService ||
            "Fixxam Voice",
        };
      },
      [
        call,
        currentUserId,
      ],
    );

  /* ==========================================================
  PRESERVE VALID PARTICIPANT IMAGE
  ========================================================== */

  useEffect(() => {
    if (!participant.id) {
      participantImageRef.current =
        "";

      participantImageOwnerRef.current =
        "";

      return;
    }

    if (
      participantImageOwnerRef.current !==
      participant.id
    ) {
      participantImageOwnerRef.current =
        participant.id;

      participantImageRef.current =
        participant.image || "";

      return;
    }

    if (participant.image) {
      participantImageRef.current =
        participant.image;
    }
  }, [
    participant.id,
    participant.image,
  ]);

  /* ==========================================================
  UI STATUS
  ========================================================== */

  const uiStatus =
    useMemo<CallStatus>(
      () => {
        if (
          error &&
          !call
        ) {
          return "failed";
        }

        if (!call) {
          return "connecting";
        }

        if (
          call.status === "ringing"
        ) {
          return "ringing";
        }

        /*
         * LIVEKIT IS THE SOURCE OF TRUTH FOR MEDIA
         * CONNECTION.
         *
         * But only accepted/connected Firestore states
         * may display an active connected UI.
         *
         * This prevents a stale LiveKit state from making
         * an ended/declined/missed call appear connected.
         */
        if (
          liveKitVoiceConnected &&
          (
            call.status === "accepted" ||
            call.status === "connected"
          )
        ) {
          return "connected";
        }

        if (
          liveKitJoining ||
          liveKitReconnecting
        ) {
          return "connecting";
        }

        /*
         * mediaError is reserved for REAL media errors:
         *
         * - microphone failure
         * - LiveKit disconnect
         * - LiveKit connection failure
         *
         * Firestore markCallConnected errors do NOT reach here.
         */
        if (
          mediaError &&
          shouldPublishMicrophone(
            call.status,
          )
        ) {
          return "failed";
        }

        return toUiStatus(
          call.status,
        );
      },
      [
        call,
        error,
        liveKitJoining,
        liveKitReconnecting,
        liveKitVoiceConnected,
        mediaError,
      ],
    );

  /* ==========================================================
  CONNECTED TIME
  ========================================================== */

  const connectedAt =
    useMemo(
      () => {
        /*
         * Once the call is ended/declined/missed,
         * stop the active timer.
         */
        if (
          call?.status === "ended" ||
          call?.status === "declined" ||
          call?.status === "missed"
        ) {
          return null;
        }

        /*
         * Prefer the authoritative Firestore timestamp
         * when available.
         *
         * Otherwise use the actual LiveKit connection time.
         */
        return (
          call?.connectedAt?.getTime() ??
          liveKitConnectedAt
        );
      },
      [
        call?.connectedAt,
        call?.status,
        liveKitConnectedAt,
      ],
    );

  /* ==========================================================
  AUDIO CONTROLS READY
  ========================================================== */

  /*
   * IMPORTANT:
   *
   * This is now state-driven.
   *
   * Previously audioSessionStartedRef and
   * localMicrophoneReadyRef were read directly here.
   * Updating refs does not cause React to render.
   *
   * Now the UI reliably enables/disables mute and speaker
   * controls when the audio system becomes ready.
   */
  const audioControlsReady =
    Boolean(roomRef.current) &&
    audioSessionReady &&
    microphoneReady &&
    liveKitVoiceConnected &&
    !liveKitJoining &&
    !liveKitReconnecting &&
    !ending &&
    !mediaError;

  /* ==========================================================
  EXIT SCREEN
  ========================================================== */

  const exitScreen =
    useCallback(
      () => {
        const currentCall =
          callRef.current;

        const userIsWorker =
          (
            currentCall?.calleeRole ===
              "worker" &&
            currentCall.calleeId ===
              currentUserId
          ) ||
          (
            currentCall?.callerRole ===
              "worker" &&
            currentCall.callerId ===
              currentUserId
          );

        if (userIsWorker) {
          router.replace(
            "/(worker)/(tabs)/home" as never,
          );

          return;
        }

        router.replace(
          "/(customer)" as never,
        );
      },
      [
        currentUserId,
      ],
    );

  /* ==========================================================
  GO BACK FROM CALL SCREEN
  ========================================================== */

  const handleGoBack =
    useCallback(
      () => {
        /*
         * Navigation must happen FIRST.
         *
         * LiveKit cleanup runs in the background.
         */
        const canGoBack =
          router.canGoBack();

        void disconnectLiveKit();

        if (canGoBack) {
          router.back();

          return;
        }

        exitScreen();
      },
      [
        disconnectLiveKit,
        exitScreen,
      ],
    );

  /* ==========================================================
  END CALL
  ========================================================== */

  const handleEndCall =
    useCallback(
      async () => {
        if (ending) {
          return;
        }

        const user =
          getAuth().currentUser;

        const currentCall =
          callRef.current;

        /*
         * If call is already inactive,
         * only cleanup media.
         */
        if (
          !currentCall ||
          !user ||
          !isActiveCall(
            currentCall.status,
          )
        ) {
          await disconnectLiveKit();

          return;
        }

        setEnding(true);

        try {
          /*
           * Disconnect LiveKit first.
           */
          await disconnectLiveKit();

          /*
           * Update Firestore.
           */
          await endCall(
            currentCall.id,
            user.uid,
          );
        } catch (
          endError
        ) {
          console.error(
            "END_SHARED_CALL_ERROR:",
            {
              callId:
                currentCall.id,
              error:
                endError,
            },
          );
        } finally {
          if (
            mountedRef.current
          ) {
            setEnding(false);
          }
        }
      },
      [
        disconnectLiveKit,
        ending,
      ],
    );

  /* ==========================================================
  ANDROID BACK
  ========================================================== */

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          const currentCall =
            callRef.current;

          if (
            !currentCall ||
            !isActiveCall(
              currentCall.status,
            )
          ) {
            handleGoBack();

            return true;
          }

          Alert.alert(
            "End call?",
            "Do you want to end this Fixxam voice call?",
            [
              {
                text: "Stay",
                style: "cancel",
              },
              {
                text: "End Call",
                style: "destructive",
                onPress: () => {
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
    handleGoBack,
  ]);

  /* ==========================================================
  LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
          />

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.loadingText
            }
          >
            Loading secure call...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
  CALL NOT AVAILABLE
  ========================================================== */

  if (!call) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={styles.center}
        >
          <AppText
            variant="heading2"
            weight="bold"
            center
          >
            Call unavailable
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            {error ||
              "This call is no longer available."}
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close call"
            onPress={
              handleGoBack
            }
            style={({ pressed }) => [
              styles.closeButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppText
              variant="body"
              weight="semibold"
              style={
                styles.closeText
              }
            >
              Close
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
  CALL ROOM
  ========================================================== */

  return (
    <AppScreen
      role={
        currentUserRole ??
        "customer"
      }
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
        remoteRole={
          remoteRole
        }
        audioControlsDisabled={
          !audioControlsReady
        }
        onToggleMute={
          handleToggleMute
        }
        onToggleSpeaker={
          handleToggleSpeaker
        }
        onEndCall={
          call &&
          isActiveCall(
            call.status,
          )
            ? handleEndCall
            : handleGoBack
        }
      />
    </AppScreen>
  );
}

/* ============================================================
STYLES
============================================================ */

const styles =
  StyleSheet.create({
    center: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        28,
    },

    loadingText: {
      marginTop:
        14,
    },

    errorText: {
      marginTop:
        10,

      maxWidth:
        320,

      lineHeight:
        22,
    },

    closeButton: {
      minWidth:
        140,

      marginTop:
        24,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        24,

      paddingVertical:
        14,

      borderRadius:
        999,

      backgroundColor:
        "#1684E8",
    },

    closeText: {
      color:
        "#FFFFFF",
    },

    pressed: {
      opacity:
        0.8,

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },
  });