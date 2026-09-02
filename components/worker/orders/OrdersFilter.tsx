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
            onPress={() => onChange(item)}
            style={[
              styles.button,
              active && styles.activeButton,
            ]}
          >
            <AppText
              weight="bold"
              style={[
                styles.text,
                active && styles.activeText,
              ]}
            >
              {getLabel(item)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function getLabel(value: Status) {
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
    paddingBottom: 18,
    gap: 10,
  },

  button: {
    height: 42,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  activeButton: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },

  text: {
    fontSize: 14,
    color: "#475569",
  },

  activeText: {
    color: "#FFFFFF",
  },
});