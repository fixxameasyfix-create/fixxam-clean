import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

type Props = {
  status:
    | "online"
    | "offline"
    | "busy"
    | "verified"
    | "pending";
};

const STATUS = {
  online: {
    label: "Online",
    color: "#16A34A",
    backgroundColor: "#DCFCE7",
    icon: "check-circle",
  },

  offline: {
    label: "Offline",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    icon: "close-circle",
  },

  busy: {
    label: "Busy",
    color: "#EA580C",
    backgroundColor: "#FFEDD5",
    icon: "clock-outline",
  },

  verified: {
    label: "Verified",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    icon: "shield-check",
  },

  pending: {
    label: "Pending",
    color: "#D97706",
    backgroundColor: "#FEF3C7",
    icon: "progress-clock",
  },
};

export default function AppStatus({
  status,
}: Props) {
  const item = STATUS[status];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            item.backgroundColor,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={16}
        color={item.color}
      />

      <AppText
        weight="bold"
        style={[
          styles.text,
          {
            color: item.color,
          },
        ]}
      >
        {item.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 999,
  },

  text: {
    marginLeft: 6,
    fontSize: 12,
  },
});