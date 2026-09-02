import React from "react";
import {
  Modal,
  View,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import AppButton from "@/components/ui/AppButton";
import { AppText } from "@/components/ui";

type Props = {
  visible: boolean;

  icon?: keyof typeof MaterialCommunityIcons.glyphMap;

  title: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  onConfirm: () => void;

  onCancel: () => void;
};

export default function AppDialog({
  visible,

  icon = "help-circle-outline",

  title,

  message,

  confirmText = "Confirm",

  cancelText = "Cancel",

  onConfirm,

  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name={icon}
              size={58}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.title}
          >
            {title}
          </AppText>

          <AppText style={styles.message}>
            {message}
          </AppText>

          <AppButton
            title={confirmText}
            onPress={onConfirm}
          />

          <View style={{ height: 12 }} />

          <AppButton
            title={cancelText}
            variant="worker"
            onPress={onCancel}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
  },

  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 22,
    textAlign: "center",
    color: "#0F172A",
  },

  message: {
    marginTop: 10,
    marginBottom: 28,
    textAlign: "center",
    color: "#64748B",
    lineHeight: 22,
    fontSize: 15,
  },
});