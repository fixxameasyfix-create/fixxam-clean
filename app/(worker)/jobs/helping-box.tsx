import React, { useMemo } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type IoniconName =
  React.ComponentProps<typeof Ionicons>["name"];

type HelpItem = {
  id: string;
  title: string;
  description: string;
  icon: IoniconName;
  iconColor: string;
  iconBackground: string;
};

/* ============================================================
   DATA
============================================================ */

const HELP_ITEMS: HelpItem[] = [
  {
    id: "prepare",
    title: "Prepare for a Job",
    description:
      "Get everything ready before you start.",
    icon: "briefcase-outline",
    iconColor: "#F97316",
    iconBackground: "#FFF7ED",
  },
  {
    id: "checklist",
    title: "Job Checklist",
    description:
      "Make sure nothing important is missed.",
    icon: "checkbox-outline",
    iconColor: "#2563EB",
    iconBackground: "#EFF6FF",
  },
  {
    id: "tips",
    title: "Job Tips",
    description:
      "Practical tips to improve your work.",
    icon: "bulb-outline",
    iconColor: "#CA8A04",
    iconBackground: "#FEFCE8",
  },
  {
    id: "safety",
    title: "Safety",
    description:
      "Stay safe while working on every job.",
    icon: "shield-checkmark-outline",
    iconColor: "#16A34A",
    iconBackground: "#F0FDF4",
  },
  {
    id: "pricing",
    title: "Pricing Guide",
    description:
      "Think clearly about labour and materials.",
    icon: "cash-outline",
    iconColor: "#0891B2",
    iconBackground: "#ECFEFF",
  },
  {
    id: "customer",
    title: "Customer Handling",
    description:
      "Communicate professionally with customers.",
    icon: "people-outline",
    iconColor: "#7C3AED",
    iconBackground: "#F5F3FF",
  },
];

/* ============================================================
   SCREEN
============================================================ */

export default function HelpingBoxScreen() {
  const items = useMemo(
    () => HELP_ITEMS,
    [],
  );

  const handleOpenItem = (
    item: HelpItem,
  ) => {
    /*
     * These routes will be created as we continue.
     *
     * Keeping navigation here centralized makes
     * the Helping Box easy to extend.
     */
    router.push({
      pathname:
        "/(worker)/jobs/helping-box/[topic]",
      params: {
        topic: item.id,
      },
    });
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Helping Box
          </AppText>

          <AppText style={styles.subtitle}>
            Get useful guidance for every job.
          </AppText>
        </View>

        {/* ====================================================
            SEARCH / INTRO
        ==================================================== */}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="construct-outline"
              size={27}
              color="#F97316"
            />
          </View>

          <View style={styles.introContent}>
            <AppText
              weight="bold"
              style={styles.introTitle}
            >
              Work smarter. Work safe.
            </AppText>

            <AppText style={styles.introText}>
              Get quick guidance before, during,
              and after every job.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            SECTION TITLE
        ==================================================== */}

        <AppText
          weight="bold"
          style={styles.sectionTitle}
        >
          Job Assistant
        </AppText>

        {/* ====================================================
            HELP GRID
        ==================================================== */}

        <View style={styles.grid}>
          {items.map((item) => (
            <HelpCard
              key={item.id}
              item={item}
              onPress={() =>
                handleOpenItem(item)
              }
            />
          ))}
        </View>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#94A3B8"
          />

          <AppText style={styles.footerText}>
            Use these guides to prepare and
            complete your jobs professionally.
          </AppText>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   CARD
============================================================ */

type HelpCardProps = {
  item: HelpItem;
  onPress: () => void;
};

function HelpCard({
  item,
  onPress,
}: HelpCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.cardIcon,
          {
            backgroundColor:
              item.iconBackground,
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={25}
          color={item.iconColor}
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.cardContent}>
        <AppText
          weight="bold"
          style={styles.cardTitle}
        >
          {item.title}
        </AppText>

        <AppText
          style={styles.cardDescription}
          numberOfLines={3}
        >
          {item.description}
        </AppText>
      </View>

      {/* ======================================================
          ARROW
      ====================================================== */}

      <View style={styles.arrow}>
        <Ionicons
          name="chevron-forward"
          size={21}
          color="#2563EB"
        />
      </View>
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 35,
    backgroundColor: "#F8FAFC",
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    marginBottom: 18,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 16,
    lineHeight: 22,
    color: "#64748B",
  },

  /* ==========================================================
     INTRO
  ========================================================== */

  introCard: {
    minHeight: 96,
    borderRadius: 20,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  introIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: "#0F172A",
  },

  introText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  /* ==========================================================
     SECTION
  ========================================================== */

  sectionTitle: {
    fontSize: 21,
    lineHeight: 27,
    color: "#0F172A",
    marginBottom: 14,
  },

  /* ==========================================================
     GRID
  ========================================================== */

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  /* ==========================================================
     CARD
  ========================================================== */

  card: {
    width: "48.2%",
    minHeight: 235,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF3",
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  cardIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 19,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: "#0F172A",
  },

  cardDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  arrow: {
    alignSelf: "flex-end",
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  /* ==========================================================
     FOOTER
  ========================================================== */

  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 7,
    paddingHorizontal: 4,
  },

  footerText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 17,
    color: "#94A3B8",
  },
});