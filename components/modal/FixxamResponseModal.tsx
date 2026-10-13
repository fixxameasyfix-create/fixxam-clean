import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import {
  CustomerColors,
  WorkerColors,
  FixxamTokens,
} from "@/theme";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  variant?: "customer" | "worker";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  presentation?: "default" | "resume-registration";
  email?: string;
};

export default function FixxamResponseModal({
  visible,
  title,
  message,
  variant = "customer",
  confirmText = "Continue",
  cancelText = "Start Over",
  onConfirm,
  onCancel,
  presentation = "default",
  email = "",
}: Props) {
  const { height } = useWindowDimensions();

  const isResumeRegistration =
    presentation === "resume-registration";

  const primary =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  return (
    <Modal
      visible={visible}
      transparent={!isResumeRegistration}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={
        isResumeRegistration
          ? () => undefined
          : onCancel
      }
    >
      {isResumeRegistration ? (
        <View style={styles.resumeScreen}>
          <View
            style={[
              styles.resumeContent,
              {
                paddingTop: Math.min(
                  height * 0.105,
                  180,
                ),
              },
            ]}
          >
            <Ionicons
              name="sync"
              size={34}
              color={primary}
              accessibilityLabel="Resume registration"
            />

            <AppText
              weight="bold"
              style={styles.resumeTitle}
              center
            >
              {title}
            </AppText>

            <AppText
              style={styles.resumeMessage}
              center
            >
              {message}
            </AppText>

            <View
              style={[
                styles.emailCard,
                {
                  backgroundColor: `${primary}12`,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={25}
                color={primary}
              />

              <View style={styles.emailDetails}>
                <AppText
                  weight="medium"
                  style={styles.emailText}
                  numberOfLines={1}
                >
                  {email.trim() || "Saved email address"}
                </AppText>

                <AppText
                  style={styles.emailSubtitle}
                >
                  Continue from where you left off.
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              style={[
                styles.resumePrimaryButton,
                {
                  backgroundColor: primary,
                },
              ]}
              onPress={onConfirm}
            >
              <AppText
                color="#FFFFFF"
                weight="bold"
                style={styles.resumeButtonText}
                center
              >
                {confirmText}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              style={styles.resumeSecondaryButton}
              onPress={onCancel}
            >
              <Ionicons
                name="sync"
                size={23}
                color={primary}
              />

              <AppText
                style={[
                  styles.startOverText,
                  { color: primary },
                ]}
                center
              >
                {cancelText}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              {
                borderColor: `${primary}12`,
              },
            ]}
            accessibilityViewIsModal
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${primary}12`,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={34}
                color={primary}
              />
            </View>

            <AppText
              weight="bold"
              style={styles.title}
              center
            >
              {title}
            </AppText>

            <AppText
              style={styles.message}
              center
            >
              {message}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: primary,
                },
              ]}
              onPress={onConfirm}
            >
              <AppText
                color="#FFFFFF"
                weight="bold"
              >
                {confirmText}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              style={[
                styles.secondaryButton,
                {
                  borderColor: primary,
                },
              ]}
              onPress={onCancel}
            >
              <AppText
                color={primary}
                weight="bold"
              >
                {cancelText}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Full-screen registration resume page
  resumeScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  resumeContent: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  resumeTitle: {
    width: "100%",
    fontSize: 28,
    lineHeight: 37,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginTop: 23,
    marginBottom: 10,
  },

  resumeMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: "#737F8F",
    textAlign: "center",
    paddingHorizontal: 4,
    marginBottom: 16,
  },

  emailCard: {
    width: "100%",
    minHeight: 59,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 13,
  },

  emailDetails: {
    flex: 1,
    minWidth: 0,
  },

  emailText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#111827",
  },

  emailSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#758397",
  },

  resumePrimaryButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 0,
    elevation: 2,
  },

  resumeButtonText: {
    fontSize: 17,
    lineHeight: 23,
    textAlign: "center",
  },

  resumeSecondaryButton: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 16,
    marginTop: 5,
  },

  startOverText: {
    fontSize: 16,
    lineHeight: 23,
  },

  // Existing default modal styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modal: {
    width: "92%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: "center",
    ...FixxamTokens.shadow.card,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },

  message: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 6,
    marginBottom: 18,
  },

  primaryButton: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  secondaryButton: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
});