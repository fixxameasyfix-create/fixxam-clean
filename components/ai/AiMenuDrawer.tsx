import React, {
  useCallback,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

import { AppText } from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import MenuItem from "./MenuItem";

/* ==============================================================
   TYPES
============================================================== */

interface Props {
  visible: boolean;

  onClose: () => void;

  onNewChat: () => void;

  onHistory: () => void;

  /**
   * Requests the parent screen to show
   * the Clear Chat confirmation modal.
   *
   * This component must NEVER delete
   * the current conversation itself.
   */
  onClear: () => void;
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function AiMenuDrawer({
  visible,
  onClose,
  onNewChat,
  onHistory,
  onClear,
}: Props) {
  /* ============================================================
     NEW CHAT
  ============================================================ */

  const handleNewChat = useCallback(() => {
    /*
     * Close drawer first.
     *
     * Parent screen decides whether to:
     * - start immediately
     * - show Save / Clear confirmation
     */
    onClose();
    onNewChat();
  }, [
    onClose,
    onNewChat,
  ]);

  /* ============================================================
     HISTORY
  ============================================================ */

  const handleHistory = useCallback(() => {
    /*
     * Close drawer before navigation.
     */
    onClose();
    onHistory();
  }, [
    onClose,
    onHistory,
  ]);

  /* ============================================================
     CLEAR CHAT
  ============================================================ */

  const handleClearChat = useCallback(() => {
    /*
     * IMPORTANT:
     *
     * This component does NOT clear
     * any conversation.
     *
     * It only tells the parent screen
     * to open the confirmation modal.
     */
    onClose();
    onClear();
  }, [
    onClose,
    onClear,
  ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />

        {/* ====================================================
            DRAWER
        ==================================================== */}

        <Animated.View
          entering={SlideInRight.duration(220)}
          exiting={SlideOutRight.duration(180)}
          style={styles.drawer}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <AppText
              weight="bold"
              style={styles.title}
            >
              Menu
            </AppText>
          </View>

          {/* ==================================================
              NEW CHAT
          ================================================== */}

          <MenuItem
            icon="chatbubble-ellipses-outline"
            title="New Chat"
            onPress={handleNewChat}
          />

          {/* ==================================================
              HISTORY
          ================================================== */}

          <MenuItem
            icon="time-outline"
            title="History"
            onPress={handleHistory}
          />

          {/* ==================================================
              DIVIDER
          ================================================== */}

          <View
            style={styles.divider}
          />

          {/* ==================================================
              CLEAR CHAT
          ================================================== */}

          <MenuItem
            icon="trash-outline"
            title="Clear Chat"
            danger
            onPress={handleClearChat}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  /* ============================================================
     OVERLAY
  ============================================================ */

  overlay: {
    flex: 1,

    flexDirection: "row",

    justifyContent: "flex-end",

    backgroundColor:
      "rgba(0, 0, 0, 0.35)",
  },

  /* ============================================================
     BACKDROP
  ============================================================ */

  backdrop: {
    flex: 1,
  },

  /* ============================================================
     DRAWER
  ============================================================ */

  drawer: {
    width: 300,

    backgroundColor: "#FFFFFF",

    paddingTop: 70,

    paddingHorizontal: 18,

    borderTopLeftRadius: 28,

    borderBottomLeftRadius: 28,

    ...FixxamTokens.shadow.card,
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    marginBottom: 22,
  },

  title: {
    fontSize: 24,

    lineHeight: 30,

    color:
      CustomerColors.textPrimary,
  },

  /* ============================================================
     DIVIDER
  ============================================================ */

  divider: {
    height: 1,

    backgroundColor:
      "#EEF2F7",

    marginVertical: 18,
  },
});