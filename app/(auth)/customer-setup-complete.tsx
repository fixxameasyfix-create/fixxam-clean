import React, {
  useCallback,
  useEffect,
} from "react";

import {
  BackHandler,
  StyleSheet,
  View,
} from "react-native";

import {
  Stack,
  router,
} from "expo-router";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerSetupComplete() {
  /* ==========================================================
     BLOCK BACK
  ========================================================== */

  useEffect(() => {
    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

    return () => {
      subscription.remove();
    };
  }, []);

  /* ==========================================================
     CONTINUE
  ========================================================== */

  const handleContinue =
    useCallback(() => {
      router.dismissAll();

      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.container
          }
        >
          <AppCard
            style={
              styles.card
            }
          >
            <View
              style={
                styles.successIcon
              }
            >
              <AppIcon
                name="success"
                size="xl"
                color={
                  Colors.success
                }
              />
            </View>

            <AppText
              variant="heading2"
              weight="bold"
              center
              style={
                styles.title
              }
            >
              Setup Complete
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.description
              }
            >
              Your customer profile has been created successfully.
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.subtitle
              }
            >
              You can now start requesting services from trusted workers.
            </AppText>

            <View
              style={
                styles.buttonContainer
              }
            >
              <AppButton
                title="Go to Home"
                role="customer"
                variant="primary"
                onPress={
                  handleContinue
                }
              />
            </View>
          </AppCard>
        </View>
      </AppScreen>
    </>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    container: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      justifyContent:
        "center",
    },

    card: {
      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      ...FixxamTokens.shadow.card,
    },

    successIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    description: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    subtitle: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    buttonContainer: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,
    },
  });