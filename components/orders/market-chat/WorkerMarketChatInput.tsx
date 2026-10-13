import React, {
  memo,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  styles,
} from "./workerMarketChatStyles";

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
  const insets =
    useSafeAreaInsets();

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
     SEND
  ============================================================ */

  const handleSend =
    useCallback(() => {
      if (
        sendDisabled
      ) {
        return;
      }

      onSend();
    }, [
      onSend,
      sendDisabled,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={[
        styles.inputArea,

        {
          paddingBottom:
            Math.max(
              insets.bottom,
              FixxamTokens.spacing.sm,
            ),
        },
      ]}
    >
      <View
        style={
          styles.inputContainer
        }
      >
        {/* ====================================================
            INPUT
        ==================================================== */}

        <TextInput
          value={
            text
          }
          onChangeText={
            onChangeText
          }
          onFocus={
            onFocus
          }
          placeholder="Type a message..."
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
          textAlignVertical="center"
          autoCorrect
          autoCapitalize="sentences"
          accessibilityLabel="Message"
          accessibilityHint="Type a message to the customer"
          accessibilityState={{
            disabled:
              !canCompose,
          }}
          style={
            styles.input
          }
        />

        {/* ====================================================
            SEND
        ==================================================== */}

        <Pressable
          onPress={
            handleSend
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
          style={[
            styles.sendButton,

            sendDisabled
              ? styles.sendDisabled
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
              name="next"
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