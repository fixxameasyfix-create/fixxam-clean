import React, {
  memo,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  onCall?: () => void;

  onChat?: () => void;

  calling?: boolean;

  disabled?: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketContactActions({
  onCall,
  onChat,
  calling = false,
  disabled = false,
}: Props) {
  const canCall =
    typeof onCall ===
      "function" &&
    !disabled &&
    !calling;

  const canChat =
    typeof onChat ===
      "function" &&
    !disabled &&
    !calling;

  /* ==========================================================
     FIXXAM VOICE
  ========================================================== */

  const handleCall =
    useCallback(() => {
      if (
        typeof onCall !==
        "function"
      ) {
        Toast.show({
          type:
            "info",

          text1:
            "Call unavailable",

          text2:
            "The customer account is unavailable for Fixxam Voice.",
        });

        return;
      }

      onCall();
    }, [
      onCall,
    ]);

  /* ==========================================================
     MARKET CHAT
  ========================================================== */

  const handleChat =
    useCallback(() => {
      if (
        typeof onChat !==
        "function"
      ) {
        Toast.show({
          type:
            "info",

          text1:
            "Chat unavailable",

          text2:
            "Chat is not available for this order.",
        });

        return;
      }

      onChat();
    }, [
      onChat,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          CALL CUSTOMER — FIXXAM VOICE
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Call customer with Fixxam Voice"
        accessibilityHint="Start a secure Fixxam voice call with the customer"
        accessibilityState={{
          disabled:
            !canCall,

          busy:
            calling,
        }}
        disabled={
          !canCall
        }
        onPress={
          handleCall
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,
          styles.callButton,

          !canCall
            ? styles.disabled
            : null,

          pressed &&
          canCall
            ? styles.pressed
            : null,
        ]}
      >
        {calling ? (
          <ActivityIndicator
            size="small"
            color={
              Colors.info
            }
          />
        ) : (
          <AppIcon
            name="call"
            size="xs"
            color={
              Colors.info
            }
          />
        )}

        <AppText
          variant="bodyMedium"
          weight="medium"
          numberOfLines={1}
          style={
            styles.callText
          }
        >
          {calling
            ? "Calling..."
            : "Call customer"}
        </AppText>
      </Pressable>

      {/* ======================================================
          CHAT CUSTOMER
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chat with customer"
        accessibilityHint="Open the market order conversation with the customer"
        accessibilityState={{
          disabled:
            !canChat,
        }}
        disabled={
          !canChat
        }
        onPress={
          handleChat
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,
          styles.chatButton,

          !canChat
            ? styles.disabled
            : null,

          pressed &&
          canChat
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="chat"
          size="xs"
          color={
            WorkerColors.primary
          }
        />

        <AppText
          variant="bodyMedium"
          weight="medium"
          numberOfLines={1}
          style={
            styles.chatText
          }
        >
          Chat customer
        </AppText>
      </Pressable>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketContactActions.displayName =
  "WorkerMarketContactActions";

export default memo(
  WorkerMarketContactActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       SHARED ACTION
    ======================================================== */

    actionButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CALL
    ======================================================== */

    callButton: {
      borderColor:
        Colors.info,
    },

    callText: {
      flexShrink:
        1,

      textAlign:
        "center",

      color:
        Colors.info,
    },

    /* ========================================================
       CHAT
    ======================================================== */

    chatButton: {
      borderColor:
        WorkerColors.primary,
    },

    chatText: {
      flexShrink:
        1,

      textAlign:
        "center",

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

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
  });