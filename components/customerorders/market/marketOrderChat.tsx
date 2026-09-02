import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  AppText,
} from "@/components/ui";

type Props = {
  orderId: string;
  storeId?: string;
  sellerId?: string;
  storePhone?: string;
};

function MarketOrderChat({
  orderId,
  storeId,
  sellerId,
  storePhone,
}: Props) {
  const handleChat =
    useCallback(() => {
      const cleanOrderId =
        orderId.trim();

      if (!cleanOrderId) {
        return;
      }

      router.push(
        `/(customer)/orders/market/chat?orderId=${encodeURIComponent(
          cleanOrderId,
        )}&storeId=${encodeURIComponent(
          storeId?.trim() ?? "",
        )}&sellerId=${encodeURIComponent(
          sellerId?.trim() ?? "",
        )}&storePhone=${encodeURIComponent(
          storePhone?.trim() ?? "",
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
      style={({ pressed }) => [
        styles.button,
        pressed &&
          styles.pressed,
      ]}
    >
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={19}
        color="#FFFFFF"
      />

      <AppText
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

export default memo(
  MarketOrderChat,
);

const styles =
  StyleSheet.create({
    button: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      borderWidth: 1,
      borderColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    text: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    pressed: {
      opacity: 0.8,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });