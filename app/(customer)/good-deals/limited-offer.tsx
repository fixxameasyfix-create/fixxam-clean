import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

export default function LimitedOfferScreen() {
  return (
    <AppScreen
      role="customer"
      style={styles.screen}
    >
      <View
        style={styles.container}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={() =>
              router.back()
            }
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
              role="customer"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              style={styles.title}
            >
              Limited-Time Offers
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Grab special deals before they expire.
            </AppText>
          </View>
        </View>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        <AppCard
          role="customer"
          style={
            styles.emptyCard
          }
        >
          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name="clock"
              role="customer"
              size="xl"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            No Limited-Time Offers
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            There are no active limited-time offers available right now.
          </AppText>
        </AppCard>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      backgroundColor:
        Colors.background,
    },

    container: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

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

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
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
       EMPTY CARD
    ======================================================== */

    emptyCard: {
      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxxl,

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    iconBox: {
      width: 82,

      height: 82,

      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
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