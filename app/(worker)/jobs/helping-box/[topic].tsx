import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type GuideSection = {
  title: string;

  items: string[];
};

type Guide = {
  title: string;

  subtitle: string;

  icon: AppIconName;

  iconColor: string;

  iconBackground: string;

  sections: GuideSection[];
};

/* ============================================================
   GUIDES
============================================================ */

const GUIDES: Record<
  string,
  Guide
> = {
  prepare: {
    title:
      "Prepare for a Job",

    subtitle:
      "Get everything ready before you start.",

    icon:
      "jobs",

    iconColor:
      WorkerColors.primary,

    iconBackground:
      WorkerColors.primarySoft,

    sections: [
      {
        title:
          "Before You Leave",

        items: [
          "Confirm the customer's location.",
          "Review the service requested.",
          "Make sure you have the required tools.",
          "Carry the materials you may need.",
          "Keep your phone charged.",
        ],
      },

      {
        title:
          "Before Starting",

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
    title:
      "Job Checklist",

    subtitle:
      "Make sure nothing important is missed.",

    icon:
      "check",

    iconColor:
      Colors.info,

    iconBackground:
      Colors.infoSoft,

    sections: [
      {
        title:
          "Job Preparation",

        items: [
          "Confirm service and location.",
          "Check tools and equipment.",
          "Confirm required materials.",
          "Understand the customer's expectations.",
        ],
      },

      {
        title:
          "During the Job",

        items: [
          "Keep the work area organised.",
          "Work carefully and professionally.",
          "Protect the customer's property.",
          "Communicate if the scope changes.",
        ],
      },

      {
        title:
          "Before Leaving",

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
    title:
      "Job Tips",

    subtitle:
      "Practical tips to improve your work.",

    icon:
      "info",

    iconColor:
      Colors.warning,

    iconBackground:
      Colors.warningSoft,

    sections: [
      {
        title:
          "Work Professionally",

        items: [
          "Arrive on time.",
          "Dress appropriately for the job.",
          "Listen carefully to the customer.",
          "Keep communication clear and respectful.",
        ],
      },

      {
        title:
          "Build Trust",

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
    title:
      "Safety",

    subtitle:
      "Stay safe while working on every job.",

    icon:
      "shield",

    iconColor:
      Colors.success,

    iconBackground:
      Colors.successSoft,

    sections: [
      {
        title:
          "Before Work",

        items: [
          "Inspect the work environment.",
          "Identify possible hazards.",
          "Use the correct tools.",
          "Wear appropriate protective equipment.",
        ],
      },

      {
        title:
          "While Working",

        items: [
          "Do not use damaged tools.",
          "Keep electrical and hazardous areas controlled.",
          "Keep children and other people away from dangerous work.",
          "Stop work if the environment becomes unsafe.",
        ],
      },

      {
        title:
          "Important",

        items: [
          "Never take unnecessary risks to finish a job quickly.",
          "Ask for professional assistance when a task is beyond your capability.",
        ],
      },
    ],
  },

  pricing: {
    title:
      "Pricing Guide",

    subtitle:
      "Think clearly about labour and materials.",

    icon:
      "payment",

    iconColor:
      WorkerColors.primary,

    iconBackground:
      WorkerColors.primarySoft,

    sections: [
      {
        title:
          "Consider These Costs",

        items: [
          "Labour and time.",
          "Materials required.",
          "Transportation where applicable.",
          "Tools or specialised equipment.",
          "Complexity of the job.",
        ],
      },

      {
        title:
          "Before Agreeing",

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
    title:
      "Customer Handling",

    subtitle:
      "Communicate professionally with customers.",

    icon:
      "users",

    iconColor:
      WorkerColors.primary,

    iconBackground:
      WorkerColors.primarySoft,

    sections: [
      {
        title:
          "Communication",

        items: [
          "Greet the customer respectfully.",
          "Listen before giving your opinion.",
          "Ask questions when something is unclear.",
          "Keep the customer informed about progress.",
        ],
      },

      {
        title:
          "Professional Behaviour",

        items: [
          "Respect the customer's home and property.",
          "Avoid arguments.",
          "Do not make promises you cannot keep.",
          "Handle complaints calmly.",
        ],
      },

      {
        title:
          "After the Job",

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
      topic?:
        | string
        | string[];
    }>();

  const rawTopic =
    Array.isArray(
      params.topic,
    )
      ? params.topic[0]
      : params.topic;

  const topic =
    typeof rawTopic ===
    "string"
      ? rawTopic.trim()
      : "";

  const guide =
    topic
      ? GUIDES[topic]
      : undefined;

  /* ==========================================================
     INVALID TOPIC
  ========================================================== */

  if (!guide) {
    return (
      <AppScreen
        role="worker"
      >
        <View
          style={
            styles.invalidContainer
          }
        >
          <View
            style={
              styles.invalidIcon
            }
          >
            <AppIcon
              name="help"
              size="xl"
              color={
                Colors.textMuted
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.invalidTitle
            }
          >
            Guide Not Found
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.invalidText
            }
          >
            This Helping Box guide is not available.
          </AppText>

          <View
            style={
              styles.invalidAction
            }
          >
            <AppButton
              title="Go Back"
              role="worker"
              variant="primary"
              leftIconName="back"
              onPress={() => {
                router.back();
              }}
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <AppScreen
      role="worker"
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={6}
            onPress={() => {
              router.back();
            }}
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              numberOfLines={2}
              style={
                styles.headerTitle
              }
            >
              {guide.title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.headerSubtitle
              }
            >
              {guide.subtitle}
            </AppText>
          </View>
        </View>

        {/* ====================================================
            GUIDE HERO
        ==================================================== */}

        <View
          style={
            styles.hero
          }
        >
          <View
            style={[
              styles.heroIcon,

              {
                backgroundColor:
                  guide.iconBackground,
              },
            ]}
          >
            <AppIcon
              name={
                guide.icon
              }
              size="lg"
              color={
                guide.iconColor
              }
            />
          </View>

          <View
            style={
              styles.heroContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.heroTitle
              }
            >
              Work professionally
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.heroText
              }
            >
              Follow these simple steps to help deliver a better job experience.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            GUIDE SECTIONS
        ==================================================== */}

        {guide.sections.map(
          (
            section,
            sectionIndex,
          ) => (
            <View
              key={
                section.title
              }
              style={
                styles.section
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <View
                  style={
                    styles.sectionNumber
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    center
                    style={
                      styles.sectionNumberText
                    }
                  >
                    {sectionIndex +
                      1}
                  </AppText>
                </View>

                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  style={
                    styles.sectionTitle
                  }
                >
                  {section.title}
                </AppText>
              </View>

              {/* ==============================================
                  ITEMS
              =============================================== */}

              <View
                style={
                  styles.itemsCard
                }
              >
                {section.items.map(
                  (
                    item,
                    itemIndex,
                  ) => (
                    <View
                      key={`${section.title}-${itemIndex}`}
                      style={[
                        styles.item,

                        itemIndex <
                        section.items
                          .length -
                          1
                          ? styles.itemBorder
                          : null,
                      ]}
                    >
                      <View
                        style={
                          styles.checkIcon
                        }
                      >
                        <AppIcon
                          name="check"
                          size="xs"
                          color={
                            Colors.success
                          }
                        />
                      </View>

                      <AppText
                        variant="body"
                        tone="secondary"
                        style={
                          styles.itemText
                        }
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

        <View
          style={
            styles.note
          }
        >
          <View
            style={
              styles.noteIcon
            }
          >
            <AppIcon
              name="info"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.noteText
            }
          >
            Good communication, safe working practices and quality work help build customer trust.
          </AppText>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.xl,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       HERO
    ======================================================== */

    hero: {
      marginBottom:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    heroIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginRight:
        FixxamTokens.spacing.md,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    heroContent: {
      flex: 1,

      minWidth: 0,
    },

    heroTitle: {
      color:
        Colors.textPrimary,
    },

    heroText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    section: {
      marginBottom:
        FixxamTokens.spacing.xl,
    },

    sectionHeader: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionNumber: {
      width: 32,

      height: 32,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    sectionNumberText: {
      color:
        WorkerColors.primary,
    },

    sectionTitle: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       ITEMS
    ======================================================== */

    itemsCard: {
      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    item: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    itemBorder: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    checkIcon: {
      width: 26,

      height: 26,

      marginRight:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    itemText: {
      flex: 1,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       NOTE
    ======================================================== */

    note: {
      marginTop:
        FixxamTokens.spacing.xs,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    noteIcon: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    noteText: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       INVALID
    ======================================================== */

    invalidContainer: {
      flex: 1,

      minHeight: 420,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    invalidIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    invalidTitle: {
      color:
        Colors.textPrimary,
    },

    invalidText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    invalidAction: {
      width: "100%",

      maxWidth: 220,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });