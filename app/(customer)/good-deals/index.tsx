import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type DealSection = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

const DEAL_SECTIONS: DealSection[] = [
  {
    id: "discounted-products",
    title: "Discounted Products",
    description:
      "Shop products and spare parts at discounted prices.",
    icon: "cart-outline",
    iconColor: "#DB2777",
    iconBackground: "#FDF2F8",
  },
  {
    id: "discounted-services",
    title: "Discounted Services",
    description:
      "Book quality services with special discounts.",
    icon: "construct-outline",
    iconColor: "#2563EB",
    iconBackground: "#EFF6FF",
  },
  {
    id: "promotions",
    title: "Promotions",
    description:
      "Discover current promotions and special offers.",
    icon: "megaphone-outline",
    iconColor: "#EA580C",
    iconBackground: "#FFF7ED",
  },
  {
    id: "limited-offers",
    title: "Limited Offers",
    description:
      "Grab special deals before they expire.",
    icon: "time-outline",
    iconColor: "#7C3AED",
    iconBackground: "#F5F3FF",
  },
  {
    id: "recommended-deals",
    title: "Recommended Services",
    description:
      "Discover services selected for you today.",
    icon: "star-outline",
    iconColor: "#CA8A04",
    iconBackground: "#FEFCE8",
  },
];

export default function GoodDealsScreen() {
  const handleSectionPress = (
    section: DealSection,
  ) => {
    /*
     * -----------------------------------------
     * DISCOUNTED PRODUCTS
     * -----------------------------------------
     */

    if (
      section.id ===
      "discounted-products"
    ) {
      router.push(
        "/(customer)/discounted-products",
      );

      return;
    }

    /*
     * -----------------------------------------
     * PROMOTIONS
     * -----------------------------------------
     */

    if (
      section.id === "promotions"
    ) {
      router.push(
        "/promotions",
      );

      return;
    }

    /*
     * -----------------------------------------
     * LIMITED-TIME OFFERS
     * -----------------------------------------
     *
     * IMPORTANT:
     * This must go directly to:
     *
     * app/
     * └── (customer)/
     *     └── good-deals/
     *         └── limited-offer.tsx
     *
     * We do NOT send it through [section].tsx.
     */

    if (
      section.id ===
      "limited-offers"
    ) {
      router.push(
        "/(customer)/good-deals/limited-offer",
      );

      return;
    }

    if (
  section.id ===
  "recommended-deals"
) {
  router.push(
    "/(customer)/good-deals/recommended-deals",
  );

  return;
}

    /*
     * -----------------------------------------
     * REMAINING DEAL SECTIONS
     * -----------------------------------------
     *
     * Keep the existing dynamic route.
     */

    router.push({
      pathname:
        "/(customer)/good-deals/[section]",
      params: {
        section: section.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={styles.title}
            >
              Today's Good Deals
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Discover today's best offers
              and discounts.
            </Text>
          </View>
        </View>

        {/* -------------------------------- */}
        {/* DEAL SECTIONS */}
        {/* -------------------------------- */}

        <View style={styles.list}>
          {DEAL_SECTIONS.map(
            (section) => (
              <Pressable
                key={section.id}
                onPress={() =>
                  handleSectionPress(
                    section,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.card,
                  pressed &&
                    styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  `Open ${section.title}`
                }
                accessibilityHint={
                  `View ${section.title.toLowerCase()}`
                }
              >
                {/* Icon */}

                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        section.iconBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      section.icon
                    }
                    size={30}
                    color={
                      section.iconColor
                    }
                  />
                </View>

                {/* Content */}

                <View
                  style={
                    styles.cardContent
                  }
                >
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {section.title}
                  </Text>

                  <Text
                    style={
                      styles.description
                    }
                    numberOfLines={2}
                  >
                    {
                      section.description
                    }
                  </Text>
                </View>

                {/* Arrow */}

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#94A3B8"
                />
              </Pressable>
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 21,
    color: "#64748B",
  },

  list: {
    gap: 14,
  },

  card: {
    minHeight: 108,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  cardContent: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    color: "#0F172A",
  },

  description: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 19,
    color: "#64748B",
  },
});