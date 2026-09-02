import React, { useMemo } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type IoniconName =
  React.ComponentProps<typeof Ionicons>["name"];

type GuideSection = {
  title: string;
  items: string[];
};

type Guide = {
  title: string;
  subtitle: string;
  icon: IoniconName;
  iconColor: string;
  iconBackground: string;
  sections: GuideSection[];
};

/* ============================================================
   GUIDES
============================================================ */

const GUIDES: Record<string, Guide> = {
  prepare: {
    title: "Prepare for a Job",
    subtitle:
      "Get everything ready before you start.",
    icon: "briefcase-outline",
    iconColor: "#F97316",
    iconBackground: "#FFF7ED",

    sections: [
      {
        title: "Before You Leave",
        items: [
          "Confirm the customer's location.",
          "Review the service requested.",
          "Make sure you have the required tools.",
          "Carry the materials you may need.",
          "Keep your phone charged.",
        ],
      },
      {
        title: "Before Starting",
        items: [
          "Introduce yourself professionally.",
          "Confirm the customer's request.",
          "Inspect the work area.",
          "Explain what you plan to do.",
          "Agree on the job scope before starting.",
        ],
      },
    ],
  },

  checklist: {
    title: "Job Checklist",
    subtitle:
      "Make sure nothing important is missed.",

    icon: "checkbox-outline",
    iconColor: "#2563EB",
    iconBackground: "#EFF6FF",

    sections: [
      {
        title: "Job Preparation",
        items: [
          "Confirm service and location.",
          "Check tools and equipment.",
          "Confirm required materials.",
          "Understand the customer's expectations.",
        ],
      },
      {
        title: "During the Job",
        items: [
          "Keep the work area organised.",
          "Work carefully and professionally.",
          "Protect the customer's property.",
          "Communicate if the scope changes.",
        ],
      },
      {
        title: "Before Leaving",
        items: [
          "Check the completed work.",
          "Clean the work area.",
          "Confirm the customer is satisfied.",
          "Collect payment according to the agreed terms.",
        ],
      },
    ],
  },

  tips: {
    title: "Job Tips",
    subtitle:
      "Practical tips to improve your work.",

    icon: "bulb-outline",
    iconColor: "#CA8A04",
    iconBackground: "#FEFCE8",

    sections: [
      {
        title: "Work Professionally",
        items: [
          "Arrive on time.",
          "Dress appropriately for the job.",
          "Listen carefully to the customer.",
          "Keep communication clear and respectful.",
        ],
      },
      {
        title: "Build Trust",
        items: [
          "Be honest about what you can do.",
          "Explain unexpected problems early.",
          "Avoid unnecessary charges.",
          "Leave the work area clean.",
        ],
      },
    ],
  },

  safety: {
    title: "Safety",
    subtitle:
      "Stay safe while working on every job.",

    icon: "shield-checkmark-outline",
    iconColor: "#16A34A",
    iconBackground: "#F0FDF4",

    sections: [
      {
        title: "Before Work",
        items: [
          "Inspect the work environment.",
          "Identify possible hazards.",
          "Use the correct tools.",
          "Wear appropriate protective equipment.",
        ],
      },
      {
        title: "While Working",
        items: [
          "Do not use damaged tools.",
          "Keep electrical and hazardous areas controlled.",
          "Keep children and other people away from dangerous work.",
          "Stop work if the environment becomes unsafe.",
        ],
      },
      {
        title: "Important",
        items: [
          "Never take unnecessary risks to finish a job quickly.",
          "Ask for professional assistance when a task is beyond your capability.",
        ],
      },
    ],
  },

  pricing: {
    title: "Pricing Guide",
    subtitle:
      "Think clearly about labour and materials.",

    icon: "cash-outline",
    iconColor: "#0891B2",
    iconBackground: "#ECFEFF",

    sections: [
      {
        title: "Consider These Costs",
        items: [
          "Labour and time.",
          "Materials required.",
          "Transportation where applicable.",
          "Tools or specialised equipment.",
          "Complexity of the job.",
        ],
      },
      {
        title: "Before Agreeing",
        items: [
          "Understand exactly what the customer needs.",
          "Explain what is included in the price.",
          "Be clear about additional materials or work.",
          "Avoid changing the agreed price without discussion.",
        ],
      },
    ],
  },

  customer: {
    title: "Customer Handling",
    subtitle:
      "Communicate professionally with customers.",

    icon: "people-outline",
    iconColor: "#7C3AED",
    iconBackground: "#F5F3FF",

    sections: [
      {
        title: "Communication",
        items: [
          "Greet the customer respectfully.",
          "Listen before giving your opinion.",
          "Ask questions when something is unclear.",
          "Keep the customer informed about progress.",
        ],
      },
      {
        title: "Professional Behaviour",
        items: [
          "Respect the customer's home and property.",
          "Avoid arguments.",
          "Do not make promises you cannot keep.",
          "Handle complaints calmly.",
        ],
      },
      {
        title: "After the Job",
        items: [
          "Explain what was completed.",
          "Answer reasonable questions.",
          "Leave the area clean.",
          "Thank the customer for choosing you.",
        ],
      },
    ],
  },
};

/* ============================================================
   SCREEN
============================================================ */

export default function HelpingBoxTopicScreen() {
  const params =
    useLocalSearchParams<{
      topic?: string;
    }>();

  const topic =
    Array.isArray(params.topic)
      ? params.topic[0]
      : params.topic;

  const guide = useMemo(
    () =>
      topic
        ? GUIDES[topic]
        : undefined,
    [topic],
  );

  /* ============================================================
     INVALID TOPIC
  ============================================================ */

  if (!guide) {
    return (
      <AppScreen>
        <View style={styles.invalidContainer}>
          <View style={styles.invalidIcon}>
            <Ionicons
              name="help-circle-outline"
              size={38}
              color="#94A3B8"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.invalidTitle}
          >
            Guide Not Found
          </AppText>

          <AppText style={styles.invalidText}>
            This Helping Box guide is not
            available.
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backAction}
          >
            <Ionicons
              name="arrow-back"
              size={19}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={styles.backActionText}
            >
              Go Back
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#0F172A"
            />
          </Pressable>

          <View style={styles.headerContent}>
            <AppText
              weight="bold"
              style={styles.headerTitle}
              numberOfLines={2}
            >
              {guide.title}
            </AppText>

            <AppText style={styles.headerSubtitle}>
              {guide.subtitle}
            </AppText>
          </View>
        </View>

        {/* ====================================================
            GUIDE HERO
        ==================================================== */}

        <View style={styles.hero}>
          <View
            style={[
              styles.heroIcon,
              {
                backgroundColor:
                  guide.iconBackground,
              },
            ]}
          >
            <Ionicons
              name={guide.icon}
              size={30}
              color={guide.iconColor}
            />
          </View>

          <View style={styles.heroContent}>
            <AppText
              weight="bold"
              style={styles.heroTitle}
            >
              Work professionally
            </AppText>

            <AppText style={styles.heroText}>
              Follow these simple steps to help
              deliver a better job experience.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            GUIDE SECTIONS
        ==================================================== */}

        {guide.sections.map(
          (section, sectionIndex) => (
            <View
              key={section.title}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <AppText
                    weight="bold"
                    style={styles.sectionNumberText}
                  >
                    {sectionIndex + 1}
                  </AppText>
                </View>

                <AppText
                  weight="bold"
                  style={styles.sectionTitle}
                >
                  {section.title}
                </AppText>
              </View>

              <View style={styles.itemsCard}>
                {section.items.map(
                  (item, itemIndex) => (
                    <View
                      key={`${section.title}-${itemIndex}`}
                      style={[
                        styles.item,
                        itemIndex <
                          section.items.length - 1 &&
                          styles.itemBorder,
                      ]}
                    >
                      <View style={styles.checkIcon}>
                        <Ionicons
                          name="checkmark"
                          size={15}
                          color="#16A34A"
                        />
                      </View>

                      <AppText
                        style={styles.itemText}
                      >
                        {item}
                      </AppText>
                    </View>
                  ),
                )}
              </View>
            </View>
          ),
        )}

        {/* ====================================================
            BOTTOM NOTE
        ==================================================== */}

        <View style={styles.note}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#2563EB"
          />

          <AppText style={styles.noteText}>
            Good communication, safe working
            practices and quality work help build
            customer trust.
          </AppText>
        </View>
      </ScrollView>
    </AppScreen>
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,

    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  pressed: {
    opacity: 0.7,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 23,
    lineHeight: 29,
    color: "#0F172A",
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },

  /* ==========================================================
     HERO
  ========================================================== */

  hero: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF3",
    marginBottom: 27,

    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: "#0F172A",
  },

  heroText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  /* ==========================================================
     SECTION
  ========================================================== */

  section: {
    marginBottom: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionNumber: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  sectionNumberText: {
    fontSize: 13,
    color: "#2563EB",
  },

  sectionTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    color: "#0F172A",
  },

  /* ==========================================================
     ITEMS
  ========================================================== */

  itemsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E8EDF3",
    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 14,
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  checkIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  itemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  /* ==========================================================
     NOTE
  ========================================================== */

  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    marginTop: 2,
  },

  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 17,
    color: "#475569",
  },

  /* ==========================================================
     INVALID
  ========================================================== */

  invalidContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F8FAFC",
  },

  invalidIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  invalidTitle: {
    fontSize: 20,
    color: "#0F172A",
  },

  invalidText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  backAction: {
    marginTop: 22,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  backActionText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
});