import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
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
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth } from "@/firebase/config";

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

export default function CustomerSetupComplete() {
  const [user, setUser] =
    useState<User | null>(
      null,
    );

  const [authLoading, setAuthLoading] =
    useState(true);

  const navigationStarted =
    useRef(false);

  /* ==========================================================
     LISTEN TO FIREBASE AUTH
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        firebaseUser => {
          setUser(
            firebaseUser,
          );

          setAuthLoading(false);
        },
      );

    return unsubscribe;
  }, []);

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
     NAVIGATE TO CUSTOMER HOME
  ========================================================== */

  const navigateToCustomerHome =
    useCallback(() => {
      if (
        authLoading ||
        !user ||
        navigationStarted.current
      ) {
        return;
      }

      navigationStarted.current =
        true;

      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, [
      authLoading,
      user,
    ]);

  /* ==========================================================
     AUTO CONTINUE AFTER AUTH IS READY
  ========================================================== */

  useEffect(() => {
    if (
      authLoading ||
      !user
    ) {
      return;
    }

    navigateToCustomerHome();
  }, [
    authLoading,
    navigateToCustomerHome,
    user,
  ]);

  /* ==========================================================
     CONTINUE BUTTON
  ========================================================== */

  const handleContinue =
    useCallback(() => {
      navigateToCustomerHome();
    }, [
      navigateToCustomerHome,
    ]);

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
              role="customer"
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
            Your account has been created successfully.
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
              title={
                authLoading
                  ? "Preparing your account..."
                  : "Continue to Home"
              }
              role="customer"
              variant="primary"
              size="md"
              onPress={
                handleContinue
              }
              disabled={
                authLoading ||
                !user ||
                navigationStarted.current
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