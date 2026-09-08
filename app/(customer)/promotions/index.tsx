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

type PromotionId =
  | "special-offers"
  | "service-promotions"
  | "limited-promotions";

type Promotion = {
  id: PromotionId;

  title: string;

  description: string;

  icon: AppIconName;
};

/* ============================================================
   PROMOTIONS
============================================================ */

const PROMOTIONS: Promotion[] = [
  {
    id: "special-offers",

    title: "Special Offers",

    description:
      "Discover special offers from workers and service providers.",

    icon: "star",
  },

  {
    id: "service-promotions",

    title: "Service Promotions",

    description:
      "Find special offers that can help you save on services.",

    icon: "service",
  },

  {
    id: "limited-promotions",

    title: "Limited-Time Offers",

    description:
      "Take advantage of special offers before they end.",

    icon: "clock",
  },
];

/* ============================================================
   SCREEN
============================================================ */

export default function PromotionsScreen() {
  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handlePromotionPress =
    useCallback(
      (
        promotionId:
          PromotionId,
      ) => {
        if (
          promotionId ===
          "special-offers"
        ) {
          router.push(
            "/(customer)/promotions/special-offer",
          );

          return;
        }

        if (
          promotionId ===
          "service-promotions"
        ) {
          router.push(
            "/(customer)/promotions/service-promotions",
          );

          return;
        }

        /*
         * Keep existing behavior.
         *
         * No route existed for
         * limited-promotions in the
         * original screen.
         */
      },
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
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
            hitSlop={10}
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
              styles.headerText
            }
          >
            <AppText
              variant="heading1"
              weight="bold"
              style={
                styles.title
              }
            >
              Promotions
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Discover special offers and promotions available on Fixxam.
            </AppText>
          </View>
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
              name="star"
              role="customer"
              size="lg"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.introTitle
            }
          >
            Discover Great Offers
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.introDescription
            }
          >
            Explore promotions that can help you get better value when booking services on Fixxam.
          </AppText>
        </View>

        {/* ====================================================
            PROMOTIONS
        ==================================================== */}

        <View
          style={
            styles.list
          }
        >
          {PROMOTIONS.map(
            (
              promotion,
            ) => (
              <Pressable
                key={
                  promotion.id
                }
                accessibilityRole="button"
                accessibilityLabel={`View ${promotion.title}`}
                onPress={() => {
                  handlePromotionPress(
                    promotion.id,
                  );
                }}
                style={({
                  pressed,
                }) => [
                  styles.promotionCard,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <View
                  style={
                    styles.iconBox
                  }
                >
                  <AppIcon
                    name={
                      promotion.icon
                    }
                    role="customer"
                    size="lg"
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>

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
                    {promotion.title}
                  </AppText>

                  <AppText
                    variant="body"
                    tone="secondary"
                    style={
                      styles.cardDescription
                    }
                  >
                    {promotion.description}
                  </AppText>

                  <View
                    style={
                      styles.actionRow
                    }
                  >
                    <AppText
                      variant="caption"
                      weight="bold"
                      style={
                        styles.actionText
                      }
                    >
                      VIEW OFFER
                    </AppText>

                    <AppIcon
                      name="next"
                      role="customer"
                      size="xs"
                      color={
                        CustomerColors.primary
                      }
                    />
                  </View>
                </View>
              </Pressable>
            ),
          )}
        </View>

        {/* ====================================================
            INFO
        ==================================================== */}

        <View
          style={
            styles.infoBox
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="info"
              size="sm"
              color={
                Colors.info
              }
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.infoText
            }
          >
            New promotions will appear here as they become available.
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
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxl,
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
        "flex-start",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

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
       INTRO
    ======================================================== */

    introCard: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    introIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    introTitle: {
      color:
        Colors.textPrimary,
    },

    introDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

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

    promotionCard: {
      padding:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    iconBox: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    cardContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    cardTitle: {
      color:
        Colors.textPrimary,
    },

    cardDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    actionRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    actionText: {
      letterSpacing: 0.3,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.infoSoft,
    },

    infoIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    infoText: {
      flex: 1,

      lineHeight: 18,

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