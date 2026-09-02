import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function LoginFooter() {
  return (
    <View style={styles.container}>
      {/* OR DIVIDER */}

      <View style={styles.dividerRow}>
        <View style={styles.divider} />

        <Text style={styles.orText}>
          OR
        </Text>

        <View style={styles.divider} />
      </View>

      {/* BIOMETRIC */}

      <TouchableOpacity
        style={styles.bioButton}
        activeOpacity={0.8}
        onPress={() => {
          // Keep existing biometric logic here.
        }}
        accessibilityRole="button"
        accessibilityLabel="Continue with biometrics"
      >
        <MaterialCommunityIcons
          name="fingerprint"
          size={48}
          color="#F47A16"
        />
      </TouchableOpacity>

      <Text style={styles.bioText}>
        Continue with Biometrics
      </Text>

      {/* SIGN UP */}

      <View style={styles.signUpRow}>
        <Text style={styles.normalText}>
          Don't have an account?
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push(
              "/(auth)/role-selection",
            )
          }
          activeOpacity={0.7}
          accessibilityRole="link"
        >
          <Text style={styles.signUpText}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    alignItems: "center",

    paddingHorizontal: 16,

    marginTop: 20,

    paddingBottom: 20,
  },

  dividerRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 18,
  },

  divider: {
    flex: 1,

    height: 1,

    backgroundColor: "#E2E8F0",
  },

  orText: {
    marginHorizontal: 14,

    color: "#94A3B8",

    fontSize: 12,

    fontWeight: "800",

    letterSpacing: 1.2,
  },

  bioButton: {
    width: 70,

    height: 70,

    borderRadius: 35,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5EAF1",

    shadowColor: "#0F172A",

    shadowOpacity: 0.08,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  bioText: {
    marginTop: 10,

    color: "#64748B",

    fontSize: 14,

    fontWeight: "600",

    textAlign: "center",
  },

  signUpRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 22,
  },

  normalText: {
    color: "#64748B",

    fontSize: 14,

    fontWeight: "500",
  },

  signUpText: {
    marginLeft: 5,

    color: "#1769D1",

    fontSize: 14,

    fontWeight: "800",
  },
});