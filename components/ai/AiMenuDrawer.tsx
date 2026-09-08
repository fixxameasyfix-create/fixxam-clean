import React, {
  memo,
  useCallback,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import Animated, {
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
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
   * Requests the parent screen
   * to open Clear Chat confirmation.
   *
   * This drawer never clears
   * the conversation directly.
   */
  onClear: () => void;
}

/* ==============================================================
   COMPONENT
============================================================== */

function AiMenuDrawer({
  visible,
  onClose,
  onNewChat,
  onHistory,
  onClear,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const {
    width: screenWidth,
  } =
    useWindowDimensions();

  /* ============================================================
     RESPONSIVE WIDTH
  ============================================================ */

  const drawerWidth =
    Math.min(
      320,
      Math.max(
        280,
        screenWidth * 0.82,
      ),
    );

  /* ============================================================
     NEW CHAT
  ============================================================ */

  const handleNewChat =
    useCallback(() => {
      onClose();

      onNewChat();
    }, [
      onClose,
      onNewChat,
    ]);

  /* ============================================================
     HISTORY
  ============================================================ */

  const handleHistory =
    useCallback(() => {
      onClose();

      onHistory();
    }, [
      onClose,
      onHistory,
    ]);

  /* ============================================================
     CLEAR CHAT
  ============================================================ */

  const handleClearChat =
    useCallback(() => {
      onClose();

      onClear();
    }, [
      onClose,
      onClear,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={
          styles.overlay
        }
      >
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={onClose}
          style={
            styles.backdrop
          }
        />

        {/* ====================================================
            DRAWER
        ==================================================== */}

        <Animated.View
          entering={
            SlideInRight.duration(
              FixxamTokens.motion
                .normal,
            )
          }
          exiting={
            SlideOutRight.duration(
              FixxamTokens.motion
                .fast,
            )
          }
          style={[
            styles.drawer,

            {
              width:
                drawerWidth,

              paddingTop:
                insets.top +
                FixxamTokens
                  .spacing.lg,

              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens
                    .spacing.lg,
                ),
            },
          ]}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerText
              }
            >
              <AppText
                variant="heading2"
                weight="semibold"
                numberOfLines={1}
              >
                Menu
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.subtitle
                }
              >
                Fixxam Smarter
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              hitSlop={8}
              onPress={onClose}
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed
                  ? styles.closePressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                role="customer"
                size="sm"
                state="muted"
              />
            </Pressable>
          </View>

          {/* ==================================================
              PRIMARY MENU
          ================================================== */}

          <View
            style={
              styles.menuItems
            }
          >
            <MenuItem
              icon="messages"
              title="New Chat"
              onPress={
                handleNewChat
              }
            />

            <MenuItem
              icon="clock"
              title="History"
              onPress={
                handleHistory
              }
            />
          </View>

          {/* ==================================================
              DIVIDER
          ================================================== */}

          <View
            style={
              styles.divider
            }
          />

          {/* ==================================================
              DANGER ACTION
          ================================================== */}

          <MenuItem
            icon="delete"
            title="Clear Chat"
            danger
            onPress={
              handleClearChat
            }
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      flexDirection: "row",

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ========================================================
       BACKDROP
    ======================================================== */

    backdrop: {
      flex: 1,
    },

    /* ========================================================
       DRAWER
    ======================================================== */

    drawer: {
      height: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderBottomLeftRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.modal,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    closePressed: {
      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    /* ========================================================
       MENU ITEMS
    ======================================================== */

    menuItems: {
      gap:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height: 1,

      marginVertical:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.divider,
    },
  });

export default memo(
  AiMenuDrawer,
);