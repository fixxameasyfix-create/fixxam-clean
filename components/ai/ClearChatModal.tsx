import React, {
  memo,
} from "react";

import {
  Modal,
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

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

function ClearChatModal({
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
        deleting
          ? undefined
          : onCancel
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        <AppCard
          variant="elevated"
          style={styles.modal}
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.iconContainer
            }
          >
            <AppIcon
              name="delete"
              role="customer"
              size="xl"
              state="error"
            />
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            variant="heading2"
            weight="semibold"
            center
          >
            Clear Chat?
          </AppText>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.message
            }
          >
            Are you sure you want to
            clear this chat? This action
            cannot be undone.
          </AppText>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            <AppButton
              title="Cancel"
              role="customer"
              variant="outline"
              disabled={deleting}
              onPress={onCancel}
              style={
                styles.actionButton
              }
            />

            <AppButton
              title={
                deleting
                  ? "Deleting..."
                  : "Delete"
              }
              role="customer"
              variant="danger"
              leftIconName={
                deleting
                  ? undefined
                  : "delete"
              }
              loading={deleting}
              disabled={deleting}
              onPress={onDelete}
              style={
                styles.actionButton
              }
            />
          </View>
        </AppCard>
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

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.overlayStrong,
    },

    modal: {
      width: "100%",

      maxWidth: 390,

      alignItems: "center",

      padding:
        FixxamTokens.spacing.xxl,
    },

    iconContainer: {
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      alignItems: "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    message: {
      maxWidth: 310,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    actions: {
      width: "100%",

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xxl,
    },

    actionButton: {
      flex: 1,
    },
  });

export default memo(
  ClearChatModal,
);