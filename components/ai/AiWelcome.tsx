import React from "react";

import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

const QUICK_ACTIONS = [
  {
    icon: "flash",
    title: "Electrical",
  },
  {
    icon: "water",
    title: "Plumbing",
  },
  {
    icon: "car",
    title: "Auto Repair",
  },
  {
    icon: "air-conditioner",
    title: "Air Conditioner",
  },
  {
    icon: "engine",
    title: "Generator",
  },
  {
    icon: "home-city",
    title: "Building",
  },
  {
    icon: "sofa",
    title: "Furniture",
  },
];

export default function AiWelcome() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <MaterialCommunityIcons
          name="headset"
          size={34}
          color="#F97316"
        />
      </View>

      <AppText
        weight="bold"
        size="xl"
        style={styles.title}
      >
        What needs fixing today?
      </AppText>

      <AppText style={styles.description}>
        Describe any repair problem in any language.
        {"\n"}
        Fixxam Smarter will analyze the issue,
        explain possible causes and guide you
        with the best repair solution.
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.chipsContainer
        }
      >
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.title}
            activeOpacity={0.85}
            style={styles.chip}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={18}
              color={
                CustomerColors.primary
              }
            />

            <AppText
              weight="semibold"
              style={styles.chipText}
            >
              {item.title}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal:
      FixxamTokens.spacing.xl,
  },

  logo: {
    width: 82,

    height: 82,

    borderRadius: 24,

    backgroundColor: "#FFF7ED",

    borderWidth: 1,

    borderColor: "#FED7AA",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 26,

    shadowColor: "#FB923C",

    shadowOpacity: 0.12,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  title: {
    textAlign: "center",

    color:
      CustomerColors.textPrimary,

    fontSize: 32,

    lineHeight: 40,
  },

  description: {
    marginTop: 14,

    textAlign: "center",

    lineHeight: 28,

    fontSize: 16,

    color:
      CustomerColors.textSecondary,

    maxWidth: 340,
  },

  chipsContainer: {
    marginTop: 36,

    paddingHorizontal: 4,
  },

  chip: {
    flexDirection: "row",

    alignItems: "center",

    height: 46,

    paddingHorizontal: 18,

    marginRight: 12,

    borderRadius: 999,

    backgroundColor:
      CustomerColors.card,

    borderWidth: 1,

    borderColor:
      CustomerColors.border,
  },

  chipText: {
    marginLeft: 8,

    fontSize: 15,

    color:
      CustomerColors.textPrimary,
  },
});