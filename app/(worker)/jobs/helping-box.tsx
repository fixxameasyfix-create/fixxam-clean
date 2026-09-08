import React, {
  memo,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
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

type HelpItem = {
  id: string;

  title: string;

  description: string;

  icon: AppIconName;

  iconColor: string;

  iconBackground: string;
};

type HelpCardProps = {
  item: HelpItem;

  onPress: () => void;
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

    icon: "jobs",

    iconColor:
      WorkerColors.primary,

    iconBackground:
      WorkerColors.primarySoft,
  },

  {
    id: "checklist",

    title: "Job Checklist",

    description:
      "Make sure nothing important is missed.",

    icon: "check",

    iconColor:
      Colors.info,

    iconBackground:
      Colors.infoSoft,
  },

  {
    id: "tips",

    title: "Job Tips",

    description:
      "Practical tips to improve your work.",

    icon: "info",

    iconColor:
      Colors.warning,

    iconBackground:
      Colors.warningSoft,
  },

  {
    id: "safety",

    title: "Safety",

    description:
      "Stay safe while working on every job.",

    icon: "shield",

    iconColor:
      Colors.success,

    iconBackground:
      Colors.successSoft,
  },

  {
    id: "pricing",

    title: "Pricing Guide",

    description:
      "Think clearly about labour and materials.",

    icon: "payment",

    iconColor:
      Colors.info,

    iconBackground:
      Colors.infoSoft,
  },

  {
    id: "customer",

    title: "Customer Handling",

    description:
      "Communicate professionally with customers.",

    icon: "users",

    iconColor:
      WorkerColors.primary,

    iconBackground:
      WorkerColors.primarySoft,
  },
];

/* ============================================================
   SCREEN
============================================================ */

export default function HelpingBoxScreen() {
  const handleOpenItem =
    (
      item: HelpItem,
    ) => {
      router.push({
        pathname:
          "/(worker)/jobs/helping-box/[topic]",

        params: {
          topic:
            item.id,
        },
      });
    };

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
          <AppText
            variant="heading1"
            weight="bold"
            style={
              styles.title
            }
          >
            Helping Box
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Get useful guidance for every job.
          </AppText>
        </View>

        {/* ====================================================
            INTRO
        ==================================================== */}

        <View
          style={
            styles.introCard
          }
        >
          <View
            style={
              styles.introIcon
            }
          >
            <AppIcon
              name="professional"
              role="worker"
              size="lg"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.introContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.introTitle
              }
            >
              Work smarter. Work safe.
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.introText
              }
            >
              Get quick guidance before, during, and after every job.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            SECTION
        ==================================================== */}

        <AppText
          variant="heading2"
          weight="bold"
          style={
            styles.sectionTitle
          }
        >
          Job Assistant
        </AppText>

        {/* ====================================================
            HELP GRID
        ==================================================== */}

        <View
          style={
            styles.grid
          }
        >
          {HELP_ITEMS.map(
            item => (
              <HelpCard
                key={
                  item.id
                }
                item={
                  item
                }
                onPress={() => {
                  handleOpenItem(
                    item,
                  );
                }}
              />
            ),
          )}
        </View>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <View
          style={
            styles.footer
          }
        >
          <View
            style={
              styles.footerIcon
            }
          >
            <AppIcon
              name="info"
              size="xs"
              color={
                Colors.textMuted
              }
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.footerText
            }
          >
            Use these guides to prepare and complete your jobs professionally.
          </AppText>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   HELP CARD
============================================================ */

const HelpCard =
  memo(
    function HelpCard({
      item,
      onPress,
    }: HelpCardProps) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            item.title
          }
          accessibilityHint={`Open ${item.title} guide`}
          onPress={
            onPress
          }
          style={({
            pressed,
          }) => [
            styles.card,

            pressed
              ? styles.cardPressed
              : null,
          ]}
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={[
              styles.cardIcon,

              {
                backgroundColor:
                  item.iconBackground,
              },
            ]}
          >
            <AppIcon
              name={
                item.icon
              }
              size="md"
              color={
                item.iconColor
              }
            />
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <View
            style={
              styles.cardContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.cardTitle
              }
            >
              {item.title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={3}
              style={
                styles.cardDescription
              }
            >
              {item.description}
            </AppText>
          </View>

          {/* ==================================================
              ACTION
          ================================================== */}

          <View
            style={
              styles.arrow
            }
          >
            <AppIcon
              name="next"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>
        </Pressable>
      );
    },
  );

HelpCard.displayName =
  "HelpingBoxHelpCard";

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
        FixxamTokens.spacing.lg,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       INTRO
    ======================================================== */

    introCard: {
      minHeight: 96,

      marginBottom:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    introIcon: {
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

      backgroundColor:
        Colors.surface,
    },

    introContent: {
      flex: 1,

      minWidth: 0,
    },

    introTitle: {
      color:
        Colors.textPrimary,
    },

    introText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       GRID
    ======================================================== */

    grid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: "48.5%",

      minHeight: 220,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    cardPressed: {
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

    cardIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    cardContent: {
      flex: 1,
    },

    cardTitle: {
      color:
        Colors.textPrimary,
    },

    cardDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    arrow: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      alignSelf:
        "flex-end",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    footerIcon: {
      width: 20,

      paddingTop:
        FixxamTokens.spacing.xxs,

      alignItems:
        "center",
    },

    footerText: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textMuted,
    },
  });