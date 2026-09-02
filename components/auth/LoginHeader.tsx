import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LoginHeader() {
  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        accessibilityRole="header"
      >
        Welcome back
      </Text>

      <Text style={styles.subtitle}>
        Sign in to continue with your account
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    paddingHorizontal: 24,

    paddingTop: 42,

    paddingBottom: 26,
  },

  title: {
    color: "#0B1F3A",

    fontSize: 34,

    lineHeight: 42,

    fontWeight: "800",

    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 8,

    color: "#64748B",

    fontSize: 16,

    lineHeight: 23,

    fontWeight: "400",

    maxWidth: 320,
  },
});