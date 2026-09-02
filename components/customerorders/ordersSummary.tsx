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
  AppText,
} from "@/components/ui";

import type {
  OrderStatus,
} from "./orders.types";

export type OrderCounts = {
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

type Props = {
  counts: OrderCounts;
  authenticated: boolean;
  onManage: () => void;
};

function OrderSummary({
  counts,
  authenticated,
  onManage,
}: Props) {
  const total =
    counts.pending +
    counts.active +
    counts.completed +
    counts.cancelled;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Order Overview
          </AppText>

          <AppText
            style={styles.subtitle}
          >
            {total}{" "}
            {total === 1
              ? "order"
              : "orders"}{" "}
            in total
          </AppText>
        </View>

        <Pressable
          onPress={onManage}
          disabled={!authenticated}
          style={styles.manage}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={
              authenticated
                ? "#2563EB"
                : "#CBD5E1"
            }
          />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat
          label="Pending"
          value={counts.pending}
          icon="time-outline"
          color="#D97706"
        />

        <Stat
          label="Active"
          value={counts.active}
          icon="construct-outline"
          color="#2563EB"
        />

        <Stat
          label="Done"
          value={counts.completed}
          icon="checkmark-circle-outline"
          color="#16A34A"
        />

        <Stat
          label="Cancelled"
          value={counts.cancelled}
          icon="close-circle-outline"
          color="#DC2626"
        />
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon}
        size={16}
        color={color}
      />

      <AppText
        weight="bold"
        style={[
          styles.value,
          { color },
        ]}
      >
        {value}
      </AppText>

      <AppText
        style={styles.label}
      >
        {label}
      </AppText>
    </View>
  );
}

export default memo(OrderSummary);

const styles =
  StyleSheet.create({
    card: {
      marginTop: 9,
      padding: 11,
      borderRadius: 16,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    title: {
      fontSize: 12.5,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 1,
      fontSize: 8.5,
      color: "#64748B",
    },

    manage: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    stats: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    stat: {
      flex: 1,
      alignItems: "center",
    },

    value: {
      marginTop: 2,
      fontSize: 14,
    },

    label: {
      marginTop: 1,
      fontSize: 8,
      color: "#64748B",
    },
  });