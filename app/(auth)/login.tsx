import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  signInWithEmailAndPassword,
} from "@/firebase/firebaseAuth";

import {
  auth,
} from "@/firebase/config";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  advanceEmergencyOnLogin,
} from "@/utils/emergencyRotation";

import {
  showError,
} from "@/utils/showToast";

/* ==============================================================
   LOGIN SCREEN
============================================================== */

export default function LoginScreen() {
  /* ============================================================
     RETURN ROUTE
  ============================================================ */

  const {
    returnTo,
  } =
    useLocalSearchParams<{
      returnTo?: string;
    }>();

  /* ============================================================
     FORM STATE
  ============================================================ */

  const [
    identifier,
    setIdentifier,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);

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

      const cleanPassword =
        password.trim();

      /* ========================================================
         VALIDATION
      ======================================================== */

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

      const isPhone =
        /^\+?\d+$/.test(
          cleanIdentifier,
        );

      if (isPhone) {
        const phoneLoginParams =
          new URLSearchParams();

        phoneLoginParams.set(
          "phone",
          cleanIdentifier,
        );

        /*
         * Preserve original destination.
         *
         * Example:
         *
         * Worker profile
         * → Login
         * → Phone login
         * → Worker profile
         */

        if (
          typeof returnTo ===
            "string" &&
          returnTo.trim()
        ) {
          phoneLoginParams.set(
            "returnTo",
            returnTo,
          );
        }

        router.push(
          `/(auth)/phone-login?${phoneLoginParams.toString()}` as any,
        );

        return;
      }

      /* ========================================================
         FIREBASE EMAIL LOGIN
      ======================================================== */

      try {
        setLoading(true);

        await signInWithEmailAndPassword(
          auth,
          cleanIdentifier,
          cleanPassword,
        );

        /* ======================================================
           EMERGENCY ROTATION
        ====================================================== */

        await advanceEmergencyOnLogin();

        /* ======================================================
           RETURN TO ORIGINAL SCREEN
        ====================================================== */

        if (
          typeof returnTo ===
            "string" &&
          returnTo.trim()
        ) {
          router.replace(
            returnTo as any,
          );

          return;
        }

        /* ======================================================
           NORMAL LOGIN FLOW
        ====================================================== */

        router.replace(
          "/(auth)/role-resolver",
        );
      } catch (
        error: unknown
      ) {
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
                "The email/phone or password is incorrect.";
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
                "Too many attempts. Please wait a moment and try again.";
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
      password,
      loading,
      returnTo,
    ]);

  /* ============================================================
     FORGOT PASSWORD
  ============================================================ */

  const handleForgotPassword =
    useCallback(() => {
      router.push(
        "/(auth)/forgot-password",
      );
    }, []);

  /* ============================================================
     CREATE ACCOUNT
  ============================================================ */

  const handleCreateAccount =
    useCallback(() => {
      router.push(
        "/(auth)/role-selection",
      );
    }, []);

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
      contentContainerStyle={
        styles.screen
      }
    >
      <KeyboardAvoidingView
        style={
          styles.keyboard
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={
              handleBack
            }
            style={({ pressed }) => [
              styles.backButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#0F172A"
            />
          </Pressable>
        
              
          {/* ==================================================
              HEADING
          ================================================== */}

          <View
            style={
              styles.heading
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Welcome back
            </AppText>

            <AppText
              style={
                styles.subtitle
              }
            >
              Sign in to continue with Fixxam.
            </AppText>
          </View>

          {/* ==================================================
              FORM
          ================================================== */}

          <View
            style={
              styles.form
            }
          >
            {/* ==================================================
                EMAIL / PHONE
            ================================================== */}

            <View
              style={
                styles.inputWrapper
              }
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                value={
                  identifier
                }
                onChangeText={
                  setIdentifier
                }
                placeholder="Email or phone number"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={
                  !loading
                }
                returnKeyType="next"
                style={
                  styles.textInput
                }
              />
            </View>

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <View
              style={
                styles.inputWrapper
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                value={
                  password
                }
                onChangeText={
                  setPassword
                }
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={
                  !passwordVisible
                }
                editable={
                  !loading
                }
                returnKeyType="done"
                onSubmitEditing={
                  handleLogin
                }
                style={
                  styles.textInput
                }
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible
                    ? "Hide password"
                    : "Show password"
                }
                onPress={() =>
                  setPasswordVisible(
                    (value) =>
                      !value,
                  )
                }
                hitSlop={8}
                style={
                  styles.eyeButton
                }
              >
                <Ionicons
                  name={
                    passwordVisible
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>

            {/* ==================================================
                FORGOT PASSWORD
            ================================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              disabled={
                loading
              }
              onPress={
                handleForgotPassword
              }
              style={({ pressed }) => [
                styles.forgotButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <AppText
                weight="bold"
                style={
                  styles.forgotText
                }
              >
                Forgot password?
              </AppText>
            </Pressable>

            {/* ==================================================
                SIGN IN
            ================================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              disabled={
                loading
              }
              onPress={
                handleLogin
              }
              style={({ pressed }) => [
                styles.signInButton,

                loading &&
                  styles.signInButtonLoading,

                pressed &&
                  !loading &&
                  styles.signInButtonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <AppText
                  weight="bold"
                  style={
                    styles.signInText
                  }
                >
                  Sign In
                </AppText>
              )}
            </Pressable>

            {/* ==================================================
                OR
            ================================================== */}

            <View
              style={
                styles.orRow
              }
            >
              <View
                style={
                  styles.orLine
                }
              />

              <AppText
                weight="bold"
                style={
                  styles.orText
                }
              >
                OR
              </AppText>

              <View
                style={
                  styles.orLine
                }
              />
            </View>

            {/* ==================================================
                GOOGLE
            ================================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              disabled={
                loading
              }
              style={({ pressed }) => [
                styles.socialButton,

                pressed &&
                  styles.socialPressed,
              ]}
            >
              <View
                style={
                  styles.googleIcon
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.googleG
                  }
                >
                  G
                </AppText>
              </View>

              <AppText
                weight="bold"
                style={
                  styles.socialText
                }
              >
                Continue with Google
              </AppText>
            </Pressable>

            {/* ==================================================
                APPLE
            ================================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              disabled={
                loading
              }
              style={({ pressed }) => [
                styles.socialButton,

                pressed &&
                  styles.socialPressed,
              ]}
            >
              <Ionicons
                name="logo-apple"
                size={22}
                color="#000000"
              />

              <AppText
                weight="bold"
                style={
                  styles.socialText
                }
              >
                Continue with Apple
              </AppText>
            </Pressable>
          </View>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <View
            style={
              styles.footer
            }
          >
            <AppText
              style={
                styles.footerText
              }
            >
              New to Fixxam?
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create Fixxam account"
              onPress={
                handleCreateAccount
              }
              style={({ pressed }) => [
                pressed &&
                  styles.pressed,
              ]}
            >
              <AppText
                weight="bold"
                style={
                  styles.createText
                }
              >
                Create account
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flexGrow: 1,
      backgroundColor:
        "#FFFFFF",
    },

    keyboard: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 28,
    },

    /* ========================================================
       BACK
    ======================================================== */

    backButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 15,
    },

    pressed: {
      opacity: 0.65,
    },

    /* ========================================================
       LOGO
    ======================================================== */

    logoSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 3,
    },

    logoMark: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 9,
    },

    logoMarkText: {
      fontSize: 25,
      lineHeight: 29,
      color: "#FFFFFF",
    },

    logoText: {
      fontSize: 26,
      letterSpacing: -0.7,
      color: "#0F2A59",
    },

    /* ========================================================
       HEADING
    ======================================================== */

    heading: {
      alignItems: "center",
      marginTop: 25,
      marginBottom: 25,
    },

    title: {
      fontSize: 27,
      lineHeight: 33,
      letterSpacing: -0.5,
      color: "#071A41",
      textAlign: "center",
    },

    subtitle: {
      marginTop: 7,
      fontSize: 14,
      lineHeight: 20,
      color: "#64748B",
      textAlign: "center",
    },

    /* ========================================================
       FORM
    ======================================================== */

    form: {
      width: "100%",
    },

    inputWrapper: {
      minHeight: 58,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#D9E0EA",
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      marginBottom: 13,
    },

    textInput: {
      flex: 1,
      minWidth: 0,
      height: 56,
      marginLeft: 11,
      paddingVertical: 0,
      paddingHorizontal: 0,
      fontSize: 14,
      color: "#0F172A",
    },

    eyeButton: {
      width: 32,
      height: 40,
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 4,
    },

    /* ========================================================
       FORGOT PASSWORD
    ======================================================== */

    forgotButton: {
      alignSelf: "flex-end",
      paddingVertical: 5,
      paddingLeft: 10,
      marginTop: -3,
      marginBottom: 16,
    },

    forgotText: {
      fontSize: 13,
      color: "#2563EB",
    },

    /* ========================================================
       SIGN IN
    ======================================================== */

    signInButton: {
      height: 56,
      borderRadius: 13,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 1,
    },

    signInButtonLoading: {
      opacity: 0.85,
    },

    signInButtonPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    signInText: {
      fontSize: 15,
      color: "#FFFFFF",
    },

    /* ========================================================
       OR
    ======================================================== */

    orRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 18,
    },

    orLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "#E2E8F0",
    },

    orText: {
      marginHorizontal: 13,
      fontSize: 11,
      color: "#64748B",
    },

    /* ========================================================
       SOCIAL BUTTONS
    ======================================================== */

    socialButton: {
      height: 53,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#D9E0EA",
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 11,
    },

    socialPressed: {
      backgroundColor:
        "#F8FAFC",
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    socialText: {
      marginLeft: 10,
      fontSize: 13.5,
      color: "#0F172A",
    },

    googleIcon: {
      width: 23,
      height: 23,
      alignItems: "center",
      justifyContent:
        "center",
    },

    googleG: {
      fontSize: 19,
      color: "#4285F4",
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: "auto",
      paddingTop: 22,
    },

    footerText: {
      fontSize: 13,
      color: "#64748B",
    },

    createText: {
      marginLeft: 5,
      fontSize: 13,
      color: "#2563EB",
    },
  });