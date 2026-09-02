import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

export default function LimitedOfferScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.headerText}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Limited-Time Offers
          </AppText>

          <AppText style={styles.subtitle}>
            Grab special deals before they expire.
          </AppText>
        </View>
      </View>

      <View style={styles.emptyCard}>
        <View style={styles.iconBox}>
          <Ionicons
            name="time-outline"
            size={42}
            color="#7C3AED"
          />
        </View>

        <AppText
          weight="bold"
          style={styles.emptyTitle}
        >
          No Limited-Time Offers
        </AppText>

        <AppText
          center
          style={styles.emptyText}
        >
          There are no active limited-time offers
          available right now.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 54,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    lineHeight: 34,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 42,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  iconBox: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 21,
    lineHeight: 27,
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 8,
    maxWidth: 290,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },
});