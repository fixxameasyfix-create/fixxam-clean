import React, {
  memo,
  useCallback,
} from "react";

import {
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  status: string;
  storePhone?: string;
  onCancel: () => void;
  onChat: () => void;
};

function MarketOrderStoreActions({
  status,
  storePhone,
  onCancel,
  onChat,
}: Props) {
  const canCancel =
    status === "pending";

  const handleCall =
    useCallback(async () => {
      const phone =
        typeof storePhone ===
          "string"
          ? storePhone.trim()
          : "";

      if (!phone) {
        return;
      }

      const url = `tel:${phone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (supported) {
          await Linking.openURL(
            url,
          );
        }
      } catch (error) {
        console.error(
          "MARKET_ORDER_CALL_STORE_ERROR:",
          error,
        );
      }
    }, [storePhone]);

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ====================================================
          CANCEL
      ==================================================== */}

      {canCancel ? (
        <Pressable
          onPress={
            onCancel
          }
          accessibilityRole="button"
          accessibilityLabel="Cancel order"
          style={({ pressed }) => [
            styles.actionButton,
            styles.cancelButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="close-circle-outline"
            size={19}
            color="#DC2626"
          />

          <AppText
            weight="bold"
            style={
              styles.cancelText
            }
          >
            CANCEL ORDER
          </AppText>
        </Pressable>
      ) : null}

      {/* ====================================================
          CALL STORE
      ==================================================== */}

      <Pressable
        onPress={
          handleCall
        }
        disabled={
          !storePhone
        }
        accessibilityRole="button"
        accessibilityLabel="Call store"
        style={({ pressed }) => [
          styles.actionButton,
          styles.callButton,
          !storePhone &&
            styles.disabledButton,
          pressed &&
            storePhone &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name="call-outline"
          size={19}
          color={
            storePhone
              ? "#2563EB"
              : "#94A3B8"
          }
        />

        <AppText
          weight="bold"
          style={[
            styles.callText,
            !storePhone &&
              styles.disabledText,
          ]}
        >
          CALL STORE
        </AppText>
      </Pressable>

      {/* ====================================================
          CHAT STORE
      ==================================================== */}

      <Pressable
        onPress={
          onChat
        }
        accessibilityRole="button"
        accessibilityLabel="Chat with store"
        style={({ pressed }) => [
          styles.actionButton,
          styles.chatButton,
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
            styles.chatText
          }
        >
          CHAT STORE
        </AppText>
      </Pressable>
    </View>
  );
}

export default memo(
  MarketOrderStoreActions,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 12,
      gap: 8,
    },

    actionButton: {
      minHeight: 48,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      borderWidth: 1,
    },

    cancelButton: {
      backgroundColor:
        "#FEF2F2",
      borderColor:
        "#FECACA",
    },

    cancelText: {
      fontSize: 10,
      color: "#DC2626",
    },

    callButton: {
      backgroundColor:
        "#EFF6FF",
      borderColor:
        "#BFDBFE",
    },

    callText: {
      fontSize: 10,
      color: "#2563EB",
    },

    chatButton: {
      backgroundColor:
        "#2563EB",
      borderColor:
        "#2563EB",
    },

    chatText: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    disabledButton: {
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