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
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  keyof typeof MaterialCommunityIcons.glyphMap;

type QuickAction = {
  icon: MaterialIconName;
  title: string;
};

interface AiWelcomeProps {
  onQuickActionPress?: (
    action: string,
  ) => void;
}

/* ==============================================================
   QUICK ACTIONS
============================================================== */

const QUICK_ACTIONS =
  [
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
  ] as const satisfies readonly QuickAction[];

/* ==============================================================
   COMPONENT
============================================================== */

function AiWelcome({
  onQuickActionPress,
}: AiWelcomeProps) {
  const interactive =
    Boolean(
      onQuickActionPress,
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          ASSISTANT ICON
      ====================================================== */}

      <View
        style={
          styles.logo
        }
      >
        <MaterialCommunityIcons
          name="headset"
          size={
            FixxamTokens.size
              .iconXl
          }
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ======================================================
          INTRO
      ====================================================== */}

      <AppText
        variant="heading1"
        weight="bold"
        center
        style={
          styles.title
        }
      >
        What needs fixing today?
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.description
        }
      >
        Describe any repair problem
        in any language. Fixxam
        Smarter will analyze the
        issue, explain possible
        causes and guide you toward
        the best repair solution.
      </AppText>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <ScrollView
        horizontal
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        style={
          styles.chipsScroll
        }
        contentContainerStyle={
          styles.chipsContainer
        }
      >
        {QUICK_ACTIONS.map(
          (item) => (
            <Pressable
              key={
                item.title
              }
              accessibilityRole={
                interactive
                  ? "button"
                  : undefined
              }
              accessibilityLabel={
                interactive
                  ? `Ask about ${item.title}`
                  : undefined
              }
              accessibilityState={{
                disabled:
                  !interactive,
              }}
              disabled={
                !interactive
              }
              onPress={() => {
                onQuickActionPress?.(
                  item.title,
                );
              }}
              style={({
                pressed,
              }) => [
                styles.chip,

                pressed &&
                interactive
                  ? styles.chipPressed
                  : null,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  item.icon
                }
                size={
                  FixxamTokens.size
                    .iconXs
                }
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="bodyMedium"
                weight="medium"
                numberOfLines={1}
                style={
                  styles.chipText
                }
              >
                {item.title}
              </AppText>
            </Pressable>
          ),
        )}
      </ScrollView>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       LOGO
    ======================================================== */

    logo: {
      width:
        FixxamTokens.size
          .roleCardHeight,

      height:
        FixxamTokens.size
          .roleCardHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.xxl,

      borderWidth: 1,

      borderColor:
        CustomerColors.primaryLight,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       INTRO
    ======================================================== */

    title: {
      maxWidth: 340,
    },

    description: {
      maxWidth: 360,

      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       QUICK ACTIONS
    ======================================================== */

    chipsScroll: {
      width: "100%",

      flexGrow: 0,

      flexShrink: 0,

      marginTop:
        FixxamTokens.spacing.xxxl,
    },

    chipsContainer: {
      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical:
        FixxamTokens.spacing.xs,
    },

    chip: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      flexShrink: 0,

      gap:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        CustomerColors.primaryLight,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    chipText: {
      color:
        Colors.textPrimary,
    },

    chipPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

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

export default memo(
  AiWelcome,
);