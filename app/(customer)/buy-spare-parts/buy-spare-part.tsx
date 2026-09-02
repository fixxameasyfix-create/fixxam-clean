import React, { useCallback } from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type ActionCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  badge?: string;
};

/*
 * ============================================================
 * ACTION CARD
 * ============================================================
 */

function ActionCard({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  badge,
}: ActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.actionCardPressed,
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={29}
          color={iconColor}
        />
      </View>

      <View style={styles.actionContent}>
        <View style={styles.actionTitleRow}>
          <AppText
            weight="bold"
            style={styles.actionTitle}
            numberOfLines={1}
          >
            {title}
          </AppText>

          {badge ? (
            <View style={styles.easyBadge}>
              <AppText
                weight="bold"
                style={styles.easyBadgeText}
              >
                {badge}
              </AppText>
            </View>
          ) : null}
        </View>

        <AppText
          style={styles.actionDescription}
          numberOfLines={2}
        >
          {description}
        </AppText>
      </View>

      <View style={styles.chevronWrap}>
        <Ionicons
          name="chevron-forward"
          size={23}
          color={CustomerColors.textSecondary}
        />
      </View>
    </Pressable>
  );
}

/*
 * ============================================================
 * SCREEN
 * ============================================================
 */

export default function FindPartScreen() {
  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleTakePhoto = useCallback(() => {
    router.push(
      "/(customer)/buy-spare-parts/take-photo",
    );
  }, []);

  const handleDescribePart = useCallback(() => {
    router.push(
      "/(customer)/buy-spare-parts/describe-part",
    );
  }, []);

  const handleChooseEquipment = useCallback(() => {
    router.push(
      "/(customer)/buy-spare-parts/choose-equipment",
    );
  }, []);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* ==================================================
              HEADER
          =================================================== */}

          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={CustomerColors.textPrimary}
              />
            </Pressable>

            <View style={styles.headerText}>
              <AppText
                weight="bold"
                style={styles.headerTitle}
                numberOfLines={1}
              >
                Find a Spare Part
              </AppText>

              <AppText
                style={styles.headerSubtitle}
                numberOfLines={1}
              >
                Find it easily
              </AppText>
            </View>
          </View>

          {/* ==================================================
              INTRO / HELP CARD
          =================================================== */}

          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>
              <MaterialCommunityIcons
                name="puzzle-outline"
                size={30}
                color="#1459C7"
              />
            </View>

            <View style={styles.helpContent}>
              <AppText
                weight="bold"
                style={styles.helpTitle}
              >
                Need help finding a part?
              </AppText>

              <AppText style={styles.helpDescription}>
                You don't need to know the part name.
                Fixxam can help you find it.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              ACTIONS
          =================================================== */}

          <View style={styles.actions}>
            <ActionCard
              title="Take a Photo"
              description="Show us the part and we'll help you identify it."
              icon="camera-outline"
              iconColor="#1459C7"
              iconBackground="#EEF5FF"
              badge="EASY"
              onPress={handleTakePhoto}
            />

            <ActionCard
              title="Describe Your Part"
              description="Tell Fixxam what you need in your own words."
              icon="create-outline"
              iconColor="#E87920"
              iconBackground="#FFF5EA"
              onPress={handleDescribePart}
            />

            <ActionCard
              title="Choose Your Equipment"
              description="Select your equipment and find compatible parts."
              icon="construct-outline"
              iconColor="#1459C7"
              iconBackground="#F1F5FF"
              onPress={handleChooseEquipment}
            />
          </View>

          {/* ==================================================
              SMALL REASSURANCE
          =================================================== */}

          <View style={styles.reassurance}>
            <View style={styles.reassuranceIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#238B57"
              />
            </View>

            <View style={styles.reassuranceContent}>
              <AppText
                weight="bold"
                style={styles.reassuranceTitle}
              >
                Don't know the part name?
              </AppText>

              <AppText style={styles.reassuranceText}>
                That's okay. Take a photo or describe
                what you need and we'll help you.
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  /*
   * ==========================================================
   * SCREEN
   * ==========================================================
   */

  safeArea: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 35,
  },

  /*
   * ==========================================================
   * HEADER
   * ==========================================================
   */

  header: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 8,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: CustomerColors.background,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  backButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 25,
    lineHeight: 30,
    color: CustomerColors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: CustomerColors.textSecondary,
  },

  /*
   * ==========================================================
   * HELP CARD
   * ==========================================================
   */

  helpCard: {
    minHeight: 118,
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 17,
    borderRadius: 24,

    backgroundColor: "#EEF5FF",

    borderWidth: 1,
    borderColor: "#D8E7FA",

    flexDirection: "row",
    alignItems: "center",
  },

  helpIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  helpContent: {
    flex: 1,
    marginLeft: 16,
  },

  helpTitle: {
    fontSize: 18,
    lineHeight: 23,
    color: CustomerColors.textPrimary,
  },

  helpDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: CustomerColors.textSecondary,
  },

  /*
   * ==========================================================
   * ACTIONS
   * ==========================================================
   */

  actions: {
    marginTop: 20,
  },

  /*
   * ==========================================================
   * ACTION CARD
   * ==========================================================
   */

  actionCard: {
    minHeight: 112,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,

    borderRadius: 23,

    backgroundColor: CustomerColors.background,

    borderWidth: 1,
    borderColor: CustomerColors.border,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  actionCardPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  actionIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  actionContent: {
    flex: 1,
    marginLeft: 15,
    paddingRight: 8,
  },

  actionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  actionTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: CustomerColors.textPrimary,
  },

  actionDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: CustomerColors.textSecondary,
  },

  /*
   * ==========================================================
   * EASY BADGE
   * ==========================================================
   */

  easyBadge: {
    minHeight: 23,
    marginLeft: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  easyBadgeText: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.3,
    color: "#1459C7",
  },

  /*
   * ==========================================================
   * CHEVRON
   * ==========================================================
   */

  chevronWrap: {
    width: 27,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  /*
   * ==========================================================
   * REASSURANCE
   * ==========================================================
   */

  reassurance: {
    marginTop: 8,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 18,

    backgroundColor: "#F0FBF5",
    borderWidth: 1,
    borderColor: "#D7F2E2",

    flexDirection: "row",
    alignItems: "center",
  },

  reassuranceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  reassuranceContent: {
    flex: 1,
    marginLeft: 11,
  },

  reassuranceTitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: "#237548",
  },

  reassuranceText: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 17,
    color: "#4B8063",
  },
});