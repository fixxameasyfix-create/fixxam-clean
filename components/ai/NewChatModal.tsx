import React from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

interface Props {
  visible: boolean;

  canSave: boolean;

  onCancel: () => void;

  onClear: () => void;

  onSave: () => void;
}

export default function NewChatModal({
  visible,
  canSave,
  onCancel,
  onClear,
  onSave,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View
        style={
          styles.overlay
        }
      >
        <View
          style={
            styles.modal
          }
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.iconContainer
            }
          >
            <MaterialCommunityIcons
              name="chat-plus-outline"
              size={34}
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
            Start a new chat?
          </AppText>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <AppText
            style={
              styles.message
            }
          >
            Do you want to clear this
            conversation or save it
            to History before starting
            a new chat?
          </AppText>

          {/* ==================================================
              CANCEL
          ================================================== */}

          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [
              styles.cancelButton,

              pressed &&
                styles.pressed,
            ]}
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

          {/* ==================================================
              CLEAR
          ================================================== */}

          <Pressable
            onPress={onClear}
            style={({ pressed }) => [
              styles.clearButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={20}
              color="#DC2626"
            />

            <AppText
              weight="bold"
              style={
                styles.clearText
              }
            >
              Clear & New Chat
            </AppText>
          </Pressable>

          {/* ==================================================
              SAVE
          ================================================== */}

          <Pressable
            disabled={!canSave}
            onPress={onSave}
            style={({ pressed }) => [
              styles.saveButton,

              !canSave &&
                styles.disabledButton,

              pressed &&
                canSave &&
                styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name="content-save-outline"
              size={20}
              color={
                canSave
                  ? "#FFFFFF"
                  : "#94A3B8"
              }
            />

            <AppText
              weight="bold"
              style={[
                styles.saveText,

                !canSave &&
                  styles.disabledText,
              ]}
            >
              {canSave
                ? "Save & New Chat"
                : "History Full (5/5)"}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "rgba(15, 23, 42, 0.55)",

      paddingHorizontal: 28,
    },

    modal: {
      width: "100%",

      maxWidth: 390,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 26,

      padding: 24,

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height: 10,
      },

      shadowOpacity: 0.18,

      shadowRadius: 20,

      elevation: 12,
    },

    iconContainer: {
      width: 64,

      height: 64,

      borderRadius: 20,

      backgroundColor:
        "#EFF6FF",

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 18,
    },

    title: {
      fontSize: 22,

      lineHeight: 28,

      color: "#0F172A",
    },

    message: {
      marginTop: 9,

      fontSize: 15,

      lineHeight: 22,

      color: "#64748B",
    },

    cancelButton: {
      minHeight: 46,

      marginTop: 24,

      borderRadius: 13,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F8FAFC",
    },

    cancelText: {
      fontSize: 15,

      color: "#475569",
    },

    clearButton: {
      minHeight: 46,

      marginTop: 9,

      borderRadius: 13,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 8,

      backgroundColor:
        "#FEF2F2",
    },

    clearText: {
      fontSize: 15,

      color: "#DC2626",
    },

    saveButton: {
      minHeight: 46,

      marginTop: 9,

      borderRadius: 13,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 8,

      backgroundColor:
        "#2563EB",
    },

    saveText: {
      fontSize: 15,

      color: "#FFFFFF",
    },

    disabledButton: {
      backgroundColor:
        "#F1F5F9",
    },

    disabledText: {
      color: "#94A3B8",
    },

    pressed: {
      opacity: 0.82,
    },
  });