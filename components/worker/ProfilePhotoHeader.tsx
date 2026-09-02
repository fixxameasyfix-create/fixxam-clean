import React from "react";
import { View, StyleSheet } from "react-native";

import { AppText } from "@/components/ui";

export default function ProfilePhotoHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <AppText
          weight="semibold"
          color="#FF6B00"
        >
          Step 3 of 3
        </AppText>
      </View>

      <AppText
        size="xl"
        weight="bold"
        center
        style={styles.title}
      >
        Complete Your Profile
      </AppText>

      <AppText
        center
        style={styles.subtitle}
      >
        Add a professional profile photo
        to build customer trust.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
  },

  badge: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  title: {
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    maxWidth: 260,
  },
});