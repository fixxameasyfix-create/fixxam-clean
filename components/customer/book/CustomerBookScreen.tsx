import React from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import BookGrid from "./BookGrid";

export default function CustomerBookScreen() {
  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <AppText
          weight="bold"
          style={styles.title}
        >
          Book
        </AppText>

        <AppText style={styles.subtitle}>
          What would you like to do today?
        </AppText>

        <BookGrid />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 30,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 20,
  },
});