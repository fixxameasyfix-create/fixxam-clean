import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  count?: number;
  onPress?: () => void;
};

export default function HeaderNotification({
  count = 0,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
    >
      <Ionicons
        name="notifications-outline"
        size={24}
        color="#0F172A"
      />

      {count > 0 && (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>
            {count > 9 ? "9+" : count}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    borderRadius: 20,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  badge: {
    position: "absolute",
    top: 8,
    right: 8,

    minWidth: 20,
    height: 20,

    borderRadius: 10,

    backgroundColor: "#EF4444",

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 5,

    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});