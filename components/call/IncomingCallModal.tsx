import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  AppText,
} from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type IncomingCallModalProps = {
  visible: boolean;

  callerName: string;

  callerImage?: string;

  callerSubtitle?: string;

  accepting?: boolean;

  declining?: boolean;

  onAccept: () => void;

  onDecline: () => void;
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

function isHttpsImage(
  value: string,
): boolean {
  return value.startsWith(
    "https://",
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function IncomingCallModal({
  visible,

  callerName,

  callerImage = "",

  callerSubtitle = "Fixxam Voice Call",

  accepting = false,

  declining = false,

  onAccept,

  onDecline,
}: IncomingCallModalProps) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  /* ==========================================================
     NORMALIZED CALLER DATA
  ========================================================== */

  const normalizedName =
    useMemo(
      () =>
        cleanString(
          callerName,
        ) ||
        "Fixxam User",
      [
        callerName,
      ],
    );

  const normalizedSubtitle =
    useMemo(
      () =>
        cleanString(
          callerSubtitle,
        ) ||
        "Fixxam Voice Call",
      [
        callerSubtitle,
      ],
    );

  const normalizedImage =
    useMemo(
      () =>
        cleanString(
          callerImage,
        ),
      [
        callerImage,
      ],
    );

  /* ==========================================================
     RESET IMAGE ERROR WHEN CALLER CHANGES
  ========================================================== */

  useEffect(() => {
    setImageFailed(
      false,
    );
  }, [
    normalizedImage,
  ]);

  /* ==========================================================
     STATE
  ========================================================== */

  const busy =
    accepting ||
    declining;

  const showCallerImage =
    Boolean(
      normalizedImage &&
      isHttpsImage(
        normalizedImage,
      ) &&
      !imageFailed,
    );

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={
        () => {
          if (
            !busy
          ) {
            onDecline();
          }
        }
      }
    >
      <View
        style={
          styles.backdrop
        }
      >
        <View
          style={
            styles.container
          }
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <View
            style={
              styles.brandBadge
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#1684E8"
            />

            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.brandText
              }
            >
              Fixxam Voice
            </AppText>
          </View>

          {/* =================================================
              INCOMING LABEL
          ================================================= */}

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.incomingText
            }
          >
            Incoming call
          </AppText>

          {/* =================================================
              CALLER PHOTO
          ================================================= */}

          <View
            style={
              styles.avatarHalo
            }
          >
            <View
              style={
                styles.avatarContainer
              }
            >
              {showCallerImage ? (
                <Image
                  source={{
                    uri:
                      normalizedImage,
                  }}
                  style={
                    styles.avatarImage
                  }
                  contentFit="cover"
                  transition={180}
                  cachePolicy="memory-disk"
                  onError={() => {
                    setImageFailed(
                      true,
                    );
                  }}
                />
              ) : (
                <View
                  style={
                    styles.avatarFallback
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={58}
                    color="#91A4B7"
                  />
                </View>
              )}
            </View>
          </View>

          {/* =================================================
              CALLER INFORMATION
          ================================================= */}

          <AppText
            variant="heading1"
            weight="bold"
            center
            numberOfLines={2}
            style={
              styles.callerName
            }
          >
            {normalizedName}
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            numberOfLines={2}
            style={
              styles.subtitle
            }
          >
            {normalizedSubtitle}
          </AppText>

          {/* =================================================
              SECURE MESSAGE
          ================================================= */}

          <View
            style={
              styles.secureRow
            }
          >
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color="#8292A5"
            />

            <AppText
              variant="caption"
              tone="muted"
            >
              Secure Fixxam voice call
            </AppText>
          </View>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <View
            style={
              styles.actions
            }
          >
            {/* ===============================================
                DECLINE
            =============================================== */}

            <View
              style={
                styles.actionItem
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decline incoming call"
                disabled={
                  busy
                }
                onPress={
                  onDecline
                }
                style={({
                  pressed,
                }) => [
                  styles.callButton,

                  styles.declineButton,

                  pressed &&
                    !busy &&
                    styles.buttonPressed,

                  busy &&
                    styles.buttonDisabled,
                ]}
              >
                {declining ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="call"
                    size={30}
                    color="#FFFFFF"
                    style={
                      styles.declineIcon
                    }
                  />
                )}
              </Pressable>

              <AppText
                variant="body"
                weight="semibold"
                center
                style={
                  styles.actionLabel
                }
              >
                Decline
              </AppText>
            </View>

            {/* ===============================================
                ACCEPT
            =============================================== */}

            <View
              style={
                styles.actionItem
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Accept incoming call"
                disabled={
                  busy
                }
                onPress={
                  onAccept
                }
                style={({
                  pressed,
                }) => [
                  styles.callButton,

                  styles.acceptButton,

                  pressed &&
                    !busy &&
                    styles.buttonPressed,

                  busy &&
                    styles.buttonDisabled,
                ]}
              >
                {accepting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="call"
                    size={30}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>

              <AppText
                variant="body"
                weight="semibold"
                center
                style={
                  styles.actionLabel
                }
              >
                Accept
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    backdrop: {
      flex: 1,

      justifyContent:
        "center",

      paddingHorizontal: 22,

      paddingVertical: 32,

      backgroundColor:
        "rgba(5, 16, 30, 0.64)",
    },

    container: {
      width: "100%",

      maxWidth: 420,

      alignSelf:
        "center",

      paddingHorizontal: 24,

      paddingTop: 24,

      paddingBottom: 30,

      borderRadius: 32,

      backgroundColor:
        "#FFFFFF",

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height: 16,
      },

      shadowOpacity: 0.2,

      shadowRadius: 30,

      elevation: 18,
    },

    brandBadge: {
      alignSelf:
        "center",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,

      paddingHorizontal: 14,

      paddingVertical: 7,

      borderRadius: 999,

      borderWidth: 1,

      borderColor:
        "#DCE8F4",

      backgroundColor:
        "#FFFFFF",
    },

    brandText: {
      color:
        "#1684E8",
    },

    incomingText: {
      marginTop: 20,
    },

    avatarHalo: {
      width: 154,

      height: 154,

      marginTop: 22,

      alignSelf:
        "center",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 77,

      backgroundColor:
        "#EDF6FF",
    },

    avatarContainer: {
      width: 136,

      height: 136,

      overflow:
        "hidden",

      borderRadius: 68,

      borderWidth: 4,

      borderColor:
        "#FFFFFF",

      backgroundColor:
        "#F1F5F9",

      shadowColor:
        "#466884",

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity: 0.12,

      shadowRadius: 12,

      elevation: 5,
    },

    avatarImage: {
      width: "100%",

      height: "100%",
    },

    avatarFallback: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F1F5F9",
    },

    callerName: {
      marginTop: 22,

      paddingHorizontal: 8,

      color:
        "#07162A",
    },

    subtitle: {
      marginTop: 7,

      paddingHorizontal: 12,
    },

    secureRow: {
      marginTop: 15,

      alignSelf:
        "center",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,
    },

    actions: {
      marginTop: 34,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-evenly",
    },

    actionItem: {
      minWidth: 100,

      alignItems:
        "center",
    },

    callButton: {
      width: 74,

      height: 74,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 37,

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height: 7,
      },

      shadowOpacity: 0.16,

      shadowRadius: 10,

      elevation: 6,
    },

    declineButton: {
      backgroundColor:
        "#EA2525",
    },

    acceptButton: {
      backgroundColor:
        "#20B96F",
    },

    declineIcon: {
      transform: [
        {
          rotate:
            "135deg",
        },
      ],
    },

    actionLabel: {
      marginTop: 11,

      color:
        "#172033",
    },

    buttonPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.95,
        },
      ],
    },

    buttonDisabled: {
      opacity: 0.55,
    },
  });