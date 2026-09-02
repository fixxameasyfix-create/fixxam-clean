import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
} from "expo-router";

import {
  AppText,
} from "@/components/ui";

type Props = {
  authenticated: boolean;
  onManage: () => void;
};

function OrdersHeader({
  authenticated,
  onManage,
}: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color="#0F172A"
        />
      </Pressable>

      <View style={styles.text}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          My Orders
        </AppText>

        <AppText
          style={styles.subtitle}
        >
          Track and manage your
          service requests
        </AppText>
      </View>

      <Pressable
        disabled={!authenticated}
        onPress={onManage}
        accessibilityRole="button"
        accessibilityLabel="Manage orders"
        style={({ pressed }) => [
          styles.button,

          !authenticated &&
            styles.disabled,

          pressed &&
            authenticated &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name="options-outline"
          size={20}
          color={
            authenticated
              ? "#0F172A"
              : "#CBD5E1"
          }
        />
      </Pressable>
    </View>
  );
}

export default memo(OrdersHeader);

const styles =
  StyleSheet.create({
    header: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
    },

    button: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    disabled: {
      backgroundColor: "#F8FAFC",
      opacity: 0.7,
    },

    text: {
      flex: 1,
      minWidth: 0,
      marginHorizontal: 9,
    },

    title: {
      fontSize: 19,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 1,
      fontSize: 9.5,
      color: "#64748B",
    },

    pressed: {
      opacity: 0.7,
      transform: [{ scale: 0.97 }],
    },
  });