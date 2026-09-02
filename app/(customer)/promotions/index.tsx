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

type Promotion = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

const PROMOTIONS: Promotion[] = [
  {
    id: "special-offers",
    title: "Special Offers",
    description:
      "Discover special offers from workers and service providers.",
    icon: "pricetag-outline",
    iconColor: "#2563EB",
    iconBackground: "#EFF6FF",
  },
  {
    id: "service-promotions",
    title: "Service Promotions",
    description:
      "Find special offers that can help you save on services.",
    icon: "construct-outline",
    iconColor: "#7C3AED",
    iconBackground: "#F5F3FF",
  },
  {
    id: "limited-promotions",
    title: "Limited-Time Offers",
    description:
      "Take advantage of special offers before they end.",
    icon: "time-outline",
    iconColor: "#7C3AFF",
    iconBackground: "#F5F3FF",
  },
];

export default function PromotionsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#0F172A"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Promotions
            </Text>

            <Text style={styles.subtitle}>
              Discover special offers and promotions
              available on Fixxam.
            </Text>
          </View>
        </View>

        {/* Intro */}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="megaphone-outline"
              size={34}
              color="#EA580C"
            />
          </View>

          <Text style={styles.introTitle}>
            Discover Great Offers
          </Text>

          <Text style={styles.introDescription}>
            Explore promotions that can help you
            get better value when booking services
            on Fixxam.
          </Text>
        </View>

        {/* Promotions */}

        <View style={styles.list}>
          {PROMOTIONS.map((promotion) => (
            <Pressable
              key={promotion.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${promotion.title}`}
            onPress={() => {
  if (promotion.id === "special-offers") {
    router.push(
      "/(customer)/promotions/special-offer",
    );
    return;
  }

  if (promotion.id === "service-promotions") {
    router.push(
      "/(customer)/promotions/service-promotions",
    );
    return;
  }
}}



              style={({ pressed }) => [
                styles.promotionCard,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      promotion.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name={promotion.icon}
                  size={29}
                  color={promotion.iconColor}
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  {promotion.title}
                </Text>

                <Text style={styles.cardDescription}>
                  {promotion.description}
                </Text>

                <View style={styles.actionRow}>
                  <Text style={styles.actionText}>
                    VIEW OFFER
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#2563EB"
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Info */}

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#64748B"
          />

          <Text style={styles.infoText}>
            New promotions will appear here as they
            become available.
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },

  introCard: {
    padding: 22,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  introIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  introTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  introDescription: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
  },

  list: {
    gap: 14,
  },

  promotionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  pressed: {
    opacity: 0.75,
  },

  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  cardDescription: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  actionText: {
    marginRight: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.3,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },
});