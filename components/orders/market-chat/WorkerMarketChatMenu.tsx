import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  deleting: boolean;

  hasPhone: boolean;

  onClose: () => void;

  onCall: () => void;

  onDelete: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketChatMenu({
  visible,
  deleting,
  hasPhone,
  onClose,
  onCall,
  onDelete,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const callDisabled =
    deleting ||
    !hasPhone;

  /* ============================================================
     CLOSE GUARD
  ============================================================ */

  const handleClose =
    () => {
      if (deleting) {
        return;
      }

      onClose();
    };

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close chat options"
        style={[
          styles.menuOverlay,

          {
            paddingTop:
              insets.top +
              FixxamTokens.size.headerHeight,

            paddingRight:
              FixxamTokens.spacing.md,
          },
        ]}
        onPress={
          handleClose
        }
      >
        <Pressable
          accessibilityRole="none"
          style={
            styles.menuCard
          }
          onPress={
            event => {
              event.stopPropagation();
            }
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.menuHeader
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.menuTitle
              }
            >
              Chat Options
            </AppText>

            <Pressable
              onPress={
                handleClose
              }
              disabled={
                deleting
              }
              accessibilityRole="button"
              accessibilityLabel="Close chat options"
              accessibilityState={{
                disabled:
                  deleting,
              }}
              hitSlop={4}
              style={({
                pressed,
              }) => [
                styles.menuClose,

                deleting
                  ? styles.disabled
                  : null,

                pressed &&
                !deleting
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                size="sm"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          {/* ==================================================
              CALL CUSTOMER
          ================================================== */}

          <Pressable
            onPress={
              onCall
            }
            disabled={
              callDisabled
            }
            accessibilityRole="button"
            accessibilityLabel="Call customer"
            accessibilityHint={
              hasPhone
                ? "Opens the phone dialer"
                : "Customer phone number is unavailable"
            }
            accessibilityState={{
              disabled:
                callDisabled,
            }}
            style={({
              pressed,
            }) => [
              styles.menuItem,

              callDisabled
                ? styles.disabled
                : null,

              pressed &&
              !callDisabled
                ? styles.menuItemPressed
                : null,
            ]}
          >
            <View
              style={[
                styles.menuIcon,
                styles.callIcon,
              ]}
            >
              <AppIcon
                name="phone"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.menuItemInfo
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.menuItemTitle
                }
              >
                Call Customer
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.menuItemSubtitle
                }
              >
                {hasPhone
                  ? "Call the customer directly"
                  : "Customer phone unavailable"}
              </AppText>
            </View>

            <AppIcon
              name="next"
              size="xs"
              color={
                Colors.textMuted
              }
            />
          </Pressable>

          {/* ==================================================
              DELETE OWN MESSAGES
          ================================================== */}

          <Pressable
            onPress={
              onDelete
            }
            disabled={
              deleting
            }
            accessibilityRole="button"
            accessibilityLabel="Delete my messages"
            accessibilityHint="Deletes only messages you sent in this chat"
            accessibilityState={{
              disabled:
                deleting,

              busy:
                deleting,
            }}
            style={({
              pressed,
            }) => [
              styles.menuItem,
              styles.deleteMenuItem,

              deleting
                ? styles.disabled
                : null,

              pressed &&
              !deleting
                ? styles.menuItemPressed
                : null,
            ]}
          >
            <View
              style={[
                styles.menuIcon,
                styles.deleteIcon,
              ]}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.error
                  }
                />
              ) : (
                <AppIcon
                  name="delete"
                  size="sm"
                  color={
                    Colors.error
                  }
                />
              )}
            </View>

            <View
              style={
                styles.menuItemInfo
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.deleteTitle
                }
              >
                {deleting
                  ? "Deleting Messages..."
                  : "Delete My Messages"}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.menuItemSubtitle
                }
              >
                Delete only the messages you sent
              </AppText>
            </View>

            <AppIcon
              name="next"
              size="xs"
              color={
                Colors.textMuted
              }
            />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default memo(
  WorkerMarketChatMenu,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       OVERLAY
    ========================================================== */

    menuOverlay: {
      flex: 1,

      alignItems:
        "flex-end",

      justifyContent:
        "flex-start",

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ==========================================================
       CARD
    ========================================================== */

    menuCard: {
      width: 288,

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    menuHeader: {
      minHeight: 56,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    menuTitle: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    menuClose: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ==========================================================
       MENU ITEM
    ========================================================== */

    menuItem: {
      minHeight: 72,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    deleteMenuItem: {
      borderBottomWidth: 0,
    },

    menuItemPressed: {
      backgroundColor:
        Colors.background,
    },

    menuIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    callIcon: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    deleteIcon: {
      backgroundColor:
        Colors.errorSoft,
    },

    menuItemInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    menuItemTitle: {
      color:
        Colors.textPrimary,
    },

    deleteTitle: {
      color:
        Colors.error,
    },

    menuItemSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       INTERACTION
    ========================================================== */

    pressed: {
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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });