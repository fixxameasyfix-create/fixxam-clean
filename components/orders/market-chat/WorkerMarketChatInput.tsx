import React, {
  memo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppIcon,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  text: string;

  sending: boolean;

  deleting: boolean;

  loadingOrder: boolean;

  orderAvailable: boolean;

  onChangeText: (
    value: string,
  ) => void;

  onFocus: () => void;

  onSend: () => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_MESSAGE_LENGTH =
  1000;

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketChatInput({
  text,
  sending,
  deleting,
  loadingOrder,
  orderAvailable,
  onChangeText,
  onFocus,
  onSend,
}: Props) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  /* ============================================================
     STATE
  ============================================================ */

  const canCompose =
    !sending &&
    !deleting &&
    !loadingOrder &&
    orderAvailable;

  const hasMessage =
    text.trim().length >
    0;

  const sendDisabled =
    !canCompose ||
    !hasMessage;

  /* ============================================================
     FOCUS
  ============================================================ */

  const handleFocus =
    () => {
      setFocused(
        true,
      );

      onFocus();
    };

  const handleBlur =
    () => {
      setFocused(
        false,
      );
    };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.inputArea
      }
    >
      <View
        style={[
          styles.inputContainer,

          focused &&
          canCompose
            ? styles.inputContainerFocused
            : null,

          !canCompose
            ? styles.inputContainerDisabled
            : null,
        ]}
      >
        <TextInput
          value={
            text
          }
          onChangeText={
            onChangeText
          }
          onFocus={
            handleFocus
          }
          onBlur={
            handleBlur
          }
          placeholder={
            orderAvailable
              ? "Reply to customer..."
              : "Chat unavailable"
          }
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            WorkerColors.primary
          }
          cursorColor={
            WorkerColors.primary
          }
          multiline
          maxLength={
            MAX_MESSAGE_LENGTH
          }
          editable={
            canCompose
          }
          blurOnSubmit={
            false
          }
          returnKeyType="default"
          textAlignVertical="center"
          autoCorrect
          autoCapitalize="sentences"
          accessibilityLabel="Message customer"
          accessibilityState={{
            disabled:
              !canCompose,
          }}
          style={
            styles.input
          }
        />

        <Pressable
          onPress={
            onSend
          }
          disabled={
            sendDisabled
          }
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{
            disabled:
              sendDisabled,

            busy:
              sending,
          }}
          style={({
            pressed,
          }) => [
            styles.sendButton,

            sendDisabled
              ? styles.sendDisabled
              : null,

            pressed &&
            !sendDisabled
              ? styles.sendPressed
              : null,
          ]}
        >
          {sending ? (
            <ActivityIndicator
              size="small"
              color={
                Colors.textInverse
              }
            />
          ) : (
            <AppIcon
              name="arrow-up"
              role="worker"
              size="sm"
              color={
                Colors.textInverse
              }
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default memo(
  WorkerMarketChatInput,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    inputArea: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        Platform.OS ===
        "ios"
          ? FixxamTokens.spacing.lg
          : FixxamTokens.spacing.sm,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    /* ==========================================================
       INPUT
    ========================================================== */

    inputContainer: {
      minHeight: 52,

      maxHeight: 120,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.background,
    },

    inputContainerFocused: {
      borderColor:
        WorkerColors.primary,
    },

    inputContainerDisabled: {
      backgroundColor:
        Colors.disabledBackground,
    },

    input: {
      flex: 1,

      minWidth: 0,

      minHeight: 44,

      maxHeight: 104,

      paddingHorizontal: 0,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.sm,

      fontSize:
        Typography.fontSize.md,

      lineHeight: 20,

      color:
        Colors.textPrimary,

      includeFontPadding:
        false,
    },

    /* ==========================================================
       SEND
    ========================================================== */

    sendButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginBottom:
        FixxamTokens.spacing.xs,

      marginLeft:
        FixxamTokens.spacing.xs,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primary,
    },

    sendDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    sendPressed: {
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
  });