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

import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui";

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

function cleanString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isHttpsImage(value: string): boolean {
  return value.startsWith("https://");
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
  const [imageFailed, setImageFailed] =
    useState(false);

  /* ==========================================================
     NORMALIZED DATA
  ========================================================== */

  const normalizedName = useMemo(
    () =>
      cleanString(callerName) ||
      "Fixxam User",
    [callerName],
  );

  const normalizedSubtitle = useMemo(
    () =>
      cleanString(callerSubtitle) ||
      "Fixxam Voice Call",
    [callerSubtitle],
  );

  const normalizedImage = useMemo(
    () => cleanString(callerImage),
    [callerImage],
  );

  /* ==========================================================
     RESET IMAGE STATE
  ========================================================== */

  useEffect(() => {
    setImageFailed(false);
  }, [normalizedImage]);

  /* ==========================================================
     CALL STATE
  ========================================================== */

  const busy =
    accepting || declining;

  const showCallerImage =
    Boolean(
      normalizedImage &&
        isHttpsImage(normalizedImage) &&
        !imageFailed,
    );

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => {
        if (!busy) {
          onDecline();
        }
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>

          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="call-outline"
                size={18}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.headerText}>
              <AppText
                variant="body"
                weight="semibold"
                style={styles.headerTitle}
              >
                Incoming call
              </AppText>

              <AppText
                variant="caption"
                style={styles.headerSubtitle}
              >
                {normalizedSubtitle}
              </AppText>
            </View>
          </View>

          {/* =================================================
              CALLER
          ================================================= */}

          <View style={styles.callerSection}>
            <View style={styles.avatarOuter}>

              <View style={styles.avatarRing}>
                <View style={styles.avatarContainer}>
                  {showCallerImage ? (
                    <Image
                      source={{
                        uri: normalizedImage,
                      }}
                      style={styles.avatarImage}
                      contentFit="cover"
                      transition={180}
                      cachePolicy="memory-disk"
                      onError={() => {
                        setImageFailed(true);
                      }}
                      accessibilityLabel={`${normalizedName} profile photo`}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Ionicons
                        name="person-outline"
                        size={52}
                        color="#6D8FB4"
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* CALL INDICATOR */}

              <View style={styles.callIndicator}>
                <Ionicons
                  name="call"
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <AppText
              variant="heading1"
              weight="bold"
              center
              numberOfLines={2}
              style={styles.callerName}
            >
              {normalizedName}
            </AppText>

            <AppText
              variant="body"
              center
              numberOfLines={2}
              style={styles.callerSubtitle}
            >
              {normalizedSubtitle}
            </AppText>
          </View>

          {/* =================================================
              SECURITY
          ================================================= */}

          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.securityText}>
              <AppText
                variant="caption"
                weight="semibold"
                style={styles.securityTitle}
              >
                Secure voice call
              </AppText>

              <AppText
                variant="caption"
                style={styles.securityDescription}
                numberOfLines={2}
              >
                Your Fixxam call is protected.
              </AppText>
            </View>
          </View>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <View style={styles.actions}>

            {/* =================================================
                DECLINE
            ================================================= */}

            <View style={styles.actionItem}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decline incoming call"
                accessibilityState={{
                  disabled: busy,
                  busy: declining,
                }}
                disabled={busy}
                onPress={onDecline}
                style={({ pressed }) => [
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
                    size={28}
                    color="#FFFFFF"
                    style={styles.declineIcon}
                  />
                )}
              </Pressable>

              <AppText
                variant="caption"
                weight="semibold"
                center
                style={styles.actionLabel}
              >
                Decline
              </AppText>
            </View>

            {/* =================================================
                ACCEPT
            ================================================= */}

            <View style={styles.actionItem}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Accept incoming call"
                accessibilityState={{
                  disabled: busy,
                  busy: accepting,
                }}
                disabled={busy}
                onPress={onAccept}
                style={({ pressed }) => [
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
                    size={28}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>

              <AppText
                variant="caption"
                weight="semibold"
                center
                style={styles.actionLabel}
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

const styles = StyleSheet.create({

  /* ==========================================================
     BACKDROP
  ========================================================== */

  backdrop: {
    flex: 1,

    justifyContent: "center",

    paddingHorizontal: 20,

    paddingVertical: 28,

    backgroundColor:
      "rgba(3, 22, 55, 0.72)",
  },

  /* ==========================================================
     MAIN CARD
  ========================================================== */

  container: {
    width: "100%",

    maxWidth: 420,

    alignSelf: "center",

    paddingHorizontal: 22,

    paddingTop: 22,

    paddingBottom: 24,

    borderRadius: 30,

    // FIXXAM BLUE
    backgroundColor: "#0B63D8",

    shadowColor: "#003B8F",

    shadowOffset: {
      width: 0,
      height: 18,
    },

    shadowOpacity: 0.28,

    shadowRadius: 28,

    elevation: 18,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: "row",

    alignItems: "center",

    paddingBottom: 18,

    borderBottomWidth:
      StyleSheet.hairlineWidth,

    borderBottomColor:
      "rgba(255,255,255,0.20)",
  },

  headerIcon: {
    width: 38,

    height: 38,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 19,

    backgroundColor:
      "rgba(255,255,255,0.16)",
  },

  headerText: {
    flex: 1,

    marginLeft: 11,
  },

  headerTitle: {
    color: "#FFFFFF",
  },

  headerSubtitle: {
    marginTop: 2,

    color: "#BFE4FF",
  },

  /* ==========================================================
     CALLER
  ========================================================== */

  callerSection: {
    alignItems: "center",

    paddingTop: 24,
  },

  avatarOuter: {
    position: "relative",

    alignItems: "center",

    justifyContent: "center",
  },

  avatarRing: {
    width: 148,

    height: 148,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 74,

    backgroundColor:
      "rgba(255,255,255,0.12)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.28)",
  },

  avatarContainer: {
    width: 126,

    height: 126,

    overflow: "hidden",

    borderRadius: 63,

    borderWidth: 4,

    borderColor: "#FFFFFF",

    backgroundColor: "#EAF3FF",

    shadowColor: "#003B8F",

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.22,

    shadowRadius: 12,

    elevation: 5,
  },

  avatarImage: {
    width: "100%",

    height: "100%",
  },

  avatarFallback: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#EAF3FF",
  },

  /* ==========================================================
     CALL INDICATOR
  ========================================================== */

  callIndicator: {
    position: "absolute",

    right: 3,

    bottom: 8,

    width: 40,

    height: 40,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 20,

    backgroundColor: "#20B96F",

    borderWidth: 3,

    borderColor: "#FFFFFF",

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.16,

    shadowRadius: 7,

    elevation: 5,
  },

  callerName: {
    marginTop: 18,

    paddingHorizontal: 8,

    color: "#FFFFFF",
  },

  callerSubtitle: {
    marginTop: 6,

    paddingHorizontal: 12,

    color: "#BFE4FF",
  },

  /* ==========================================================
     SECURITY
  ========================================================== */

  securityCard: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 22,

    paddingHorizontal: 13,

    paddingVertical: 11,

    borderRadius: 16,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.18)",

    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  securityIcon: {
    width: 34,

    height: 34,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.16)",
  },

  securityText: {
    flex: 1,

    marginLeft: 10,
  },

  securityTitle: {
    color: "#FFFFFF",

    marginBottom: 2,
  },

  securityDescription: {
    color: "#BFE4FF",
  },

  /* ==========================================================
     ACTIONS
  ========================================================== */

  actions: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "space-evenly",

    marginTop: 28,

    paddingTop: 2,
  },

  actionItem: {
    minWidth: 100,

    alignItems: "center",
  },

  callButton: {
    width: 70,

    height: 70,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 35,

    shadowColor: "#001F4D",

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.22,

    shadowRadius: 10,

    elevation: 6,
  },

  /* ==========================================================
     DECLINE
  ========================================================== */

  declineButton: {
    backgroundColor: "#EA2525",
  },

  /* ==========================================================
     ACCEPT
  ========================================================== */

  acceptButton: {
    backgroundColor: "#20B96F",
  },

  declineIcon: {
    transform: [
      {
        rotate: "135deg",
      },
    ],
  },

  actionLabel: {
    marginTop: 9,

    color: "#FFFFFF",
  },

  /* ==========================================================
     INTERACTION STATES
  ========================================================== */

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