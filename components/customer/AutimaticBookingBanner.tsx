import React, { memo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  onPress: () => void;
};

function AutomaticBookingBanner({
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Book Automatically"
      accessibilityHint="Let Fixxam find the right worker nearby"
    >
      <View style={styles.iconBox}>
        <Ionicons
          name="sparkles-outline"
          size={28}
          color="#F97316"
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          numberOfLines={1}
          style={styles.title}
        >
          Book Automatically
        </AppText>

        <AppText
          numberOfLines={2}
          style={styles.description}
        >
          Let Fixxam find the right worker nearby.
        </AppText>
      </View>

      <View style={styles.arrow}>
        <Ionicons
          name="chevron-forward"
          size={22}
          color="#2563EB"
        />
      </View>
    </Pressable>
  );
}

export default memo(
  AutomaticBookingBanner,
);

const styles = StyleSheet.create({
  card: {
    width: "100%",

    minHeight: 104,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    paddingHorizontal: 16,
    paddingVertical: 14,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  pressed: {
    opacity: 0.9,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  iconBox: {
    width: 58,
    height: 58,

    borderRadius: 18,

    backgroundColor: "#FFF7ED",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 14,

    flexShrink: 0,
  },

  content: {
    flex: 1,

    minWidth: 0,

    paddingRight: 8,
  },

  title: {
    color: "#0B1F3A",

    fontSize: 19,
    lineHeight: 23,

    fontWeight: "800",
  },

  description: {
    marginTop: 4,

    color: "#64748B",

    fontSize: 13,
    lineHeight: 18,

    fontWeight: "500",
  },

  arrow: {
    width: 32,
    height: 32,

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },
});