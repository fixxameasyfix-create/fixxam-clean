import React, {
  PropsWithChildren,
  memo,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

function BookingSummarySheet({
  children,
  visible,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* BACKDROP */}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close booking review"
        />

        {/* MODAL */}

        <View style={styles.modal}>
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.handle} />

            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close booking review"
              style={({ pressed }) => [
                styles.closeButton,
                pressed &&
                  styles.closePressed,
              ]}
            >
              <Ionicons
                name="close"
                size={21}
                color="#0F172A"
              />
            </Pressable>
          </View>

          {/* BOOKING CONTENT */}

          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default memo(
  BookingSummarySheet,
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(15, 23, 42, 0.58)",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 12,
    paddingVertical: 24,
  },

  modal: {
    width: "100%",

    maxWidth: 500,
    maxHeight: "92%",

    backgroundColor: "#F8FAFC",

    borderRadius: 28,

    overflow: "hidden",

    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 28,

    shadowOffset: {
      width: 0,
      height: 12,
    },

    elevation: 20,
  },

  header: {
    height: 52,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  handle: {
    width: 40,
    height: 4,

    borderRadius: 999,

    backgroundColor: "#CBD5E1",
  },

  closeButton: {
    position: "absolute",

    top: 9,
    right: 12,

    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",
  },

  closePressed: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  content: {
    flexShrink: 1,
  },
});