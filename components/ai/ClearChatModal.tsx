import React from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

interface ClearChatModalProps {
  visible: boolean;
  deleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function ClearChatModal({
  visible,
  deleting,
  onCancel,
  onDelete,
}: ClearChatModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        deleting ? undefined : onCancel
      }
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* ====================================================
              ICON
          ==================================================== */}

          <View style={styles.iconContainer}>
            <Ionicons
              name="trash-outline"
              size={38}
              color="#DC2626"
            />
          </View>

          {/* ====================================================
              TITLE
          ==================================================== */}

          <AppText
            weight="bold"
            style={styles.title}
          >
            Clear Chat?
          </AppText>

          {/* ====================================================
              MESSAGE
          ==================================================== */}

          <AppText style={styles.message}>
            Are you sure you want to clear this
            chat? This action cannot be undone.
          </AppText>

          {/* ====================================================
              ACTIONS
          ==================================================== */}

          <View style={styles.actions}>
            {/* CANCEL */}

            <Pressable
              disabled={deleting}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel clearing chat"
              style={({ pressed }) => [
                styles.cancelButton,

                pressed &&
                  !deleting &&
                  styles.cancelPressed,

                deleting &&
                  styles.disabledButton,
              ]}
            >
              <AppText
                weight="bold"
                style={styles.cancelText}
              >
                Cancel
              </AppText>
            </Pressable>

            {/* DELETE */}

            <Pressable
              disabled={deleting}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete chat"
              style={({ pressed }) => [
                styles.deleteButton,

                pressed &&
                  !deleting &&
                  styles.deletePressed,

                deleting &&
                  styles.disabledDeleteButton,
              ]}
            >
              <Ionicons
                name={
                  deleting
                    ? "hourglass-outline"
                    : "trash-outline"
                }
                size={18}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={styles.deleteText}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(15, 23, 42, 0.55)",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 30,
  },

  modal: {
    width: "100%",

    maxWidth: 390,

    backgroundColor: "#FFFFFF",

    borderRadius: 26,

    paddingTop: 28,

    paddingHorizontal: 24,

    paddingBottom: 22,

    alignItems: "center",

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.2,

    shadowRadius: 20,

    elevation: 14,
  },

  iconContainer: {
    width: 72,

    height: 72,

    borderRadius: 22,

    backgroundColor: "#FEF2F2",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 18,
  },

  title: {
    fontSize: 22,

    lineHeight: 28,

    color: "#0F172A",

    textAlign: "center",
  },

  message: {
    marginTop: 9,

    fontSize: 15,

    lineHeight: 22,

    color: "#64748B",

    textAlign: "center",
  },

  actions: {
    width: "100%",

    flexDirection: "row",

    gap: 10,

    marginTop: 26,
  },

  cancelButton: {
    flex: 1,

    minHeight: 48,

    borderRadius: 13,

    backgroundColor: "#F1F5F9",

    alignItems: "center",

    justifyContent: "center",
  },

  cancelPressed: {
    backgroundColor: "#E2E8F0",
  },

  cancelText: {
    fontSize: 15,

    color: "#475569",
  },

  deleteButton: {
    flex: 1,

    minHeight: 48,

    borderRadius: 13,

    backgroundColor: "#DC2626",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,
  },

  deletePressed: {
    backgroundColor: "#B91C1C",
  },

  deleteText: {
    fontSize: 15,

    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.55,
  },

  disabledDeleteButton: {
    opacity: 0.65,
  },
});