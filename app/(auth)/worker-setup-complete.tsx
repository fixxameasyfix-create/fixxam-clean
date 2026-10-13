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

export default function WorkerSetupComplete() {
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
     CONTINUE TO WORKER HOME
  ========================================================== */

  const handleContinue =
    useCallback(() => {
      router.dismissAll();

      router.replace(
        "/(worker)/(tabs)/home",
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
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.container
          }
        >
          {/* ==================================================
              SUCCESS ICON
          ================================================== */}

          <View
            style={
              styles.successIcon
            }
          >
            <AppIcon
              name="success"
              role="worker"
              state="active"
              size="xl"
              color={
                Colors.success
              }
            />
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            variant="heading1"
            weight="bold"
            center
            style={
              styles.title
            }
          >
            Welcome to Fixxam!
          </AppText>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.description
            }
          >
            Your worker account has been created successfully.
          </AppText>

          {/* ==================================================
              CONTINUE
          ================================================== */}

          <View
            style={
              styles.buttonContainer
            }
          >
            <AppButton
              title="Continue to Dashboard"
              role="worker"
              variant="primary"
              size="md"
              onPress={
                handleContinue
              }
            />
          </View>
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

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ==========================================================
       SUCCESS ICON
    ========================================================== */

    successIcon: {
      width: 96,

      height: 96,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    /* ==========================================================
       TITLE
    ========================================================== */

    title: {
      marginTop:
        FixxamTokens.spacing.xl,

      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       DESCRIPTION
    ========================================================== */

    description: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       BUTTON
    ========================================================== */

    buttonContainer: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxl,
    },
  });