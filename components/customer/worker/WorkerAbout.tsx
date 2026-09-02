import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  about?: string | null;
  experience?: string | number | null;
  category?: string | null;
};

export default function WorkerAbout({
  about,
  experience,
  category,
}: Props) {
  const normalizedAbout =
    typeof about === "string"
      ? about.trim()
      : "";

  const normalizedExperience =
    experience !== undefined &&
    experience !== null &&
    String(experience).trim()
      ? String(experience).trim()
      : "Not specified";

  const normalizedCategory =
    typeof category === "string" &&
    category.trim()
      ? category.trim()
      : "Not specified";

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <Ionicons
          name="person-circle-outline"
          size={22}
          color="#2563EB"
        />

        <AppText
          weight="bold"
          style={styles.title}
        >
          About
        </AppText>
      </View>

      {/* DESCRIPTION */}

      <AppText style={styles.description}>
        {normalizedAbout ||
          "This worker has not added a professional description yet."}
      </AppText>

      {/* EXPERIENCE + CATEGORY */}

      <View style={styles.infoCard}>

        {/* EXPERIENCE */}

        <View style={styles.infoRow}>
          <View style={styles.experienceIcon}>
            <Ionicons
              name="briefcase-outline"
              size={17}
              color="#2563EB"
            />
          </View>

          <AppText style={styles.label}>
            Experience
          </AppText>

          <AppText
            weight="bold"
            style={styles.value}
            numberOfLines={1}
          >
            {normalizedExperience}
          </AppText>
        </View>

        <View style={styles.divider} />

        {/* CATEGORY */}

        <View style={styles.infoRow}>
          <View style={styles.categoryIcon}>
            <Ionicons
              name="construct-outline"
              size={17}
              color="#F97316"
            />
          </View>

          <AppText style={styles.label}>
            Category
          </AppText>

          <AppText
            weight="bold"
            style={styles.value}
            numberOfLines={1}
          >
            {normalizedCategory}
          </AppText>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  title: {
    marginLeft: 7,
    fontSize: 17,
    lineHeight: 22,
    color: "#0F172A",
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginBottom: 10,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderWidth: 1,
    borderColor: "#E8EDF3",

    shadowColor: "#0F172A",
    shadowOpacity: 0.035,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  infoRow: {
    minHeight: 38,

    flexDirection: "row",
    alignItems: "center",
  },

  experienceIcon: {
    width: 29,
    height: 29,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EFF6FF",
  },

  categoryIcon: {
    width: 29,
    height: 29,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFF7ED",
  },

  label: {
    flex: 1,

    marginLeft: 9,

    fontSize: 13,
    lineHeight: 18,

    color: "#64748B",
  },

  value: {
    maxWidth: "58%",

    fontSize: 14,
    lineHeight: 18,

    color: "#0F172A",

    textAlign: "right",
  },

  divider: {
    height: 1,

    backgroundColor: "#F1F5F9",

    marginVertical: 4,
  },
});