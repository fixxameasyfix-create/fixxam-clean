import React, {
  useCallback,
} from "react";

import {
  Pressable,
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

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type ProviderOptionProps = {
  icon: "profile";
  title: string;
  description: string;
  onPress: () => void;
};

/* ============================================================
   SCREEN
============================================================ */

export default function BecomeAProviderScreen() {
  /* ==========================================================
     USE CUSTOMER DETAILS
  ========================================================== */

  const handleUseCustomerDetails =
    useCallback(() => {
      router.push(
        "/(auth)/worker/worker-signup?source=customer" as never,
      );
    }, []);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <View
        style={
          styles.container
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={
              handleBack
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.backButtonPressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="customer"
              size="sm"
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
              variant="heading3"
              weight="bold"
              style={
                styles.title
              }
            >
              How do you want to be a provider?
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Choose how you want to set up your provider profile.
            </AppText>
          </View>
        </View>

        {/* ==================================================
            OPTION
        ================================================== */}

        <View
          style={
            styles.options
          }
        >
          <ProviderOption
            icon="profile"
            title="Use your customer details"
            description="Start with the personal information already saved on your customer account."
            onPress={
              handleUseCustomerDetails
            }
          />
        </View>

        {/* ==================================================
            INFO
        ================================================== */}

        <View
          style={
            styles.infoCard
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="info"
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.infoContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.infoTitle
              }
            >
              Your profiles stay separate
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.infoText
              }
            >
              If you use your customer details, they are only used to pre-fill your provider registration. After registration, customer and provider details can be updated independently.
            </AppText>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   PROVIDER OPTION
============================================================ */

function ProviderOption({
  icon,
  title,
  description,
  onPress,
}: ProviderOptionProps) {
  return (
    <Pressable
      onPress={
        onPress
      }
      accessibilityRole="button"
      accessibilityLabel={
        title
      }
      accessibilityHint={
        description
      }
      style={({
        pressed,
      }) => [
        styles.optionCard,

        pressed
          ? styles.optionPressed
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={
          styles.optionIcon
        }
      >
        <AppIcon
          name={
            icon
          }
          role="customer"
          size="md"
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.optionContent
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={2}
          style={
            styles.optionTitle
          }
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.optionDescription
          }
        >
          {description}
        </AppText>
      </View>

      {/* ======================================================
          ARROW
      ====================================================== */}

      <View
        style={
          styles.optionArrow
        }
      >
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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
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

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    backButtonPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      paddingTop:
        FixxamTokens.spacing.xxs,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,
    },

    /* ========================================================
       OPTIONS
    ======================================================== */

    options: {
      marginTop:
        FixxamTokens.spacing.xl,

      gap:
        FixxamTokens.spacing.sm,
    },

    optionCard: {
      minHeight: 112,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    optionPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    optionIcon: {
      width:
        52,

      height:
        52,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    optionContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    optionTitle: {
      color:
        Colors.textPrimary,
    },

    optionDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },

    optionArrow: {
      flexShrink: 0,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderWidth:
        1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    infoIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

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

    infoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    infoTitle: {
      color:
        Colors.textPrimary,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },
  });