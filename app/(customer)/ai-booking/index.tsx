import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppScreen } from "@/components/ui";

export default function AiBookingScreen() {
  const handleTakePhoto = () => {
    router.push(
      "/(customer)/ai-booking/camera",
    );
  };

  const handleDescribeProblem = () => {
    router.push(
      "/(customer)/ai-booking/describe",
    );
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#0F172A"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Book Automatically
            </Text>

            <Text style={styles.subtitle}>
              Tell Fixxam what you need and let AI
              prepare your service request.
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* AI FEATURE CARD                                    */}
        {/* ================================================== */}

        <View style={styles.aiCard}>
          <View style={styles.aiTopRow}>
            <View style={styles.aiIcon}>
              <Ionicons
                name="sparkles"
                size={24}
                color="#F97316"
              />
            </View>

            <View style={styles.aiBadge}>
              <Ionicons
                name="sparkles-outline"
                size={12}
                color="#F97316"
              />

              <Text
                style={styles.aiBadgeText}
              >
                AI ASSISTED
              </Text>
            </View>
          </View>

          <Text style={styles.aiTitle}>
            Let Fixxam understand
            your problem
          </Text>

          <Text style={styles.aiDescription}>
            You don't need to know the service
            name. Describe the problem or show us
            a photo. Fixxam will analyze it, identify
            the right service, and prepare your
            request.
          </Text>
        </View>

        {/* ================================================== */}
        {/* START TITLE                                        */}
        {/* ================================================== */}

        <Text style={styles.sectionTitle}>
          How would you like to start?
        </Text>

        {/* ================================================== */}
        {/* TAKE PHOTO                                         */}
        {/* ================================================== */}

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={handleTakePhoto}
          accessibilityRole="button"
          accessibilityLabel="Take a photo"
        >
          <View
            style={[
              styles.actionIcon,
              styles.cameraIcon,
            ]}
          >
            <Ionicons
              name="camera-outline"
              size={25}
              color="#2563EB"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Take a Photo
            </Text>

            <Text
              style={styles.actionDescription}
            >
              Show Fixxam the problem and let AI
              understand what you need.
            </Text>
          </View>

          <View style={styles.arrowBox}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#2563EB"
            />
          </View>
        </TouchableOpacity>

        {/* ================================================== */}
        {/* DESCRIBE PROBLEM                                   */}
        {/* ================================================== */}

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={handleDescribeProblem}
          accessibilityRole="button"
          accessibilityLabel="Describe your problem"
        >
          <View
            style={[
              styles.actionIcon,
              styles.textIcon,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={25}
              color="#F97316"
            />
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              Describe Your Problem
            </Text>

            <Text
              style={styles.actionDescription}
            >
              Tell Fixxam what happened using
              your own words and AI will prepare
              your request.
            </Text>
          </View>

          <View
            style={[
              styles.arrowBox,
              styles.orangeArrowBox,
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#F97316"
            />
          </View>
        </TouchableOpacity>

        {/* ================================================== */}
        {/* CUSTOMER CONTROL                                  */}
        {/* ================================================== */}

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#16A34A"
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              You're always in control
            </Text>

            <Text style={styles.securityText}>
              AI only prepares your request. You
              will review and edit the service,
              problem, location and worker before
              sending the request.
            </Text>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  /* ================================================== */
  /* HEADER                                             */
  /* ================================================== */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    marginRight: 11,
  },

  headerText: {
    flex: 1,
    paddingTop: 1,
  },

  title: {
    color: "#0F172A",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 5,

    color: "#64748B",

    fontSize: 13,
    lineHeight: 19,

    fontWeight: "500",
  },

  /* ================================================== */
  /* AI CARD                                            */
  /* ================================================== */

  aiCard: {
    backgroundColor: "#FFF7ED",

    borderRadius: 22,

    padding: 19,

    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  aiTopRow: {
    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 14,
  },

  aiIcon: {
    width: 48,
    height: 48,

    borderRadius: 15,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",
  },

  aiBadge: {
    minHeight: 28,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  aiBadgeText: {
    color: "#F97316",

    fontSize: 9,
    fontWeight: "800",

    letterSpacing: 0.4,
  },

  aiTitle: {
    color: "#0F172A",

    fontSize: 19,
    lineHeight: 24,

    fontWeight: "800",
  },

  aiDescription: {
    marginTop: 7,

    color: "#64748B",

    fontSize: 12.5,
    lineHeight: 19,

    fontWeight: "500",
  },

  /* ================================================== */
  /* SECTION                                            */
  /* ================================================== */

  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,

    color: "#0F172A",

    fontSize: 15,
    lineHeight: 20,

    fontWeight: "800",
  },

  /* ================================================== */
  /* ACTION CARD                                        */
  /* ================================================== */

  actionCard: {
    minHeight: 88,

    marginBottom: 10,

    paddingHorizontal: 13,
    paddingVertical: 13,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  actionIcon: {
    width: 50,
    height: 50,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  cameraIcon: {
    backgroundColor: "#EFF6FF",
  },

  textIcon: {
    backgroundColor: "#FFF7ED",
  },

  actionContent: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    color: "#0F172A",

    fontSize: 15,
    lineHeight: 20,

    fontWeight: "800",
  },

  actionDescription: {
    marginTop: 3,

    paddingRight: 5,

    color: "#64748B",

    fontSize: 11.5,
    lineHeight: 17,

    fontWeight: "500",
  },

  arrowBox: {
    width: 32,
    height: 32,

    borderRadius: 11,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 7,
  },

  orangeArrowBox: {
    backgroundColor: "#FFF7ED",
  },

  /* ================================================== */
  /* CUSTOMER CONTROL                                   */
  /* ================================================== */

  securityCard: {
    marginTop: 8,

    padding: 13,

    borderRadius: 16,

    backgroundColor: "#F0FDF4",

    borderWidth: 1,
    borderColor: "#DCFCE7",

    flexDirection: "row",
    alignItems: "flex-start",
  },

  securityIcon: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",
  },

  securityContent: {
    flex: 1,
    marginLeft: 9,
  },

  securityTitle: {
    color: "#166534",

    fontSize: 12,
    lineHeight: 16,

    fontWeight: "800",
  },

  securityText: {
    marginTop: 2,

    color: "#15803D",

    fontSize: 10.5,
    lineHeight: 16,

    fontWeight: "500",
  },
});