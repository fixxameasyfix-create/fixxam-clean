import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

interface Props {
  progress: number;
}

export default function ProfileCompletionProgress({
  progress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Profile Completion
          </AppText>

          <AppText
            style={styles.subtitle}
          >
            Complete your profile to
            receive customer requests.
          </AppText>
        </View>

        <View style={styles.badge}>
          <AppText
            weight="bold"
            color="#FF6B00"
          >
            {progress}%
          </AppText>
        </View>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 15,
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    backgroundColor: "#FF6B00",
    borderRadius: 999,
  },
});