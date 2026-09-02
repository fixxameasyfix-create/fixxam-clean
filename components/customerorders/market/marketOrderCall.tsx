import React, {
  memo,
  useCallback,
} from "react";

import {
  Linking,
  Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  phone?: string;
};

function MarketOrderCall({
  phone,
}: Props) {
  const handleCall =
    useCallback(async () => {
      const cleanPhone =
        typeof phone === "string"
          ? phone.trim()
          : "";

      if (!cleanPhone) {
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
          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (error) {
        console.error(
          "MARKET_ORDER_CALL_STORE_ERROR:",
          error,
        );
      }
    }, [phone]);

  const disabled =
    !phone?.trim();

  return (
    <Pressable
      onPress={
        handleCall
      }
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Call store"
      style={({ pressed }) => [
        styles.button,
        disabled &&
          styles.disabled,
        pressed &&
          !disabled &&
          styles.pressed,
      ]}
    >
      <Ionicons
        name="call-outline"
        size={19}
        color={
          disabled
            ? "#94A3B8"
            : "#2563EB"
        }
      />

      <AppText
        weight="bold"
        style={[
          styles.text,
          disabled &&
            styles.disabledText,
        ]}
      >
        CALL STORE
      </AppText>
    </Pressable>
  );
}

export default memo(
  MarketOrderCall,
);

const styles =
  StyleSheet.create({
    button: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },

    text: {
      fontSize: 10,
      color: "#2563EB",
    },

    disabled: {
      backgroundColor:
        "#F8FAFC",
      borderColor:
        "#E2E8F0",
    },

    disabledText: {
      color: "#94A3B8",
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