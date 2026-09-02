import React, { memo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type WorkerOrdersHeaderProps = {
  onBack: () => void;
  onManage: () => void;
};

function WorkerOrdersHeader({
  onBack,
  onManage,
}: WorkerOrdersHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color="#0F172A"
        />
      </Pressable>

      <View style={styles.titleContainer}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          My Jobs
        </AppText>

        <AppText style={styles.subtitle}>
          Track and manage your service requests
        </AppText>
      </View>

      <Pressable
        onPress={onManage}
        accessibilityRole="button"
        accessibilityLabel="Manage jobs"
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="options-outline"
          size={20}
          color="#0F172A"
        />
      </Pressable>
    </View>
  );
}

export default memo(WorkerOrdersHeader);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 10,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  titleContainer: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
  },

  title: {
    fontSize: 22,
    lineHeight: 26,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 14,
    color: "#64748B",
  },

  pressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});