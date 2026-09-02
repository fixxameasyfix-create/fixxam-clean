import React from "react";

import {
  Modal,
  View,
  Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type SortType =
  | "latest"
  | "rating"
  | "nearest"
  | "priceLow"
  | "priceHigh";

type Props = {
  visible: boolean;
  value: SortType;
  onClose: () => void;
  onChange: (value: SortType) => void;
};

const options = [
  {
    label: "Latest",
    value: "latest",
    icon: "time-outline",
  },
  {
    label: "Highest Rated",
    value: "rating",
    icon: "star-outline",
  },
  {
    label: "Nearest",
    value: "nearest",
    icon: "navigate-outline",
  },
  {
    label: "Lowest Price",
    value: "priceLow",
    icon: "trending-down-outline",
  },
  {
    label: "Highest Price",
    value: "priceHigh",
    icon: "trending-up-outline",
  },
] as const;

export default function WorkerSortPopup({
  visible,
  value,
  onClose,
  onChange,
}: Props) {
  const handleChange = (sortValue: SortType) => {
    onChange(sortValue);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.popup}
          onPress={(event) =>
            event.stopPropagation()
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="swap-vertical-outline"
                size={16}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.title}
            >
              Sort Workers
            </AppText>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close sort options"
            >
              <Ionicons
                name="close"
                size={16}
                color="#64748B"
              />
            </Pressable>
          </View>

          {/* OPTIONS */}

          <View style={styles.options}>
            {options.map((item) => {
              const selected =
                value === item.value;

              return (
                <Pressable
                  key={item.value}
                  onPress={() =>
                    handleChange(item.value)
                  }
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected,
                  }}
                  accessibilityLabel={`Sort by ${item.label}`}
                  style={({ pressed }) => [
                    styles.item,
                    selected &&
                      styles.selectedItem,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <View style={styles.left}>
                    <View
                      style={[
                        styles.iconBox,
                        selected &&
                          styles.selectedIconBox,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={15}
                        color={
                          selected
                            ? "#2563EB"
                            : "#64748B"
                        }
                      />
                    </View>

                    <AppText
                      weight={
                        selected
                          ? "bold"
                          : undefined
                      }
                      style={[
                        styles.label,
                        selected &&
                          styles.selectedLabel,
                      ]}
                    >
                      {item.label}
                    </AppText>
                  </View>

                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#2563EB"
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={17}
                      color="#CBD5E1"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.14)",
    justifyContent: "flex-start",
    paddingTop: 145,
    paddingHorizontal: 12,
  },

  popup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 8,

    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  header: {
    minHeight: 34,
    paddingHorizontal: 5,

    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    marginLeft: 7,

    fontSize: 14,
    lineHeight: 18,

    color: "#0F172A",
  },

  closeButton: {
    width: 29,
    height: 29,
    borderRadius: 9,

    backgroundColor: "#F8FAFC",

    alignItems: "center",
    justifyContent: "center",
  },

  options: {
    marginTop: 5,
  },

  item: {
    minHeight: 42,

    marginVertical: 2,
    paddingHorizontal: 6,

    borderRadius: 10,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedItem: {
    backgroundColor: "#F8FAFF",
  },

  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 28,
    height: 28,

    borderRadius: 8,

    backgroundColor: "#F8FAFC",

    alignItems: "center",
    justifyContent: "center",
  },

  selectedIconBox: {
    backgroundColor: "#EFF6FF",
  },

  label: {
    marginLeft: 8,

    fontSize: 11.5,
    lineHeight: 15,

    color: "#475569",
  },

  selectedLabel: {
    color: "#2563EB",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.985 }],
  },
});