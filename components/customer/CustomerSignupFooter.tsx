import React, {
  memo,
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
  AppButton,
  AppText,
} from "@/components/ui";

import TermsCheckbox from "@/components/auth/TermsCheckbox";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  acceptedTerms: boolean;

  setAcceptedTerms: (
    value: boolean,
  ) => void;

  loading: boolean;

  onSubmit: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerSignupFooter({
  acceptedTerms,
  setAcceptedTerms,
  loading,
  onSubmit,
}: Props) {
  const handleToggleTerms =
    useCallback(() => {
      setAcceptedTerms(
        !acceptedTerms,
      );
    }, [
      acceptedTerms,
      setAcceptedTerms,
    ]);

  const handleLogin =
    useCallback(() => {
      router.push(
        "/(auth)/login",
      );
    }, []);

  return (
    <>
      <View
        style={
          styles.terms
        }
      >
        <TermsCheckbox
          checked={
            acceptedTerms
          }
          onToggle={
            handleToggleTerms
          }
          variant="customer"
        />
      </View>

      <AppButton
        title="Create Customer Account"
        role="customer"
        variant="primary"
        size="md"
        loading={
          loading
        }
        disabled={
          !acceptedTerms ||
          loading
        }
        onPress={
          onSubmit
        }
      />

      <View
        style={
          styles.loginSection
        }
      >
        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.loginPrompt
          }
        >
          Already have an account?
        </AppText>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Login to your account"
          hitSlop={8}
          onPress={
            handleLogin
          }
          style={({
            pressed,
          }) => [
            styles.loginButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.loginText
            }
          >
            Login
          </AppText>
        </Pressable>
      </View>
    </>
  );
}

export default memo(
  CustomerSignupFooter,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    terms: {
      marginBottom:
        FixxamTokens.spacing.lg,
    },

    loginSection: {
      marginTop:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",
    },

    loginPrompt: {
      color:
        Colors.textSecondary,
    },

    loginButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      minWidth:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xxs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    loginText: {
      color:
        CustomerColors.primary,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });