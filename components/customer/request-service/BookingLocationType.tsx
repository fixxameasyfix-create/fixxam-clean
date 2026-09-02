import React, { memo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

export type LocationType =
  | "current"
  | "manual";

type Props = {
  value: LocationType;
  onChange: (value: LocationType) => void;
};

function BookingLocationType({
  value,
  onChange,
}: Props) {
  const renderOption = (
    type: LocationType,
    icon: "navigate-outline" | "create-outline",
    title: string,
    subtitle: string,
  ) => {
    const selected = value === type;

    return (
      <Pressable
        onPress={() => onChange(type)}
        accessibilityRole="radio"
        accessibilityState={{
          selected,
        }}
        accessibilityLabel={`${title} location`}
        style={({ pressed }) => [
          styles.option,
          selected && styles.activeOption,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.iconBox,
            selected && styles.activeIconBox,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={
              selected
                ? "#2563EB"
                : "#64748B"
            }
          />
        </View>

        <View style={styles.content}>
          <AppText
            weight="bold"
            style={[
              styles.title,
              selected && styles.activeTitle,
            ]}
          >
            {title}
          </AppText>

          <AppText
            numberOfLines={1}
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
        </View>

        <View
          style={[
            styles.radio,
            selected && styles.activeRadio,
          ]}
        >
          {selected && (
            <View style={styles.radioDot} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="radiogroup"
      accessibilityLabel="Service location type"
    >
      {renderOption(
        "current",
        "navigate-outline",
        "Current",
        "Use my current location",
      )}

      {renderOption(
        "manual",
        "create-outline",
        "Manual",
        "Enter service location",
      )}
    </View>
  );
}

export default memo(
  BookingLocationType,
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    gap: 10,

    marginTop: 14,
  },

  option: {
    flex: 1,

    minHeight: 82,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 11,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    borderRadius: 18,

    shadowColor: "#0F172A",
    shadowOpacity: 0.035,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  activeOption: {
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },

  pressed: {
    opacity: 0.85,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  iconBox: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: "#F8FAFC",

    alignItems: "center",
    justifyContent: "center",
  },

  activeIconBox: {
    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  content: {
    flex: 1,

    minWidth: 0,

    marginLeft: 9,
    marginRight: 4,
  },

  title: {
    fontSize: 13.5,
    lineHeight: 19,

    color: "#0F172A",
  },

  activeTitle: {
    color: "#1D4ED8",
  },

  subtitle: {
    marginTop: 3,

    fontSize: 10.5,
    lineHeight: 15,

    color: "#64748B",
  },

  radio: {
    width: 20,
    height: 20,

    borderRadius: 10,

    borderWidth: 1.7,
    borderColor: "#CBD5E1",

    alignItems: "center",
    justifyContent: "center",
  },

  activeRadio: {
    borderColor: "#2563EB",
  },

  radioDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: "#2563EB",
  },
});