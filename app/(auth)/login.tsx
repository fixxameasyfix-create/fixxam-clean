import React, {
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  signInWithEmailAndPassword,
} from "@/firebase/firebaseAuth";

import { auth } from "@/firebase/config";

import {
  AppIcon,
  AppScreen,
} from "@/components/ui";

import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";
import LoginHeader from "@/components/auth/LoginHeader";

import {
  advanceEmergencyOnLogin,
} from "@/utils/emergencyRotation";

import {
  showError,
} from "@/utils/showToast";

import {
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   LOGIN SCREEN
============================================================== */

export default function LoginScreen() {
  const {
    returnTo,
    identifier: initialIdentifier,
  } =
    useLocalSearchParams<{
      returnTo?: string;
      identifier?: string;
    }>();

  const [
    identifier,
    setIdentifier,
  ] = useState(
    typeof initialIdentifier === "string"
      ? initialIdentifier
      : "",
  );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin =
    useCallback(async () => {
      if (loading) {
        return;
      }

      const cleanIdentifier =
        identifier.trim();

      /*
       * Do not trim the password.
       *
       * Spaces may legitimately be part
       * of a user's password.
       */
      const cleanPassword =
        password;

      if (!cleanIdentifier) {
        showError(
          "Email or phone required",
          "Please enter your email or phone number.",
        );

        return;
      }

      if (!cleanPassword) {
        showError(
          "Password required",
          "Please enter your password.",
        );

        return;
      }

      /* ========================================================
         PHONE LOGIN
      ======================================================== */

      const phoneCandidate =
        cleanIdentifier.replace(
          /[\s()-]/g,
          "",
        );

      const isPhone =
        /^\+?\d+$/.test(
          phoneCandidate,
        );

      if (isPhone) {
        const params =
          new URLSearchParams();

        params.set(
          "phone",
          phoneCandidate,
        );

        if (
          typeof returnTo ===
            "string" &&
          returnTo.trim()
        ) {
          params.set(
            "returnTo",
            returnTo,
          );
        }

        router.push(
          `/(auth)/phone-login?${params.toString()}` as never,
        );

        return;
      }

      /* ========================================================
         EMAIL LOGIN
      ======================================================== */

      try {
        setLoading(true);

        await signInWithEmailAndPassword(
          auth,
          cleanIdentifier.toLowerCase(),
          cleanPassword,
        );

       await advanceEmergencyOnLogin();

/*
 * Always resolve the authenticated user's
 * actual Fixxam role before navigating.
 *
 * Never allow returnTo to bypass role
 * resolution.
 */
router.replace(
  "/(auth)/role-resolver",
);
      } catch (error: unknown) {
        console.error(
          "LOGIN_ERROR:",
          error,
        );

        let message =
          "Unable to sign in. Please check your details and try again.";

        if (
          typeof error ===
            "object" &&
          error !== null &&
          "code" in error
        ) {
          const code =
            String(
              (
                error as {
                  code?: unknown;
                }
              ).code,
            );

          switch (code) {
            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
              message =
                "The email or password is incorrect.";
              break;

            case "auth/invalid-email":
              message =
                "Please enter a valid email address.";
              break;

            case "auth/user-disabled":
              message =
                "This account has been disabled. Please contact support.";
              break;

            case "auth/too-many-requests":
              message =
                "Too many attempts. Please wait and try again.";
              break;

            case "auth/network-request-failed":
              message =
                "Network error. Please check your internet connection.";
              break;

            default:
              break;
          }
        }

        showError(
          "Sign In Failed",
          message,
        );
      } finally {
        setLoading(false);
      }
    }, [
      identifier,
      loading,
      password,
      returnTo,
    ]);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace(
        "/(auth)/role-selection",
      );
    }, []);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      scrollEnabled
      keyboardAvoiding
      contentContainerStyle={
        styles.screen
      }
    >
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="sm"
          />
        </Pressable>
      </View>

      <LoginHeader
        role="customer"
      />

      <LoginForm
        role="customer"
        identifier={identifier}
        setIdentifier={
          setIdentifier
        }
        password={password}
        setPassword={
          setPassword
        }
        loading={loading}
        onLogin={handleLogin}
      />

      <LoginFooter
        role="customer"
      />
    </AppScreen>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flexGrow: 1,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    headerRow: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",
      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });