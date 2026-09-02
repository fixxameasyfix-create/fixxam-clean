import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

const filters = [
  "all",
  "pending",
  "negotiating",
  "accepted",
  "on_the_way",
  "in_progress",
  "completed",
  "cancelled",
] as const;

type Status = (typeof filters)[number];

type Props = {
  value: Status;
  onChange: (status: Status) => void;
};

export default function OrdersFilter({
  value,
  onChange,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((item) => {
        const active = value === item;

        return (
          <Pressable
            key={item}
            android_ripple={{
              color: "#DBEAFE",
            }}
            onPress={() => onChange(item)}
            style={({ pressed }) => [
              styles.button,
              active && styles.activeButton,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              weight="bold"
              style={[
                styles.text,
                active && styles.activeText,
              ]}
            >
              {label(item)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function label(value: Status) {
  switch (value) {
    case "all":
      return "All";

    case "pending":
      return "Pending";

    case "negotiating":
      return "Negotiating";

    case "accepted":
      return "Accepted";

    case "on_the_way":
      return "On the Way";

    case "in_progress":
      return "In Progress";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return value;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    paddingBottom: 12,
    gap: 8,
  },

  button: {
    height: 38,
    paddingHorizontal: 16,

    borderRadius: 19,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    justifyContent: "center",
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",

    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  text: {
    fontSize: 13,
    color: "#64748B",
  },

  activeText: {
    color: "#2563EB",
  },
});