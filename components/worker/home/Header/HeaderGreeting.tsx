import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Props = {
  workerName: string;
};

export default function HeaderGreeting({
  workerName,
}: Props) {
  const hour = new Date().getHours();

  const subtitle =
    hour >= 5 && hour < 12
      ? "Ready to take new jobs today?"
      : hour >= 12 && hour < 17
        ? "Hope your day is going well."
        : hour >= 17 && hour < 20
          ? "Let's finish today's bookings strong."
          : "Time to review today's work.";

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.name}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {workerName || "Worker"}
      </AppText>

      <AppText
        style={styles.subtitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 22,
    lineHeight: 27,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: "#94A3B8",
  },
});