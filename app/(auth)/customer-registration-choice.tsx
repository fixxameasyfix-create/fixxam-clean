import React, { useCallback } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

export default function CustomerRegistrationChoice() {
  /* ============================================================
     USE WORKER DETAILS
  ============================================================ */

  const handleUseWorkerDetails =
    useCallback(() => {
      router.replace(
        "/(auth)/customer-signup?source=worker&prefill=worker" as never,
      );
    }, []);

  /* ============================================================
     NEW REGISTRATION
  ============================================================ */

  const handleNewRegistration =
    useCallback(() => {
      router.replace(
        "/(auth)/customer-signup?source=worker&prefill=blank" as never,
      );
    }, []);

  return (
    <AppScreen
      role="customer"
      scrollEnabled
      keyboardAvoiding={false}
      contentContainerStyle={
        styles.content
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <AppIcon
            name="profile"
            role="customer"
            size="md"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading2"
          weight="bold"
          style={styles.title}
        >
          How do you want to become a customer?
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          style={styles.subtitle}
        >
          Choose how you want to set up your customer profile.
        </AppText>
      </View>

      {/* ======================================================
          OPTIONS
      ====================================================== */}

      <View style={styles.options}>
        <RegistrationOption
          icon="profile"
          title="Use your worker details"
          description="Start with your existing worker information."
          onPress={
            handleUseWorkerDetails
          }
        />

        <RegistrationOption
          icon="profile"
          title="Make a new registration"
          description="Create a separate customer profile from scratch."
          onPress={
            handleNewRegistration
          }
        />
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   OPTION
============================================================== */

type RegistrationOptionProps = {
  icon: "profile";
  title: string;
  description: string;
  onPress: () => void;
};

function RegistrationOption({
  icon,
  title,
  description,
  onPress,
}: RegistrationOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="Opens customer registration"
      hitSlop={4}
      style={({ pressed }) => [
        styles.option,
        pressed
          ? styles.optionPressed
          : null,
      ]}
    >
      {/* ====================================================
          ICON
      ==================================================== */}

      <View style={styles.optionIcon}>
        <AppIcon
          name={icon}
          role="customer"
          size="md"
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ====================================================
          TEXT
      ==================================================== */}

      <View style={styles.optionContent}>
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={styles.optionTitle}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.optionDescription
          }
        >
          {description}
        </AppText>
      </View>

      {/* ====================================================
          ARROW
      ==================================================== */}

      <View style={styles.optionArrow}>
        <AppIcon
          name="next"
          role="customer"
          size="sm"
          state="muted"
        />
      </View>
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,

    width: "100%",

    paddingHorizontal:
      FixxamTokens.spacing.lg,

    paddingTop:
      FixxamTokens.spacing.lg,

    paddingBottom:
      FixxamTokens.spacing.xxl,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    width: "100%",

    alignItems: "center",

    marginBottom:
      FixxamTokens.spacing.xl,
  },

  iconContainer: {
    width: 64,
    height: 64,

    alignItems: "center",
    justifyContent: "center",

    marginBottom:
      FixxamTokens.spacing.md,

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      CustomerColors.primarySoft,
  },

  title: {
    width: "100%",

    textAlign: "center",

    color: Colors.textPrimary,
  },

  subtitle: {
    width: "100%",

    maxWidth: 360,

    marginTop:
      FixxamTokens.spacing.xs,

    textAlign: "center",

    lineHeight: 20,
  },

  /* ==========================================================
     OPTIONS
  ========================================================== */

  options: {
    width: "100%",

    gap: FixxamTokens.spacing.sm,
  },

  option: {
    width: "100%",

    minHeight: 88,

    paddingHorizontal:
      FixxamTokens.spacing.md,

    paddingVertical:
      FixxamTokens.spacing.sm,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.lg,

    backgroundColor:
      Colors.surface,
  },

  optionPressed: {
    opacity:
      FixxamTokens.motion.pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion.scalePressed,
      },
    ],
  },

  /* ==========================================================
     ICON
  ========================================================== */

  optionIcon: {
    width:
      FixxamTokens.size.minimumTouchTarget,

    height:
      FixxamTokens.size.minimumTouchTarget,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.md,

    backgroundColor:
      CustomerColors.primarySoft,
  },

  /* ==========================================================
     CONTENT
  ========================================================== */

  optionContent: {
    flex: 1,

    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.sm,

    marginRight:
      FixxamTokens.spacing.xs,
  },

  optionTitle: {
    color:
      Colors.textPrimary,
  },

  optionDescription: {
    marginTop:
      FixxamTokens.spacing.xxs,

    lineHeight: 17,
  },

  /* ==========================================================
     ARROW
  ========================================================== */

  optionArrow: {
    width:
      FixxamTokens.size.minimumTouchTarget,

    height:
      FixxamTokens.size.minimumTouchTarget,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",
  },
});