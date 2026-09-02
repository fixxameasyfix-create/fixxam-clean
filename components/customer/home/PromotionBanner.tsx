import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

export default function PromotionBanner() {
  return (
    <AppCard style={styles.card}>

      <View style={styles.content}>

        <View style={styles.left}>

          <View style={styles.badge}>
            <AppText style={styles.badgeText}>
              LIMITED OFFER
            </AppText>
          </View>

          <AppText
            weight="bold"
            style={styles.title}
          >
            Save up to 20%
          </AppText>

          <AppText style={styles.subtitle}>
            Book your first service and
            enjoy a special discount from
            verified professionals.
          </AppText>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.button}
          >
            <AppText
              weight="bold"
              style={styles.buttonText}
            >
              Book Now
            </AppText>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#FFFFFF"
            />
          </TouchableOpacity>

        </View>

        <View style={styles.iconBox}>
          <Ionicons
            name="gift"
            size={60}
            color="#FFFFFF"
          />
        </View>

      </View>

    </AppCard>
  );
}

const styles = StyleSheet.create({

  card: {
    marginBottom: 22,

    borderRadius: 24,

    backgroundColor: "#2563EB",

    padding: 20,

    overflow: "hidden",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flex: 1,
    paddingRight: 16,
  },

  badge: {
    alignSelf: "flex-start",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 10,
    paddingVertical: 4,

    borderRadius: 20,

    marginBottom: 10,
  },

  badgeText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
  },

  subtitle: {
    marginTop: 8,

    color: "#DBEAFE",

    fontSize: 13,

    lineHeight: 20,
  },

  button: {
    marginTop: 18,

    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F97316",

    borderRadius: 14,

    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 14,

    marginRight: 6,
  },

  iconBox: {
    width: 90,
    height: 90,

    borderRadius: 45,

    backgroundColor: "rgba(255,255,255,0.15)",

    justifyContent: "center",
    alignItems: "center",
  },

});