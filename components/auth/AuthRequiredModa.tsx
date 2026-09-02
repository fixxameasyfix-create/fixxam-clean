import React, {
  useCallback,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

type AuthRequiredModalProps = {
  visible: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
};

export default function AuthRequiredModal({
  visible,
  title = "Login required",
  description = "Create an account or login to continue contacting this worker.",
  onClose,
}: AuthRequiredModalProps) {
  /* ==========================================================
     LOGIN
  ========================================================== */

  const handleLogin = useCallback(() => {
    onClose();

    router.push(
      "/(auth)/login",
    );
  }, [onClose]);

  /* ==========================================================
     CREATE ACCOUNT
  ========================================================== */

  const handleSignUp = useCallback(() => {
    onClose();

    router.push(
      "/(auth)/worker/worker-signup",
    );
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={
          styles.overlay
        }
      >
        <View
          style={
            styles.card
          }
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.icon
            }
          >
            <Ionicons
              name="lock-closed-outline"
              size={30}
              color="#2563EB"
            />
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            {title}
          </AppText>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <AppText
            center
            style={
              styles.description
            }
          >
            {description}
          </AppText>

          {/* ==================================================
              LOGIN / CANCEL
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            {/* CANCEL */}

            <Pressable
              onPress={
                onClose
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,
                pressed &&
                  styles.cancelPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <AppText
                weight="bold"
                style={
                  styles.cancelText
                }
              >
                Cancel
              </AppText>
            </Pressable>

            {/* LOGIN */}

            <Pressable
              onPress={
                handleLogin
              }
              style={({
                pressed,
              }) => [
                styles.loginButton,
                pressed &&
                  styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              <Ionicons
                name="log-in-outline"
                size={18}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={
                  styles.buttonText
                }
              >
                Login
              </AppText>
            </Pressable>
          </View>

          {/* ==================================================
              CREATE ACCOUNT
          ================================================== */}

          <Pressable
            onPress={
              handleSignUp
            }
            style={({
              pressed,
            }) => [
              styles.signupButton,
              pressed &&
                styles.signupPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create customer account"
          >
            <Ionicons
              name="person-add-outline"
              size={18}
              color="#2563EB"
            />

            <AppText
              weight="bold"
              style={
                styles.signupText
              }
            >
              Join As a Worker
            </AppText>
          </Pressable>
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
    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal: 24,
    },

    card: {
      width: "100%",
      maxWidth: 390,
      padding: 24,
      borderRadius: 26,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
    },

    icon: {
      width: 64,
      height: 64,
      borderRadius: 22,
      backgroundColor:
        "#EAF2FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 16,
    },

    title: {
      fontSize: 21,
      color: "#111827",
      textAlign:
        "center",
    },

    description: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
      textAlign:
        "center",
    },

    actions: {
      width: "100%",
      flexDirection:
        "row",
      gap: 10,
      marginTop: 22,
    },

    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cancelPressed: {
      opacity: 0.75,
    },

    cancelText: {
      fontSize: 13,
      color: "#475569",
    },

    loginButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    },

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    buttonText: {
      fontSize: 13,
      color: "#FFFFFF",
    },

    signupButton: {
      width: "100%",
      height: 48,
      marginTop: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#2563EB",
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    },

    signupPressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    signupText: {
      fontSize: 13,
      color: "#2563EB",
    },
  });