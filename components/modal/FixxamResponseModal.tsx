import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
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
}: Props) {

  const primary =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>

        <View style={styles.modal}>

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${primary}15`,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={primary}
            />
          </View>

          <AppText
            weight="bold"
            style={styles.title}
          >
            {title}
          </AppText>

          <AppText
            style={styles.message}
          >
            {message}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.9}
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
            activeOpacity={0.9}
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
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(15,23,42,0.55)",
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