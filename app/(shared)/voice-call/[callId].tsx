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
  endCall,
  getCallSession,
  markCallConnected,
  subscribeToCall,
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
  callId?:
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

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function toUiStatus(
  status: FixxamCallStatus,
): CallStatus {
  switch (
    status
  ) {
    case "ringing":
      return "ringing";

    case "accepted":
      /*
       * Accepted does NOT mean audio
       * is connected yet.
       *
       * accepted
       * -> LiveKit token
       * -> room join
       * -> microphone publish
       * -> remote audio ready
       * -> connected
       */
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

function isActiveCall(
  status: FixxamCallStatus,
): boolean {
  return (
    status === "ringing" ||
    status === "accepted" ||
    status === "connected"
  );
}

function shouldUseLiveKit(
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
    getParam(
      params.callId,
    );

  /* ==========================================================
     STATE
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
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
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

  const [
    liveKitJoining,
    setLiveKitJoining,
  ] =
    useState(
      false,
    );

  const [
    liveKitReconnecting,
    setLiveKitReconnecting,
  ] =
    useState(
      false,
    );

  const [
    mediaError,
    setMediaError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ==========================================================
     REFS
  ========================================================== */

  const mountedRef =
    useRef(
      true,
    );

  const callRef =
    useRef<
      FixxamCallSession | null
    >(
      null,
    );

  const roomRef =
    useRef<
      Room | null
    >(
      null,
    );

  const roomCallIdRef =
    useRef(
      "",
    );

  const liveKitJoinInFlightRef =
    useRef(
      false,
    );

  const audioSessionStartedRef =
    useRef(
      false,
    );

  const localMicrophoneReadyRef =
    useRef(
      false,
    );

  const intentionalDisconnectRef =
    useRef(
      false,
    );

  const markingConnectedRef =
    useRef(
      false,
    );

  const connectedMarkedCallIdRef =
    useRef(
      "",
    );

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const currentUserId =
    getAuth()
      .currentUser
      ?.uid ??
    "";

  const currentCallStatus =
    call?.status ??
    null;

  /* ==========================================================
     DISCONNECT LIVEKIT
  ========================================================== */

  const disconnectLiveKit =
    useCallback(
      async () => {
        intentionalDisconnectRef.current =
          true;

        localMicrophoneReadyRef.current =
          false;

        liveKitJoinInFlightRef.current =
          false;

        connectedMarkedCallIdRef.current =
          "";

        const room =
          roomRef.current;

        roomRef.current =
          null;

        roomCallIdRef.current =
          "";

        if (
          room
        ) {
          try {
            await room.disconnect(
              true,
            );
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
            await AudioSession
              .stopAudioSession();
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

        if (
          mountedRef.current
        ) {
          setLiveKitJoining(
            false,
          );

          setLiveKitReconnecting(
            false,
          );
        }

        intentionalDisconnectRef.current =
          false;
      },
      [],
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

      void disconnectLiveKit();
    };
  }, [
    disconnectLiveKit,
  ]);

  /* ==========================================================
     KEEP CALL REF UPDATED
  ========================================================== */

  useEffect(() => {
    callRef.current =
      call;
  }, [
    call,
  ]);

  /* ==========================================================
     LOAD + SUBSCRIBE CALL
  ========================================================== */

  useEffect(() => {
    if (
      !callId
    ) {
      setLoading(
        false,
      );

      setError(
        "Call information is missing.",
      );

      return;
    }

    const user =
      getAuth()
        .currentUser;

    if (
      !user
    ) {
      setLoading(
        false,
      );

      setError(
        "Your session has expired. Please login again.",
      );

      return;
    }

    let unsubscribe:
      | (() => void)
      | undefined;

    let cancelled =
      false;

    const start =
      async () => {
        try {
          /* ==================================================
             INITIAL CALL
          ================================================== */

          const initialCall =
            await getCallSession(
              callId,
            );

          if (
            cancelled
          ) {
            return;
          }

          if (
            !initialCall
          ) {
            setLoading(
              false,
            );

            setError(
              "This call is no longer available.",
            );

            return;
          }

          const isParticipant =
            initialCall.callerId ===
              user.uid ||
            initialCall.calleeId ===
              user.uid;

          if (
            !isParticipant
          ) {
            setLoading(
              false,
            );

            setError(
              "You do not have access to this call.",
            );

            return;
          }

          callRef.current =
            initialCall;

          setCall(
            initialCall,
          );

          setLoading(
            false,
          );

          /* ==================================================
             REALTIME SUBSCRIPTION
          ================================================== */

          unsubscribe =
            subscribeToCall(
              callId,

              (
                nextCall,
              ) => {
                if (
                  cancelled ||
                  !mountedRef.current
                ) {
                  return;
                }

                const stillParticipant =
                  nextCall.callerId ===
                    user.uid ||
                  nextCall.calleeId ===
                    user.uid;

                if (
                  !stillParticipant
                ) {
                  setError(
                    "You no longer have access to this call.",
                  );

                  return;
                }

                callRef.current =
                  nextCall;

                setCall(
                  nextCall,
                );

                setError(
                  null,
                );
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
                  "SHARED_CALL_SUBSCRIPTION_ERROR:",
                  subscriptionError,
                );

                setError(
                  "The call connection was interrupted.",
                );
              },
            );
        } catch (
          loadError
        ) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "LOAD_SHARED_CALL_ERROR:",
            {
              callId,

              error:
                loadError,
            },
          );

          setLoading(
            false,
          );

          setError(
            "We couldn't load this call.",
          );
        }
      };

    void start();

    return () => {
      cancelled =
        true;

      unsubscribe?.();
    };
  }, [
    callId,
  ]);

  /* ==========================================================
     MARK FIRESTORE CALL CONNECTED
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

        /*
         * Local microphone must already
         * be successfully published.
         */
        if (
          !localMicrophoneReadyRef.current
        ) {
          return;
        }

        /*
         * Other participant must be inside
         * the same LiveKit room.
         */
        if (
          room.remoteParticipants.size ===
          0
        ) {
          return;
        }

        /*
         * Wait until the remote participant
         * has an audio publication.
         */
        const remoteAudioReady =
          Array.from(
            room.remoteParticipants.values(),
          ).some(
            (
              remoteParticipant,
            ) =>
              remoteParticipant
                .audioTrackPublications
                .size >
              0,
          );

        if (
          !remoteAudioReady
        ) {
          return;
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

          if (
            mountedRef.current
          ) {
            setMediaError(
              null,
            );
          }
        } catch (
          markError
        ) {
          /*
           * Both phones may detect readiness
           * simultaneously.
           *
           * If the other device already changed
           * Firestore to connected, this is fine.
           */
          try {
            const latestCall =
              await getCallSession(
                targetCallId,
              );

            if (
              latestCall?.status ===
              "connected"
            ) {
              connectedMarkedCallIdRef.current =
                targetCallId;

              return;
            }
          } catch (
            verifyError
          ) {
            console.error(
              "FIXXAM_VERIFY_CONNECTED_CALL_ERROR:",
              verifyError,
            );
          }

          console.error(
            "FIXXAM_MARK_CALL_CONNECTED_ERROR:",
            {
              callId:
                targetCallId,

              error:
                markError,
            },
          );

          if (
            mountedRef.current
          ) {
            setMediaError(
              "The secure voice connection could not be confirmed.",
            );
          }
        } finally {
          markingConnectedRef.current =
            false;
        }
      },
      [],
    );

  /* ==========================================================
     REAL MICROPHONE CONTROL
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
          /*
           * muted=true means microphone enabled=false.
           */
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
     REAL SPEAKER CONTROL
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
            await AudioSession
              .getAudioOutputs();

          /* ==================================================
             IOS
          ================================================== */

          if (
            Platform.OS ===
            "ios"
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

            await AudioSession
              .selectAudioOutput(
                targetOutput,
              );

            return;
          }

          /* ==================================================
             ANDROID
          ================================================== */

          if (
            Platform.OS ===
            "android"
          ) {
            if (
              enabled
            ) {
              if (
                !outputs.includes(
                  "speaker",
                )
              ) {
                throw new Error(
                  "Speaker output is unavailable.",
                );
              }

              await AudioSession
                .selectAudioOutput(
                  "speaker",
                );

              return;
            }

            /*
             * When loudspeaker is disabled:
             *
             * 1. Bluetooth
             * 2. Wired headset
             * 3. Earpiece
             */
            const normalOutput =
              [
                "bluetooth",
                "headset",
                "earpiece",
              ].find(
                (
                  output,
                ) =>
                  outputs.includes(
                    output,
                  ),
              );

            if (
              !normalOutput
            ) {
              throw new Error(
                "No normal call audio output is available.",
              );
            }

            await AudioSession
              .selectAudioOutput(
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

    /* ========================================================
       TERMINAL / RINGING STATE
    ======================================================== */

    if (
      !shouldUseLiveKit(
        currentCallStatus,
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

    /* ========================================================
       EXISTING ROOM
    ======================================================== */

    const existingRoom =
      roomRef.current;

    if (
      existingRoom &&
      roomCallIdRef.current ===
        callId
    ) {
      void markConnectedWhenReady(
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

    let cancelled =
      false;

    liveKitJoinInFlightRef.current =
      true;

    setLiveKitJoining(
      true,
    );

    setLiveKitReconnecting(
      false,
    );

    setMediaError(
      null,
    );

    /* ========================================================
       CONNECT
    ======================================================== */

    const connectToLiveKit =
      async () => {
        let room:
          | Room
          | null =
          null;

        try {
          /* ==================================================
             SECURE TOKEN
          ================================================== */

          const credentials =
            await getLiveKitCallCredentials(
              callId,
            );

          if (
            cancelled ||
            !mountedRef.current
          ) {
            return;
          }

          /* ==================================================
             AUDIO CONFIGURATION
          ================================================== */

          /*
           * Configure before startAudioSession().
           *
           * Android:
           * - communication mode
           * - Bluetooth preferred
           * - then wired headset
           * - then earpiece
           * - speaker last
           *
           * iOS:
           * - normal voice call starts on earpiece
           */
          await AudioSession
            .configureAudio({
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

          /* ==================================================
             START AUDIO SESSION
          ================================================== */

          await AudioSession
            .startAudioSession();

          audioSessionStartedRef.current =
            true;

          if (
            cancelled ||
            !mountedRef.current
          ) {
            await AudioSession
              .stopAudioSession();

            audioSessionStartedRef.current =
              false;

            return;
          }

          /* ==================================================
             CREATE ROOM
          ================================================== */

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

          /* ==================================================
             REMOTE PARTICIPANT READY
          ================================================== */

          const handleParticipantConnected =
            () => {
              const activeRoom =
                roomRef.current;

              if (
                !activeRoom
              ) {
                return;
              }

              void markConnectedWhenReady(
                activeRoom,
                callId,
                currentUserId,
              );
            };

          /* ==================================================
             REMOTE AUDIO PUBLISHED
          ================================================== */

          const handleTrackPublished =
            () => {
              const activeRoom =
                roomRef.current;

              if (
                !activeRoom
              ) {
                return;
              }

              void markConnectedWhenReady(
                activeRoom,
                callId,
                currentUserId,
              );
            };

          /* ==================================================
             RECONNECTING
          ================================================== */

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

              setMediaError(
                null,
              );
            };

          /* ==================================================
             RECONNECTED
          ================================================== */

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

              setMediaError(
                null,
              );

              const activeRoom =
                roomRef.current;

              if (
                activeRoom
              ) {
                void markConnectedWhenReady(
                  activeRoom,
                  callId,
                  currentUserId,
                );
              }
            };

          /* ==================================================
             DISCONNECTED
          ================================================== */

          const handleDisconnected =
            () => {
              if (
                intentionalDisconnectRef.current ||
                !mountedRef.current
              ) {
                return;
              }

              const latestCall =
                callRef.current;

              if (
                latestCall &&
                isActiveCall(
                  latestCall.status,
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

          /* ==================================================
             MEDIA DEVICE ERROR
          ================================================== */

          const handleMediaDeviceError =
            (
              deviceError:
                Error,
            ) => {
              console.error(
                "FIXXAM_LIVEKIT_MEDIA_DEVICE_ERROR:",
                deviceError,
              );

              if (
                mountedRef.current
              ) {
                setMediaError(
                  "Fixxam could not access the microphone.",
                );
              }
            };

          /* ==================================================
             ROOM EVENTS
          ================================================== */

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

          /* ==================================================
             JOIN ROOM
          ================================================== */

          await room.connect(
            credentials.url,
            credentials.token,
          );

          if (
            cancelled ||
            !mountedRef.current
          ) {
            intentionalDisconnectRef.current =
              true;

            await room.disconnect(
              true,
            );

            intentionalDisconnectRef.current =
              false;

            return;
          }

          /* ==================================================
             ENABLE + PUBLISH MICROPHONE
          ================================================== */

          await room
            .localParticipant
            .setMicrophoneEnabled(
              true,
            );

          localMicrophoneReadyRef.current =
            true;

          if (
            mountedRef.current
          ) {
            setMediaError(
              null,
            );
          }

          /* ==================================================
             REMOTE USER MAY ALREADY BE PRESENT
          ================================================== */

          await markConnectedWhenReady(
            room,
            callId,
            currentUserId,
          );
        } catch (
          liveKitError
        ) {
          console.error(
            "FIXXAM_LIVEKIT_CONNECT_ERROR:",
            {
              callId,

              error:
                liveKitError,
            },
          );

          localMicrophoneReadyRef.current =
            false;

          if (
            room
          ) {
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
              await AudioSession
                .stopAudioSession();
            } catch (
              audioStopError
            ) {
              console.error(
                "FIXXAM_AUDIO_SESSION_CONNECT_CLEANUP_ERROR:",
                audioStopError,
              );
            }

            audioSessionStartedRef.current =
              false;
          }

          if (
            !cancelled &&
            mountedRef.current
          ) {
            setMediaError(
              "We couldn't establish the secure voice connection.",
            );
          }
        } finally {
          liveKitJoinInFlightRef.current =
            false;

          if (
            !cancelled &&
            mountedRef.current
          ) {
            setLiveKitJoining(
              false,
            );
          }
        }
      };

    void connectToLiveKit();

    return () => {
      cancelled =
        true;
    };
  }, [
    callId,
    currentCallStatus,
    currentUserId,
    disconnectLiveKit,
    markConnectedWhenReady,
  ]);

  /* ==========================================================
     PARTICIPANT
  ========================================================== */

  const participant =
    useMemo<
      CallParticipant
    >(
      () => {
        if (
          !call
        ) {
          return {
            id: "",
            name:
              "Fixxam User",
            image: "",
            service:
              "Fixxam Voice",
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
            otherSnapshot
              ?.name,
          );

        const snapshotImage =
          cleanString(
            otherSnapshot
              ?.image,
          );

        const snapshotService =
          cleanString(
            otherSnapshot
              ?.service,
          );

        return {
          id:
            otherId,

          name:
            snapshotName ||
            (
              otherRole ===
              "worker"
                ? "Fixxam Worker"
                : "Fixxam Customer"
            ),

          image:
            snapshotImage.startsWith(
              "https://",
            )
              ? snapshotImage
              : "",

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

        if (
          !call
        ) {
          return "connecting";
        }

        /*
         * During initial room join or network
         * recovery always show Connecting.
         */
        if (
          liveKitJoining ||
          liveKitReconnecting
        ) {
          return "connecting";
        }

        if (
          mediaError &&
          shouldUseLiveKit(
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
        mediaError,
      ],
    );

  /* ==========================================================
     CONNECTED TIME
  ========================================================== */

  const connectedAt =
    useMemo(
      () =>
        call?.status ===
          "connected"
          ? (
              call.connectedAt
                ?.getTime() ??
              Date.now()
            )
          : null,
      [
        call,
      ],
    );

  /* ==========================================================
     AUDIO CONTROLS READY
  ========================================================== */

  const audioControlsReady =
    Boolean(
      roomRef.current,
    ) &&
    audioSessionStartedRef.current &&
    localMicrophoneReadyRef.current &&
    call?.status ===
      "connected" &&
    !liveKitJoining &&
    !liveKitReconnecting &&
    !ending &&
    !mediaError;

  /* ==========================================================
     EXIT SCREEN
  ========================================================== */

  const exitScreen =
    useCallback(() => {
      const currentCall =
        callRef.current;

      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      if (
        currentCall
          ?.calleeRole ===
          "worker" &&
        currentCall.calleeId ===
          currentUserId
      ) {
        router.replace(
          "/(worker)" as never,
        );

        return;
      }

      if (
        currentCall
          ?.callerRole ===
          "worker" &&
        currentCall.callerId ===
          currentUserId
      ) {
        router.replace(
          "/(worker)" as never,
        );

        return;
      }

      router.replace(
        "/(customer)" as never,
      );
    }, [
      currentUserId,
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

      const user =
        getAuth()
          .currentUser;

      const currentCall =
        callRef.current;

      /*
       * If the call already finished,
       * the red button becomes Close.
       */
      if (
        !currentCall ||
        !user ||
        !isActiveCall(
          currentCall.status,
        )
      ) {
        await disconnectLiveKit();

        exitScreen();

        return;
      }

      setEnding(
        true,
      );

      try {
        /*
         * Stop microphone and audio
         * immediately before Firestore update.
         */
        await disconnectLiveKit();

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
          setEnding(
            false,
          );
        }

        exitScreen();
      }
    }, [
      disconnectLiveKit,
      ending,
      exitScreen,
    ]);

  /* ==========================================================
     ANDROID BACK
  ========================================================== */

  useEffect(() => {
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
            void disconnectLiveKit();

            exitScreen();

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
    disconnectLiveKit,
    exitScreen,
    handleEndCall,
  ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.center
          }
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

  if (
    !call
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.center
          }
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
              exitScreen
            }
            style={({
              pressed,
            }) => [
              styles.closeButton,

              pressed &&
                styles.pressed,
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
        call.callerId ===
          currentUserId
          ? call.callerRole
          : call.calleeRole
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
          handleEndCall
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

      paddingHorizontal: 28,
    },

    loadingText: {
      marginTop: 14,
    },

    errorText: {
      marginTop: 10,

      maxWidth: 320,

      lineHeight: 22,
    },

    closeButton: {
      minWidth: 140,

      marginTop: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 24,

      paddingVertical: 14,

      borderRadius: 999,

      backgroundColor:
        "#1684E8",
    },

    closeText: {
      color:
        "#FFFFFF",
    },

    pressed: {
      opacity: 0.8,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });