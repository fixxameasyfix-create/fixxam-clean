import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  getDownloadURL,
  getStorage,
  ref,
} from "firebase/storage";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import type {
  CallParticipant,
  CallStatus,
} from "@/types/call";

export type CallRemoteRole =
  | "customer"
  | "worker";

type Props = {
  participant: CallParticipant;
  status: CallStatus;
  connectedAt?: number | null;
  remoteRole?: CallRemoteRole;

  onEndCall: () => void;

  audioControlsDisabled?: boolean;

  onToggleMute?: (
    muted: boolean,
  ) => Promise<void> | void;

  onToggleSpeaker?: (
    enabled: boolean,
  ) => Promise<void> | void;
};

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

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

async function resolveParticipantImage(
  source: string,
): Promise<string> {
  const value = cleanString(source);

  if (!value) {
    return "";
  }

  /*
   * Already a remote URL.
   */
  if (isHttpUrl(value)) {
    return value;
  }

  /*
   * Local device paths are not valid
   * Firebase profile image references.
   */
  if (
    value.startsWith("file://") ||
    value.startsWith("content://")
  ) {
    return "";
  }

  /*
   * Firebase Storage path.
   */
  try {
    const downloadUrl =
      await getDownloadURL(
        ref(
          getStorage(),
          value,
        ),
      );

    return isHttpUrl(downloadUrl)
      ? downloadUrl
      : "";
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "FIXXAM_CALL_IMAGE_RESOLVE_ERROR:",
        error,
      );
    }

    return "";
  }
}

function formatDuration(
  totalSeconds: number,
): string {
  const seconds = Math.max(
    0,
    Math.floor(
      Number.isFinite(totalSeconds)
        ? totalSeconds
        : 0,
    ),
  );

  const hours = Math.floor(
    seconds / 3600,
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return [
      hours,
      minutes,
      remainingSeconds,
    ]
      .map(value =>
        value
          .toString()
          .padStart(2, "0"),
      )
      .join(":");
  }

  return [
    minutes,
    remainingSeconds,
  ]
    .map(value =>
      value
        .toString()
        .padStart(2, "0"),
    )
    .join(":");
}

function getStatusLabel(
  status: CallStatus,
): string {
  switch (status) {
    case "connecting":
      return "Connecting";

    case "ringing":
      return "Calling...";

    case "connected":
      return "Connected";

    case "ended":
      return "Call ended";

    case "failed":
      return "Call failed";

    default:
      return "Calling...";
  }
}

function getStatusDescription(
  status: CallStatus,
  remoteRole?: CallRemoteRole,
): string {
  switch (status) {
    case "connecting":
      return "Connecting securely";

    case "ringing":
      if (remoteRole === "worker") {
        return "Waiting for the worker to answer";
      }

      if (remoteRole === "customer") {
        return "Waiting for the customer to answer";
      }

      return "Waiting for the other person to answer";

    case "connected":
      return "Secure voice call";

    case "ended":
      return "This voice call has ended";

    case "failed":
      return "We couldn't connect this call";

    default:
      return "Connecting securely";
  }
}

/* ============================================================
   SCREEN
============================================================ */

function InAppCallScreen({
  participant,
  status,
  connectedAt = null,
  remoteRole,
  onEndCall,
  audioControlsDisabled = false,
  onToggleMute,
  onToggleSpeaker,
}: Props) {
  const [muted, setMuted] =
    useState(false);

  const [speakerEnabled, setSpeakerEnabled] =
    useState(false);

  const [muteUpdating, setMuteUpdating] =
    useState(false);

  const [speakerUpdating, setSpeakerUpdating] =
    useState(false);

  const [controlError, setControlError] =
    useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  /* ==========================================================
     IMAGE STATE
  ========================================================== */

  /*
   * The actual image currently displayed.
   *
   * IMPORTANT:
   * This value is intentionally NOT cleared when
   * participant.image temporarily becomes empty.
   */
  const [resolvedImage, setResolvedImage] =
    useState("");

  const [imageLoading, setImageLoading] =
    useState(false);

  /*
   * Last successfully resolved source.
   *
   * Example:
   * "workers/abc/profile.jpg"
   */
  const resolvedSourceRef =
    useRef("");

  /*
   * Last remote participant ID.
   *
   * Image is reset ONLY when this changes.
   */
  const imageParticipantIdRef =
    useRef("");

  /*
   * Prevents old async Firebase Storage
   * requests from overwriting a newer image.
   */
  const imageRequestIdRef =
    useRef(0);

  /*
   * Latest resolved image for async callbacks.
   */
  const resolvedImageRef =
    useRef("");

  /*
   * Keep ref synchronized with state.
   */
  useEffect(() => {
    resolvedImageRef.current =
      resolvedImage;
  }, [
    resolvedImage,
  ]);

  /* ==========================================================
     RESET AUDIO CONTROLS
  ========================================================== */

  useEffect(() => {
    setMuted(false);
    setSpeakerEnabled(false);
    setMuteUpdating(false);
    setSpeakerUpdating(false);
    setControlError(null);
  }, [
    participant.id,
  ]);

  /* ==========================================================
     STOP CONTROL LOADING WHEN CALL ENDS
  ========================================================== */

  useEffect(() => {
    if (
      status === "ended" ||
      status === "failed"
    ) {
      setMuteUpdating(false);
      setSpeakerUpdating(false);
      setControlError(null);
    }
  }, [
    status,
  ]);

  /* ==========================================================
     PARTICIPANT IMAGE
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const participantId =
      cleanString(
        participant.id,
      );

    const source =
      cleanString(
        participant.image,
      );

    /*
     * Every image effect gets its own request ID.
     */
    const requestId =
      ++imageRequestIdRef.current;

    /*
     * ========================================================
     * PARTICIPANT CHANGED
     * ========================================================
     *
     * Only here do we clear the old image.
     *
     * This prevents customer A's image from appearing
     * for customer B.
     */
    if (
      imageParticipantIdRef.current !==
      participantId
    ) {
      imageParticipantIdRef.current =
        participantId;

      resolvedSourceRef.current =
        "";

      resolvedImageRef.current =
        "";

      setResolvedImage("");
      setImageLoading(false);
    }

    /*
     * ========================================================
     * EMPTY IMAGE SOURCE
     * ========================================================
     *
     * This is the important fix.
     *
     * Firestore may temporarily return:
     *
     * participant.image === ""
     *
     * during call updates.
     *
     * NEVER clear an already valid image here.
     */
    if (!source) {
      setImageLoading(false);

      return () => {
        cancelled = true;
      };
    }

    /*
     * ========================================================
     * SAME SOURCE ALREADY LOADED
     * ========================================================
     */
    if (
      resolvedSourceRef.current ===
        source &&
      resolvedImageRef.current
    ) {
      setImageLoading(false);

      return () => {
        cancelled = true;
      };
    }

    /*
     * ========================================================
     * DIRECT HTTP IMAGE
     * ========================================================
     */
    if (
      isHttpUrl(source)
    ) {
      resolvedSourceRef.current =
        source;

      resolvedImageRef.current =
        source;

      setResolvedImage(source);
      setImageLoading(false);

      return () => {
        cancelled = true;
      };
    }

    /*
     * ========================================================
     * FIREBASE STORAGE IMAGE
     * ========================================================
     *
     * Keep the old image visible while Firebase resolves
     * the new Storage path.
     */
    setImageLoading(
      !resolvedImageRef.current,
    );

    void resolveParticipantImage(
      source,
    )
      .then(image => {
        /*
         * Ignore stale requests.
         */
        if (
          cancelled ||
          requestId !==
            imageRequestIdRef.current
        ) {
          return;
        }

        /*
         * Valid image found.
         */
        if (image) {
          resolvedSourceRef.current =
            source;

          resolvedImageRef.current =
            image;

          setResolvedImage(image);

          return;
        }

        /*
         * No valid new image.
         *
         * IMPORTANT:
         * Do NOT clear the existing image.
         */
      })
      .catch(error => {
        if (__DEV__) {
          console.warn(
            "FIXXAM_CALL_IMAGE_LOAD_ERROR:",
            error,
          );
        }

        /*
         * IMPORTANT:
         * Existing image stays untouched.
         */
      })
      .finally(() => {
        if (
          cancelled ||
          requestId !==
            imageRequestIdRef.current
        ) {
          return;
        }

        setImageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    participant.id,
    participant.image,
  ]);

  /* ==========================================================
     CALL TIMER
  ========================================================== */

  useEffect(() => {
    if (
      status !== "connected" ||
      !connectedAt
    ) {
      setElapsedSeconds(0);

      return;
    }

    const update = () => {
      setElapsedSeconds(
        Math.max(
          0,
          Math.floor(
            (
              Date.now() -
              connectedAt
            ) / 1000,
          ),
        ),
      );
    };

    update();

    const interval =
      setInterval(
        update,
        1000,
      );

    return () => {
      clearInterval(interval);
    };
  }, [
    connectedAt,
    status,
  ]);

  /* ==========================================================
     UI STATE
  ========================================================== */

  const statusLabel =
    useMemo(
      () =>
        getStatusLabel(
          status,
        ),
      [
        status,
      ],
    );

  const statusDescription =
    useMemo(
      () =>
        getStatusDescription(
          status,
          remoteRole,
        ),
      [
        remoteRole,
        status,
      ],
    );

  const callFinished =
    status === "ended" ||
    status === "failed";

  /*
   * IMPORTANT:
   *
   * If we have a resolved image, always display it.
   *
   * Do NOT use an imageFailed boolean to hide it.
   */
  const showImage =
    Boolean(
      resolvedImageRef.current ||
      resolvedImage,
    );

  /* ==========================================================
     AUDIO CONTROLS
  ========================================================== */

  const muteDisabled =
    audioControlsDisabled ||
    status !== "connected" ||
    muteUpdating ||
    !onToggleMute;

  const speakerDisabled =
    audioControlsDisabled ||
    status !== "connected" ||
    speakerUpdating ||
    !onToggleSpeaker;

  /* ==========================================================
     MUTE
  ========================================================== */

  const handleMute =
    useCallback(
      async () => {
        if (
          muteDisabled ||
          !onToggleMute
        ) {
          return;
        }

        const nextMuted =
          !muted;

        setMuteUpdating(true);
        setControlError(null);

        try {
          await onToggleMute(
            nextMuted,
          );

          setMuted(
            nextMuted,
          );
        } catch (error) {
          console.error(
            "FIXXAM_MUTE_ERROR:",
            error,
          );

          setControlError(
            "Microphone control is temporarily unavailable.",
          );
        } finally {
          setMuteUpdating(false);
        }
      },
      [
        muteDisabled,
        muted,
        onToggleMute,
      ],
    );

  /* ==========================================================
     SPEAKER
  ========================================================== */

  const handleSpeaker =
    useCallback(
      async () => {
        if (
          speakerDisabled ||
          !onToggleSpeaker
        ) {
          return;
        }

        const nextEnabled =
          !speakerEnabled;

        setSpeakerUpdating(true);
        setControlError(null);

        try {
          await onToggleSpeaker(
            nextEnabled,
          );

          setSpeakerEnabled(
            nextEnabled,
          );
        } catch (error) {
          console.error(
            "FIXXAM_SPEAKER_ERROR:",
            error,
          );

          setControlError(
            "Speaker control is temporarily unavailable.",
          );
        } finally {
          setSpeakerUpdating(false);
        }
      },
      [
        onToggleSpeaker,
        speakerDisabled,
        speakerEnabled,
      ],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <LinearGradient
      colors={[
        "#0867E8",
        "#0758D4",
        "#003FAE",
      ]}
      start={{
        x: 0.1,
        y: 0,
      }}
      end={{
        x: 0.9,
        y: 1,
      }}
      style={
        styles.container
      }
    >
      <View
        pointerEvents="none"
        style={
          styles.topGlow
        }
      />

      <View
        pointerEvents="none"
        style={
          styles.bottomGlow
        }
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <AppText
          weight="bold"
          center
          style={
            styles.brand
          }
        >
          FIXXAM
        </AppText>

        <AppText
          variant="heading2"
          weight="semibold"
          center
          style={
            styles.callingText
          }
        >
          {statusLabel}
        </AppText>
      </View>

      {/* ======================================================
          PARTICIPANT
      ====================================================== */}

      <View
        style={
          styles.participantArea
        }
      >
        <View
          style={[
            styles.avatarGlowOuter,

            status ===
              "connected" &&
              styles.avatarGlowConnected,

            status ===
              "failed" &&
              styles.avatarGlowFailed,
          ]}
        >
          <View
            style={
              styles.avatarGlowMiddle
            }
          >
            <View
              style={
                styles.avatarOuter
              }
            >
              {showImage ? (
                <Image
                  source={{
                    uri:
                      resolvedImageRef.current ||
                      resolvedImage,
                  }}
                  style={
                    styles.avatar
                  }
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={0}
                  recyclingKey={
                    `${participant.id}-${resolvedImageRef.current || resolvedImage}`
                  }
                  accessibilityLabel={`${participant.name} profile photo`}
                  onError={
                    error => {
                      /*
                       * Do NOT clear the image.
                       *
                       * expo-image can temporarily report
                       * a rendering/cache error while the
                       * call UI is transitioning.
                       */
                      if (__DEV__) {
                        console.warn(
                          "FIXXAM_CALL_IMAGE_RENDER_ERROR:",
                          error,
                        );
                      }
                    }
                  }
                />
              ) : (
                <View
                  style={
                    styles.avatarPlaceholder
                  }
                >
                  {imageLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <AppIcon
                      name="profile"
                      role="customer"
                      size="lg"
                      state="muted"
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        <AppText
          variant="heading1"
          weight="bold"
          center
          numberOfLines={2}
          style={
            styles.name
          }
        >
          {participant.name}
        </AppText>

        <AppText
          variant="body"
          center
          numberOfLines={1}
          style={
            styles.service
          }
        >
          {participant.service}
        </AppText>

        <View
          style={
            styles.statusRow
          }
        >
          {status ===
            "ringing" ||
          status ===
            "connecting" ? (
            <ActivityIndicator
              size="small"
              color="#67D9FF"
            />
          ) : status ===
            "connected" ? (
            <View
              style={
                styles.liveDot
              }
            />
          ) : status ===
            "failed" ? (
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color="#FFB4B4"
            />
          ) : null}

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.statusText
            }
          >
            {
              statusDescription
            }
          </AppText>
        </View>

        <AppText
          variant="heading2"
          weight="bold"
          center
          style={
            styles.timer
          }
        >
          {status ===
          "connected"
            ? formatDuration(
                elapsedSeconds,
              )
            : "00:00"}
        </AppText>
      </View>

      {/* ======================================================
          CONTROLS
      ====================================================== */}

      {!callFinished && (
        <View
          style={
            styles.controlsArea
          }
        >
          <View
            style={
              styles.controlsRow
            }
          >
            {/* SPEAKER */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                speakerEnabled
                  ? "Turn speaker off"
                  : "Turn speaker on"
              }
              accessibilityState={{
                selected:
                  speakerEnabled,
                disabled:
                  speakerDisabled,
              }}
              disabled={
                speakerDisabled
              }
              onPress={
                handleSpeaker
              }
              style={({
                pressed,
              }) => [
                styles.controlItem,

                speakerDisabled &&
                  styles.controlDisabled,

                pressed &&
                  !speakerDisabled &&
                  styles.controlPressed,
              ]}
            >
              <View
                style={[
                  styles.controlCircle,

                  speakerEnabled &&
                    styles.controlCircleActive,
                ]}
              >
                {speakerUpdating ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name={
                      speakerEnabled
                        ? "volume-high"
                        : "volume-medium-outline"
                    }
                    size={28}
                    color="#FFFFFF"
                  />
                )}
              </View>

              <AppText
                variant="caption"
                weight="semibold"
                center
                style={
                  styles.controlLabel
                }
              >
                Speaker
              </AppText>
            </Pressable>

            {/* MUTE */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                muted
                  ? "Unmute microphone"
                  : "Mute microphone"
              }
              accessibilityState={{
                selected:
                  muted,
                disabled:
                  muteDisabled,
              }}
              disabled={
                muteDisabled
              }
              onPress={
                handleMute
              }
              style={({
                pressed,
              }) => [
                styles.controlItem,

                muteDisabled &&
                  styles.controlDisabled,

                pressed &&
                  !muteDisabled &&
                  styles.controlPressed,
              ]}
            >
              <View
                style={[
                  styles.controlCircle,

                  muted &&
                    styles.controlCircleActive,
                ]}
              >
                {muteUpdating ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name={
                      muted
                        ? "mic-off"
                        : "mic-outline"
                    }
                    size={28}
                    color="#FFFFFF"
                  />
                )}
              </View>

              <AppText
                variant="caption"
                weight="semibold"
                center
                style={
                  styles.controlLabel
                }
              >
                {muted
                  ? "Unmute"
                  : "Mute"}
              </AppText>
            </Pressable>
          </View>

          {controlError && (
            <AppText
              variant="caption"
              center
              style={
                styles.controlError
              }
            >
              {controlError}
            </AppText>
          )}
        </View>
      )}

      {/* ======================================================
          END CALL
      ====================================================== */}

      <View
        style={
          styles.bottomArea
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            callFinished
              ? "Close call screen"
              : "End call"
          }
          onPress={
            onEndCall
          }
          style={({
            pressed,
          }) => [
            styles.endCallButton,

            callFinished &&
              styles.closeButton,

            pressed &&
              styles.endCallPressed,
          ]}
        >
          <Ionicons
            name={
              callFinished
                ? "close"
                : "call"
            }
            size={
              callFinished
                ? 28
                : 30
            }
            color="#FFFFFF"
            style={
              !callFinished
                ? styles.endCallIcon
                : undefined
            }
          />
        </Pressable>

        <AppText
          variant="caption"
          weight="bold"
          center
          style={
            styles.endCallLabel
          }
        >
          {callFinished
            ? "Close"
            : "End Call"}
        </AppText>
      </View>
    </LinearGradient>
  );
}

export default memo(
  InAppCallScreen,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal:
        FixxamTokens.spacing.xl,
      paddingTop:
        FixxamTokens.spacing.lg,
      paddingBottom:
        FixxamTokens.spacing.lg,
      overflow: "hidden",
    },

    topGlow: {
      position: "absolute",
      width: 300,
      height: 300,
      top: -120,
      right: -100,
      borderRadius: 300,
      backgroundColor:
        "rgba(48, 151, 255, 0.18)",
    },

    bottomGlow: {
      position: "absolute",
      width: 420,
      height: 240,
      bottom: -150,
      left: -80,
      borderRadius: 420,
      backgroundColor:
        "rgba(0, 112, 255, 0.28)",
    },

    header: {
      alignItems: "center",
      paddingTop:
        FixxamTokens.spacing.md,
    },

    brand: {
      fontSize: 42,
      lineHeight: 48,
      letterSpacing: 1.2,
      color: "#FFFFFF",
    },

    callingText: {
      marginTop:
        FixxamTokens.spacing.sm,
      fontSize: 28,
      lineHeight: 34,
      color: "#55D5FF",
    },

    participantArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical:
        FixxamTokens.spacing.md,
    },

    avatarGlowOuter: {
      width: 190,
      height: 190,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        "rgba(71, 170, 255, 0.18)",
      borderWidth: 1,
      borderColor:
        "rgba(123, 203, 255, 0.18)",
    },

    avatarGlowConnected: {
      backgroundColor:
        "rgba(55, 220, 180, 0.18)",
    },

    avatarGlowFailed: {
      backgroundColor:
        "rgba(255, 80, 80, 0.18)",
    },

    avatarGlowMiddle: {
      width: 160,
      height: 160,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        "rgba(66, 163, 255, 0.25)",
      borderWidth: 1,
      borderColor:
        "rgba(125, 210, 255, 0.25)",
    },

    avatarOuter: {
      width: 138,
      height: 138,
      alignItems: "center",
      justifyContent: "center",
      padding: 5,
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        "#FFFFFF",
    },

    avatar: {
      width: 128,
      height: 128,
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPlaceholder: {
      width: 128,
      height: 128,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        Colors.disabledBackground,
    },

    name: {
      maxWidth: 320,
      marginTop:
        FixxamTokens.spacing.lg,
      fontSize: 34,
      lineHeight: 40,
      color: "#FFFFFF",
    },

    service: {
      maxWidth: 280,
      marginTop:
        FixxamTokens.spacing.xs,
      color:
        "rgba(255,255,255,0.82)",
    },

    statusRow: {
      minHeight: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: FixxamTokens.spacing.xs,
      marginTop:
        FixxamTokens.spacing.md,
    },

    statusText: {
      color:
        "rgba(255,255,255,0.88)",
    },

    liveDot: {
      width: 8,
      height: 8,
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        "#5DE3A5",
    },

    timer: {
      marginTop:
        FixxamTokens.spacing.sm,
      color: "#FFFFFF",
      fontSize: 22,
    },

    controlsArea: {
      alignItems: "center",
    },

    controlsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
      gap: 52,
    },

    controlItem: {
      width: 78,
      alignItems: "center",
    },

    controlDisabled: {
      opacity: 0.45,
    },

    controlCircle: {
      width: 68,
      height: 68,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        FixxamTokens.radius.full,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.24)",
      backgroundColor:
        "rgba(255,255,255,0.12)",
    },

    controlCircleActive: {
      borderColor:
        "rgba(255,255,255,0.75)",
      backgroundColor:
        "rgba(255,255,255,0.28)",
    },

    controlLabel: {
      marginTop:
        FixxamTokens.spacing.xs,
      color: "#FFFFFF",
    },

    controlPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    controlError: {
      maxWidth: 300,
      marginTop:
        FixxamTokens.spacing.sm,
      color: "#FFD0D0",
    },

    bottomArea: {
      alignItems: "center",
      marginTop:
        FixxamTokens.spacing.md,
      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    endCallButton: {
      width: 76,
      height: 76,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        "#FF3B3B",
      borderWidth: 3,
      borderColor:
        "rgba(255,255,255,0.24)",
      ...FixxamTokens.shadow.card,
    },

    closeButton: {
      backgroundColor:
        "rgba(255,255,255,0.22)",
    },

    endCallIcon: {
      transform: [
        {
          rotate: "135deg",
        },
      ],
    },

    endCallLabel: {
      marginTop:
        FixxamTokens.spacing.xs,
      color: "#FFFFFF",
    },

    endCallPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });