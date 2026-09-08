import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
} from "react-native";

import {
  router,
} from "expo-router";

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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  storeId?: string;

  sellerId?: string;

  storePhone?: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderChat({
  orderId,
  storeId,
  sellerId,
  storePhone,
}: Props) {
  const handleChat =
    useCallback(() => {
      const cleanOrderId =
        typeof orderId === "string"
          ? orderId.trim()
          : "";

      if (!cleanOrderId) {
        Toast.show({
          type: "error",
          text1: "Unable to open chat",
          text2: "Order ID is missing.",
        });

        return;
      }

      const cleanStoreId =
        typeof storeId === "string"
          ? storeId.trim()
          : "";

      const cleanSellerId =
        typeof sellerId === "string"
          ? sellerId.trim()
          : "";

      const cleanStorePhone =
        typeof storePhone === "string"
          ? storePhone.trim()
          : "";

      /*
       * Keep the existing market-chat route
       * and all existing params unchanged.
       */
      router.push(
        `/(customer)/orders/market/chat?orderId=${encodeURIComponent(
          cleanOrderId,
        )}&storeId=${encodeURIComponent(
          cleanStoreId,
        )}&sellerId=${encodeURIComponent(
          cleanSellerId,
        )}&storePhone=${encodeURIComponent(
          cleanStorePhone,
        )}&type=market`,
      );
    }, [
      orderId,
      storeId,
      sellerId,
      storePhone,
    ]);

  return (
    <Pressable
      onPress={
        handleChat
      }
      accessibilityRole="button"
      accessibilityLabel="Chat with store"
      style={({
        pressed,
      }) => [
        styles.button,

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
          styles.text
        }
      >
        CHAT STORE
      </AppText>
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderChat =
  memo(
    MarketOrderChat,
  );

MemoizedMarketOrderChat.displayName =
  "MarketOrderChat";

export default MemoizedMarketOrderChat;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    button: {
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

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    text: {
      color:
        Colors.textInverse,
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