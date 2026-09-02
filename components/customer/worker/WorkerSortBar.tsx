import React from "react";

import {
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import AppText from "@/components/ui/AppText";

type Props = {
  label: string;
  onPress: () => void;
};

export default function WorkerSortBar({
  label,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Ionicons
          name="swap-vertical-outline"
          size={18}
          color="#2563EB"
        />

        <AppText
          weight="medium"
          style={styles.label}
        >
          {label}
        </AppText>
      </View>

      <Ionicons
        name="chevron-down"
        size={18}
        color="#64748B"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    marginLeft: 10,

    fontSize: 15,

    color: "#0F172A",
  },
});