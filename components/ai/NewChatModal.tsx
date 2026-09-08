import React, {
  memo,
} from "react";

import {
  Modal,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppButton,
  AppCard,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

interface Props {
  visible: boolean;

  canSave: boolean;

  onCancel: () => void;

  onClear: () => void;

  onSave: () => void;
}

/* ==============================================================
   COMPONENT
============================================================== */

function NewChatModal({
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
        <AppCard
          role="customer"
          variant="elevated"
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
              size={
                FixxamTokens.size
                  .iconXl
              }
              color={
                CustomerColors.primary
              }
            />
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            variant="heading2"
            weight="semibold"
          >
            Start a new chat?
          </AppText>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.message
            }
          >
            Do you want to clear this
            conversation or save it to
            History before starting a new
            chat?
          </AppText>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            {/* CANCEL */}

            <AppButton
              title="Cancel"
              role="customer"
              variant="outline"
              onPress={onCancel}
              style={
                styles.button
              }
            />

            {/* CLEAR */}

            <AppButton
              title="Clear & New Chat"
              role="customer"
              variant="danger"
              onPress={onClear}
              leftIcon={
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={
                    FixxamTokens.size
                      .iconSm
                  }
                  color={
                    Colors.textInverse
                  }
                />
              }
              style={
                styles.button
              }
            />

            {/* SAVE */}

            <AppButton
              title={
                canSave
                  ? "Save & New Chat"
                  : "History Full (5/5)"
              }
              role="customer"
              disabled={
                !canSave
              }
              onPress={onSave}
              leftIcon={
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={
                    FixxamTokens.size
                      .iconSm
                  }
                  color={
                    canSave
                      ? Colors.textInverse
                      : Colors.textMuted
                  }
                />
              }
              style={
                styles.button
              }
            />
          </View>

          {/* ==================================================
              HISTORY LIMIT
          ================================================== */}

          {!canSave ? (
            <View
              style={
                styles.historyNotice
              }
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={
                  FixxamTokens.size
                    .iconXs
                }
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.historyNoticeText
                }
              >
                Delete an old chat from
                History before saving a
                new one.
              </AppText>
            </View>
          ) : null}
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
        CustomerColors.primarySoft,
    },

    message: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    actions: {
      width: "100%",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xxl,
    },

    button: {
      width: "100%",
    },

    historyNotice: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    historyNoticeText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },
  });

export default memo(
  NewChatModal,
);