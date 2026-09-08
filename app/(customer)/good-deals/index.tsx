import React, {
  useCallback,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type DealSectionId =
  | "discounted-products"
  | "discounted-services"
  | "promotions"
  | "limited-offers"
  | "recommended-deals";

type DealSection = {
  id: DealSectionId;

  title: string;

  description: string;

  icon: AppIconName;
};

/* ============================================================
   DEAL SECTIONS
============================================================ */

const DEAL_SECTIONS: DealSection[] = [
  {
    id: "discounted-products",

    title: "Discounted Products",

    description:
      "Shop products and spare parts at discounted prices.",

    icon: "cart",
  },

  {
    id: "discounted-services",

    title: "Discounted Services",

    description:
      "Book quality services with special discounts.",

    icon: "service",
  },

  {
    id: "promotions",

    title: "Promotions",

    description:
      "Discover current promotions and special offers.",

    icon: "info",
  },

  {
    id: "limited-offers",

    title: "Limited Offers",

    description:
      "Grab special deals before they expire.",

    icon: "clock",
  },

  {
    id: "recommended-deals",

    title: "Recommended Services",

    description:
      "Discover services selected for you today.",

    icon: "star",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

export default function GoodDealsScreen() {
  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  const handleSectionPress =
    useCallback(
      (
        section: DealSection,
      ) => {
        /* ====================================================
           DISCOUNTED PRODUCTS
        ==================================================== */

        if (
          section.id ===
          "discounted-products"
        ) {
          router.push(
            "/(customer)/discounted-products",
          );

          return;
        }

        /* ====================================================
           PROMOTIONS
        ==================================================== */

        if (
          section.id ===
          "promotions"
        ) {
          router.push(
            "/promotions",
          );

          return;
        }

        /* ====================================================
           LIMITED OFFERS
        ==================================================== */

        if (
          section.id ===
          "limited-offers"
        ) {
          router.push(
            "/(customer)/good-deals/limited-offer",
          );

          return;
        }

        /* ====================================================
           RECOMMENDED DEALS
        ==================================================== */

        if (
          section.id ===
          "recommended-deals"
        ) {
          router.push(
            "/(customer)/good-deals/recommended-deals",
          );

          return;
        }

        /* ====================================================
           REMAINING DYNAMIC SECTIONS
        ==================================================== */

        router.push({
          pathname:
            "/(customer)/good-deals/[section]",

          params: {
            section:
              section.id,
          },
        });
      },
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      style={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >
          <Pressable
            onPress={
              handleBack
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
              style={
                styles.title
              }
            >
              Today's Good Deals
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Discover today's best offers and discounts.
            </AppText>
          </View>
        </View>

        {/* ==================================================
            DEAL SECTIONS
        ================================================== */}

        <View
          style={styles.list}
        >
          {DEAL_SECTIONS.map(
            (section) => (
              <Pressable
                key={section.id}
                onPress={() =>
                  handleSectionPress(
                    section,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Open ${section.title}`}
                accessibilityHint={`View ${section.title.toLowerCase()}`}
                style={({
                  pressed,
                }) => [
                  styles.card,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                {/* ICON */}

                <View
                  style={
                    styles.iconBox
                  }
                >
                  <AppIcon
                    name={
                      section.icon
                    }
                    role="customer"
                    size="lg"
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>

                {/* CONTENT */}

                <View
                  style={
                    styles.cardContent
                  }
                >
                  <AppText
                    variant="bodyLarge"
                    weight="bold"
                    numberOfLines={1}
                    style={
                      styles.cardTitle
                    }
                  >
                    {section.title}
                  </AppText>

                  <AppText
                    variant="body"
                    tone="secondary"
                    numberOfLines={2}
                    style={
                      styles.description
                    }
                  >
                    {section.description}
                  </AppText>
                </View>

                {/* ARROW */}

                <AppIcon
                  name="next"
                  role="customer"
                  size="sm"
                  state="muted"
                  color={
                    Colors.textMuted
                  }
                />
              </Pressable>
            ),
          )}
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
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
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

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      gap:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      minHeight: 104,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width: 60,

      height: 60,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    cardContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    cardTitle: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

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