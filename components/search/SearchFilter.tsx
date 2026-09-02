import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

export type SearchFilterType =
  | "all"
  | "services"
  | "workers";

type Props = {
  value: SearchFilterType;
  onChange: (
    value: SearchFilterType,
  ) => void;
};

const filters: SearchFilterType[] = [
  "all",
  "services",
  "workers",
];

export default function SearchFilter({
  value,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {filters.map((item) => {
          const active = value === item;

          return (
            <Pressable
              key={item}
              onPress={() => onChange(item)}
              accessibilityRole="tab"
              accessibilityState={{
                selected: active,
              }}
              accessibilityLabel={`Filter by ${item}`}
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
                {item.charAt(0).toUpperCase() +
                  item.slice(1)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  button: {
    minWidth: 76,
    height: 38,

    paddingHorizontal: 16,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  activeButton: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  text: {
    fontSize: 12.5,
    lineHeight: 17,

    color: "#64748B",
  },

  activeText: {
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});