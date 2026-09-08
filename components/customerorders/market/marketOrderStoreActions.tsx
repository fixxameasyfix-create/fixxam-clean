import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Linking,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  normalizeMarketStatus,
} from "./marketOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  status: string;

  storePhone?: string;

  onCancel: () => void;

  onChat: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderStoreActions({
  status,
  storePhone,
  onCancel,
  onChat,
}: Props) {
  /* ==========================================================
     STATUS
  ========================================================== */

  const normalizedStatus =
    useMemo(
      () =>
        normalizeMarketStatus(
          status,
        ),
      [
        status,
      ],
    );

  const canCancel =
    normalizedStatus ===
    "pending";

  /* ==========================================================
     PHONE
  ========================================================== */

  const cleanPhone =
    useMemo(() => {
      if (
        typeof storePhone !==
        "string"
      ) {
        return "";
      }

      return storePhone
        .trim()
        .replace(
          /[^+\d]/g,
          "",
        );
    }, [
      storePhone,
    ]);

  const phoneUnavailable =
    cleanPhone.length === 0;

  /* ==========================================================
     CALL STORE
  ========================================================== */

  const handleCall =
    useCallback(async () => {
      if (!cleanPhone) {
        Toast.show({
          type: "info",
          text1:
            "Phone unavailable",
          text2:
            "The store phone number is not available for this order.",
        });

        return;
      }

      const url =
        `tel:${cleanPhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (!supported) {
          Toast.show({
            type: "error",
            text1:
              "Calling unavailable",
            text2:
              "Your device cannot make phone calls.",
          });

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (
        error
      ) {
        console.error(
          "MARKET_ORDER_CALL_STORE_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to call store",
          text2:
            "Please try again.",
        });
      }
    }, [
      cleanPhone,
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
          CANCEL
      ====================================================== */}

      {canCancel ? (
        <Pressable
          onPress={
            onCancel
          }
          accessibilityRole="button"
          accessibilityLabel="Cancel order"
          style={({
            pressed,
          }) => [
            styles.actionButton,
            styles.cancelButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="close"
            size="sm"
            color={
              Colors.error
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.cancelText
            }
          >
            CANCEL ORDER
          </AppText>
        </Pressable>
      ) : null}

      {/* ======================================================
          CALL STORE
      ====================================================== */}

      <Pressable
        onPress={
          handleCall
        }
        accessibilityRole="button"
        accessibilityLabel={
          phoneUnavailable
            ? "Store phone unavailable"
            : "Call store"
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,
          styles.callButton,

          phoneUnavailable
            ? styles.disabledButton
            : null,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="phone"
          role="customer"
          size="sm"
          color={
            phoneUnavailable
              ? Colors.textMuted
              : CustomerColors.primary
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={[
            styles.callText,

            phoneUnavailable
              ? styles.disabledText
              : null,
          ]}
        >
          CALL STORE
        </AppText>
      </Pressable>

      {/* ======================================================
          CHAT STORE
      ====================================================== */}

      <Pressable
        onPress={
          onChat
        }
        accessibilityRole="button"
        accessibilityLabel="Chat with store"
        style={({
          pressed,
        }) => [
          styles.actionButton,
          styles.chatButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="messages"
          role="customer"
          size="sm"
          color={
            Colors.textInverse
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.chatText
          }
        >
          CHAT STORE
        </AppText>
      </Pressable>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderStoreActions =
  memo(
    MarketOrderStoreActions,
  );

MemoizedMarketOrderStoreActions.displayName =
  "MarketOrderStoreActions";

export default MemoizedMarketOrderStoreActions;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       BUTTON
    ======================================================== */

    actionButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.button,
    },

    /* ========================================================
       CANCEL
    ======================================================== */

    cancelButton: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    cancelText: {
      color:
        Colors.error,
    },

    /* ========================================================
       CALL
    ======================================================== */

    callButton: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    callText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       CHAT
    ======================================================== */

    chatButton: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    chatText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       DISABLED
    ======================================================== */

    disabledButton: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,
    },

    disabledText: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       PRESSED
    ======================================================== */

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