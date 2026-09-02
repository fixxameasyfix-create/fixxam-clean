import React from "react";

import {
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import Toast from "react-native-toast-message";

import {
  AppText,
} from "@/components/ui";

type Props = {
  customerName: string;
  customerPhone?: string;
  orderId: string;
  onChat?: () => void;
};

export default function WorkerMarketCustomer({
  customerName,
  customerPhone,
  orderId,
  onChat,
}: Props) {
  const normalizedPhone =
    customerPhone?.trim() || "";

  const handleCall =
    async () => {
      if (!normalizedPhone) {
        Toast.show({
          type: "info",
          text1:
            "Phone unavailable",
          text2:
            "This customer does not have a phone number.",
        });

        return;
      }

      const phoneUrl =
        `tel:${normalizedPhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            phoneUrl,
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
          phoneUrl,
        );
      } catch (error) {
        console.error(
          "WORKER_MARKET_CALL_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to call customer",
          text2:
            "Please try again.",
        });
      }
    };

  const handleChat =
    () => {
      if (onChat) {
        onChat();
        return;
      }

      Toast.show({
        type: "info",
        text1:
          "Chat coming next",
        text2:
          `Order ${orderId.slice(
            0,
            9,
          )}`,
      });
    };

  return (
    <View
      style={styles.card}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        Customer
      </AppText>

      {/* ==================================================
          CUSTOMER
      ================================================== */}

      <View
        style={styles.customerRow}
      >
        <View
          style={styles.avatar}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <View
          style={styles.customerInfo}
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={
              styles.customerName
            }
          >
            {customerName ||
              "Customer"}
          </AppText>

          <AppText
            style={
              styles.customerPhone
            }
          >
            {normalizedPhone ||
              "Phone number unavailable"}
          </AppText>
        </View>
      </View>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <View
        style={styles.actions}
      >
        {/* CHAT */}

        <Pressable
          onPress={
            handleChat
          }
          style={({ pressed }) => [
            styles.actionButton,
            styles.chatButton,
            pressed &&
              styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Chat with customer"
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={19}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={
              styles.chatText
            }
          >
            Chat
          </AppText>
        </Pressable>

        {/* CALL / UNAVAILABLE */}

        <Pressable
          onPress={
            handleCall
          }
          disabled={
            !normalizedPhone
          }
          style={({ pressed }) => [
            styles.actionButton,
            normalizedPhone
              ? styles.callButton
              : styles.unavailableButton,
            pressed &&
              normalizedPhone &&
              styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            normalizedPhone
              ? "Call customer"
              : "Customer phone unavailable"
          }
          accessibilityState={{
            disabled:
              !normalizedPhone,
          }}
        >
          <Ionicons
            name={
              normalizedPhone
                ? "call-outline"
                : "close-circle-outline"
            }
            size={19}
            color={
              normalizedPhone
                ? "#FFFFFF"
                : "#94A3B8"
            }
          />

          <AppText
            weight="bold"
            style={[
              styles.actionText,
              !normalizedPhone &&
                styles.unavailableText,
            ]}
          >
            {normalizedPhone
              ? "Call"
              : "Unavailable"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    title: {
      fontSize: 16,
      color: "#0F172A",
    },

    customerRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 13,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    customerInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
    },

    customerName: {
      fontSize: 14,
      color: "#0F172A",
    },

    customerPhone: {
      marginTop: 3,
      fontSize: 10.5,
      color: "#64748B",
    },

    actions: {
      flexDirection:
        "row",
      gap: 9,
      marginTop: 14,
    },

    actionButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 13,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      borderWidth: 1,
    },

    chatButton: {
      backgroundColor:
        "#EFF6FF",
      borderColor:
        "#BFDBFE",
    },

    callButton: {
      backgroundColor:
        "#2563EB",
      borderColor:
        "#2563EB",
    },

    unavailableButton: {
      backgroundColor:
        "#F1F5F9",
      borderColor:
        "#E2E8F0",
    },

    chatText: {
      fontSize: 11,
      color: "#2563EB",
    },

    actionText: {
      fontSize: 11,
      color: "#FFFFFF",
    },

    unavailableText: {
      color: "#94A3B8",
    },

    pressed: {
      opacity: 0.8,
    },
  });