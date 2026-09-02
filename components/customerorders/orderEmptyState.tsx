import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import type {
  FilterType,
} from "./orders.types";

type Props = {
  filter: FilterType;
  error?: string | null;
  onLogin?: () => void;
};

export default function OrderEmptyState({
  filter,
  error,
  onLogin,
}: Props) {
  const icon =
    filter === "completed"
      ? "checkmark-done-outline"
      : filter === "cancelled"
      ? "close-circle-outline"
      : filter === "active"
      ? "construct-outline"
      : "receipt-outline";

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name={
            error
              ? "alert-circle-outline"
              : icon
          }
          size={27}
          color={
            error
              ? "#DC2626"
              : "#2563EB"
          }
        />
      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        {error
          ? "Unable to load orders"
          : "No orders found"}
      </AppText>

      <AppText
        center
        style={styles.text}
      >
        {error ??
          (filter === "all"
            ? "You haven't placed any service orders yet."
            : `You don't have any ${filter} orders.`)}
      </AppText>

      {onLogin ? (
        <Pressable
          onPress={onLogin}
          style={styles.login}
        >
          <Ionicons
            name="log-in-outline"
            size={17}
            color="#FFFFFF"
          />

          <AppText
            weight="bold"
            style={styles.loginText}
          >
            Login
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      minHeight: 250,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 25,
    },

    icon: {
      width: 58,
      height: 58,
      borderRadius: 19,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    title: {
      marginTop: 12,
      fontSize: 15,
      color: "#0F172A",
    },

    text: {
      marginTop: 5,
      fontSize: 10.5,
      lineHeight: 17,
      color: "#64748B",
    },

    login: {
      marginTop: 14,
      height: 40,
      minWidth: 110,
      paddingHorizontal: 18,
      borderRadius: 11,
      backgroundColor: "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    loginText: {
      fontSize: 11.5,
      color: "#FFFFFF",
    },
  });